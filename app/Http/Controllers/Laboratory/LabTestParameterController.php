<?php

namespace App\Http\Controllers\Laboratory;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

// Models
use App\Models\Laboratory\LabTestParameter;
use App\Models\Laboratory\LabPanel;
use App\Models\Laboratory\LabParameterRange;
use App\Models\Laboratory\LabParameterDropdown;

class LabTestParameterController extends Controller
{
    /**
     * Display a listing of the parameters.
     */
    public function index(Request $request)
    {
        $query = LabTestParameter::with('panel');

        // Allow filtering by Panel
        if ($request->filled('panel_id')) {
            $query->where('lab_panel_id', $request->panel_id);
        }

        // Allow searching by Name
        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        return Inertia::render('SystemConfiguration/LabSetup/Parameters/Index', [
            'parameters' => $query->orderBy('lab_panel_id')->orderBy('sort_order')->paginate(15)->withQueryString(),
            'panels' => LabPanel::select('id', 'name')->orderBy('name')->get(),
            'filters' => $request->only(['search', 'panel_id']),
        ]);
    }

    /**
     * Show the form for creating a new parameter.
     */
    public function create()
    {
        return Inertia::render('SystemConfiguration/LabSetup/Parameters/Create', [
            'panels' => LabPanel::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    /**
     * Store a newly created parameter in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'lab_panel_id' => 'required|exists:lab_panels,id',
            'name' => 'required|string|max:255',
            'units' => 'nullable|string|max:50',
            'result_type' => 'required|integer|in:1,2,3', // 1:Numeric, 2:Text, 3:Dropdown
            'sort_order' => 'nullable|integer',
            
            // Ranges (Type 1)
            'male_min' => 'nullable|numeric',
            'male_max' => 'nullable|numeric',
            'female_min' => 'nullable|numeric',
            'female_max' => 'nullable|numeric',

            // Dropdown Options (Type 3) - Expecting array of strings
            'dropdown_options' => 'nullable|array',
            'dropdown_options.*' => 'string|max:255',
            'machine_code' => 'nullable|string|max:50', // Validate the new field
        ]);

        try {
            DB::transaction(function () use ($validated) {
                // 1. Create the Main Parameter Record
                $parameter = LabTestParameter::create([
                    'lab_panel_id' => $validated['lab_panel_id'],
                    'name'         => $validated['name'],
                    'units'        => $validated['units'],
                    'result_type'  => $validated['result_type'],
                    'sort_order'   => $validated['sort_order'] ?? 0,
                    'code'         => strtoupper(substr($validated['name'], 0, 3)) . rand(100,999), // Simple code gen
                    'machine_code' => $validated['machine_code'] ?? null, // Save the new field
                ]);

                // 2. Handle Numeric Ranges (Result Type 1)
                if ($validated['result_type'] == 1) {
                    LabParameterRange::create([
                        'lab_test_parameter_id' => $parameter->id,
                        'age_min_days' => 0,
                        'age_max_days' => 36500, // Default to all ages (0-100 yrs)
                        'male_min'     => $validated['male_min'] ?? 0,
                        'male_max'     => $validated['male_max'] ?? 0,
                        'female_min'   => $validated['female_min'] ?? 0,
                        'female_max'   => $validated['female_max'] ?? 0,
                    ]);
                }

                // 3. Handle Dropdown Options (Result Type 3)
                if ($validated['result_type'] == 3 && !empty($validated['dropdown_options'])) {
                    foreach ($validated['dropdown_options'] as $option) {
                        LabParameterDropdown::create([
                            'lab_test_parameter_id' => $parameter->id,
                            'value'                 => $option
                        ]);
                    }
                }
            });

            return redirect()->route('systemconfiguration6.parameters.index')
                ->with('success', 'Test Parameter created successfully.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create parameter: ' . $e->getMessage()]);
        }
    }

    /**
     * Show the form for editing the specified parameter.
     */
    public function edit($id)
    {
        // Eager load ranges and dropdowns so the form can pre-fill
        $parameter = LabTestParameter::with(['ranges', 'dropdowns'])->findOrFail($id);
        
        return Inertia::render('SystemConfiguration/LabSetup/Parameters/Edit', [
            'parameter' => $parameter,
            'panels' => LabPanel::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    /**
     * Update the specified parameter in storage.
     */
    public function update(Request $request, $id)
    {
        $parameter = LabTestParameter::findOrFail($id);
        
        $validated = $request->validate([
            'lab_panel_id' => 'required|exists:lab_panels,id',
            'name' => 'required|string|max:255',
            'units' => 'nullable|string|max:50',
            'result_type' => 'required|integer|in:1,2,3',
            'sort_order' => 'nullable|integer',
            
            // Ranges
            'male_min' => 'nullable|numeric',
            'male_max' => 'nullable|numeric',
            'female_min' => 'nullable|numeric',
            'female_max' => 'nullable|numeric',

            // Dropdown Options
            'dropdown_options' => 'nullable|array',
            'dropdown_options.*' => 'string|max:255',
            'machine_code' => 'nullable|string|max:50', // Validate the new field

        ]);

        try {
            DB::transaction(function () use ($parameter, $validated) {
                // 1. Update Main Record
                $parameter->update([
                    'lab_panel_id' => $validated['lab_panel_id'],
                    'name'         => $validated['name'],
                    'units'        => $validated['units'],
                    'result_type'  => $validated['result_type'],
                    'sort_order'   => $validated['sort_order'] ?? 0,
                    'machine_code' => $validated['machine_code'] ?? null, // Update the new field
                ]);

                // 2. Handle Numeric Ranges (Type 1)
                if ($validated['result_type'] == 1) {
                    // Update or Create the default range record
                    $range = LabParameterRange::firstOrNew(['lab_test_parameter_id' => $parameter->id]);
                    $range->age_min_days = 0;
                    $range->age_max_days = 36500;
                    $range->male_min     = $validated['male_min'] ?? 0;
                    $range->male_max     = $validated['male_max'] ?? 0;
                    $range->female_min   = $validated['female_min'] ?? 0;
                    $range->female_max   = $validated['female_max'] ?? 0;
                    $range->save();

                    // Cleanup: Remove dropdowns if they exist (type switch cleanup)
                    $parameter->dropdowns()->delete();
                }

                // 3. Handle Dropdowns (Type 3)
                elseif ($validated['result_type'] == 3) {
                    // Sync strategy: Delete all old -> Create new
                    // This is simpler than matching IDs for simple string lists
                    $parameter->dropdowns()->delete();

                    if (!empty($validated['dropdown_options'])) {
                        foreach ($validated['dropdown_options'] as $option) {
                            LabParameterDropdown::create([
                                'lab_test_parameter_id' => $parameter->id,
                                'value'                 => $option
                            ]);
                        }
                    }

                    // Cleanup: Remove ranges if they exist (type switch cleanup)
                    $parameter->ranges()->delete();
                } 
                
                // 4. Handle Text (Type 2)
                else {
                    // Cleanup both if switching to simple text
                    $parameter->ranges()->delete();
                    $parameter->dropdowns()->delete();
                }
            });

            return redirect()->route('systemconfiguration6.parameters.index')
                ->with('success', 'Test Parameter updated successfully.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update parameter: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified parameter from storage.
     */
    public function destroy($id)
    {
        try {
            $parameter = LabTestParameter::findOrFail($id);
            // Cascading deletes on DB level (foreign keys) should handle ranges/dropdowns,
            // but we can force it here just in case.
            $parameter->delete(); 

            return redirect()->back()->with('success', 'Parameter deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Cannot delete parameter. It might be in use.']);
        }
    }
}