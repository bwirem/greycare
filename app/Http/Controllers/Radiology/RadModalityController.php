<?php

namespace App\Http\Controllers\Radiology;

use App\Http\Controllers\Controller;
use App\Models\Radiology\RadModality;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RadModalityController extends Controller
{
    public function index()
    {
        return Inertia::render('SystemConfiguration/RadiologySetup/Modalities/Index', [
            'modalities' => RadModality::latest()->paginate(10)
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/RadiologySetup/Modalities/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:rad_modalities,code',
            'ae_title' => 'nullable|string|max:50',
            'ip_address' => 'nullable|ipv4',
            'port' => 'nullable|string|max:10',
            'room_identifier' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        RadModality::create($validated);

        return redirect()->route('systemconfiguration7.modalities.index')->with('success', 'Modality created.');
    }

    public function edit($id)
    {
        return Inertia::render('SystemConfiguration/RadiologySetup/Modalities/Edit', [
            'modality' => RadModality::findOrFail($id)
        ]);
    }

    public function update(Request $request, $id)
    {
        $modality = RadModality::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:rad_modalities,code,'.$id,
            'ae_title' => 'nullable|string|max:50',
            'ip_address' => 'nullable|ipv4',
            'port' => 'nullable|string|max:10',
            'room_identifier' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $modality->update($validated);

        return redirect()->route('systemconfiguration7.modalities.index')->with('success', 'Modality updated.');
    }

    public function destroy($id)
    {
        RadModality::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Modality deleted.');
    }
}