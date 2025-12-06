<?php

namespace App\Http\Controllers\Radiology;

use App\Http\Controllers\Controller;
use App\Models\Radiology\RadProcedure;
use App\Models\Radiology\RadModality;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RadProcedureController extends Controller
{
    public function index(Request $request)
    {
        $query = RadProcedure::with('modality');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        return Inertia::render('SystemConfiguration/RadiologySetup/Procedures/Index', [
            'procedures' => $query->latest()->paginate(10),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/RadiologySetup/Procedures/Create', [
            'modalities' => RadModality::select('id', 'name')->where('is_active', true)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'rad_modality_id' => 'required|exists:rad_modalities,id',
            'body_part' => 'nullable|string|max:100',
            'contrast_required' => 'boolean',
            'duration_minutes' => 'integer|min:1',
            'bill_item_id' => 'nullable|integer'
        ]);

        RadProcedure::create($validated);

        return redirect()->route('systemconfiguration7.procedures.index')->with('success', 'Procedure created.');
    }

    public function edit($id)
    {
        return Inertia::render('SystemConfiguration/RadiologySetup/Procedures/Edit', [
            'procedure' => RadProcedure::findOrFail($id),
            'modalities' => RadModality::select('id', 'name')->where('is_active', true)->get(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $procedure = RadProcedure::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'rad_modality_id' => 'required|exists:rad_modalities,id',
            'body_part' => 'nullable|string|max:100',
            'contrast_required' => 'boolean',
            'duration_minutes' => 'integer|min:1',
            'bill_item_id' => 'nullable|integer'
        ]);

        $procedure->update($validated);

        return redirect()->route('systemconfiguration7.procedures.index')->with('success', 'Procedure updated.');
    }

    public function destroy($id)
    {
        RadProcedure::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Procedure deleted.');
    }
}