<?php

namespace App\Http\Controllers\Laboratory;

use App\Http\Controllers\Controller;
use App\Models\Laboratory\LabPanel;
use App\Models\Laboratory\LabCategory;
use App\Models\Laboratory\LabNatureOfSample;
// use App\Models\Billing\BillItem; // Import your Billing Item Model here
use Illuminate\Http\Request;
use Inertia\Inertia;

class LabPanelController extends Controller
{
    public function index(Request $request)
    {
        $query = LabPanel::with(['category', 'defaultSample']);

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        return Inertia::render('SystemConfiguration/LabSetup/Panels/Index', [
            'panels' => $query->latest()->paginate(10),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/LabSetup/Panels/Create', [
            'categories' => LabCategory::select('id', 'name')->get(),
            'samples' => LabNatureOfSample::select('id', 'name')->get(),
            // 'billItems' => BillItem::select('id', 'item_name')->get(), // Populate if billing exists
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'lab_category_id' => 'required|exists:lab_categories,id',
            'lab_nature_of_sample_id' => 'nullable|exists:lab_nature_of_samples,id',
            'bill_item_id' => 'nullable|integer', // Validate against bill_items table if exists
            'is_available' => 'boolean',
        ]);

        LabPanel::create($validated);

        return redirect()->route('systemconfiguration6.panels.index')
            ->with('success', 'Lab Test Panel created successfully.');
    }

    public function edit($id)
    {
        $panel = LabPanel::findOrFail($id);
        
        return Inertia::render('SystemConfiguration/LabSetup/Panels/Edit', [
            'panel' => $panel,
            'categories' => LabCategory::select('id', 'name')->get(),
            'samples' => LabNatureOfSample::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $panel = LabPanel::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'lab_category_id' => 'required|exists:lab_categories,id',
            'lab_nature_of_sample_id' => 'nullable|exists:lab_nature_of_samples,id',
            'bill_item_id' => 'nullable|integer',
            'is_available' => 'boolean',
        ]);

        $panel->update($validated);

        return redirect()->route('systemconfiguration6.panels.index')->with('success', 'Panel updated.');
    }

    public function destroy($id)
    {
        LabPanel::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Panel deleted.');
    }
}