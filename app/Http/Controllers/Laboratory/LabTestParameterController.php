<?php

namespace App\Http\Controllers\Laboratory;

use App\Http\Controllers\Controller;
use App\Models\Laboratory\LabTestParameter;
use App\Models\Laboratory\LabPanel;
use App\Models\Laboratory\LabParameterRange;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class LabTestParameterController extends Controller
{
    public function index(Request $request)
    {
        // Often easier to view parameters filtered by Panel
        $query = LabTestParameter::with('panel');

        if ($request->panel_id) {
            $query->where('lab_panel_id', $request->panel_id);
        }

        return Inertia::render('SystemConfiguration/LabSetup/Parameters/Index', [
            'parameters' => $query->orderBy('lab_panel_id')->orderBy('sort_order')->paginate(15),
            'panels' => LabPanel::select('id', 'name')->get(), // For filter dropdown
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/LabSetup/Parameters/Create', [
            'panels' => LabPanel::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'lab_panel_id' => 'required|exists:lab_panels,id',
            'name' => 'required|string|max:255',
            'units' => 'nullable|string|max:50',
            'result_type' => 'required|integer|in:1,2,3', // 1:Numeric, 2:Text, 3:Select
            'sort_order' => 'integer',
            
            // Optional: Ranges input (Array or individual fields)
            'male_min' => 'nullable|numeric',
            'male_max' => 'nullable|numeric',
            'female_min' => 'nullable|numeric',
            'female_max' => 'nullable|numeric',
        ]);

        DB::transaction(function () use ($validated) {
            // 1. Create Parameter
            $parameter = LabTestParameter::create([
                'lab_panel_id' => $validated['lab_panel_id'],
                'name' => $validated['name'],
                'units' => $validated['units'],
                'result_type' => $validated['result_type'],
                'sort_order' => $validated['sort_order'] ?? 0,
            ]);

            // 2. Create Default Range (if numeric and provided)
            if ($validated['result_type'] == 1) {
                LabParameterRange::create([
                    'lab_test_parameter_id' => $parameter->id,
                    'age_min_days' => 0,
                    'age_max_days' => 36500, // All ages default
                    'male_min' => $validated['male_min'] ?? 0,
                    'male_max' => $validated['male_max'] ?? 0,
                    'female_min' => $validated['female_min'] ?? 0,
                    'female_max' => $validated['female_max'] ?? 0,
                ]);
            }
        });

        return redirect()->route('systemconfiguration6.parameters.index')
            ->with('success', 'Test Parameter added successfully.');
    }

    public function edit($id)
    {
        // Load parameter with its ranges
        $parameter = LabTestParameter::with('ranges')->findOrFail($id);
        
        return Inertia::render('SystemConfiguration/LabSetup/Parameters/Edit', [
            'parameter' => $parameter,
            'panels' => LabPanel::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $parameter = LabTestParameter::findOrFail($id);
        
        $validated = $request->validate([
            'lab_panel_id' => 'required|exists:lab_panels,id',
            'name' => 'required|string|max:255',
            'units' => 'nullable|string|max:50',
            'result_type' => 'required|integer',
            'sort_order' => 'integer',
        ]);

        $parameter->update($validated);
        
        // Note: Update ranges logic would go here (usually updating the child table)

        return redirect()->route('systemconfiguration6.parameters.index')->with('success', 'Updated.');
    }

    public function destroy($id)
    {
        LabTestParameter::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Parameter deleted.');
    }
}