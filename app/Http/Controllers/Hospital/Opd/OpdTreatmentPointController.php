<?php

namespace App\Http\Controllers\Hospital\Opd;

use App\Http\Controllers\Controller;
use App\Models\Opd\OpdTreatmentPoint;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OpdTreatmentPointController extends Controller
{
    public function index(Request $request)
    {
        $query = OpdTreatmentPoint::query();

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        return Inertia::render('SystemConfiguration/FacilitySetup/TreatmentPoints/Index', [
            'points' => $query->latest()->paginate(10),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/FacilitySetup/TreatmentPoints/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:opd_treatmentpoints,name',
            // Add other fields if you added them to the migration (e.g. type, department)
        ]);

        OpdTreatmentPoint::create($validated);

        return redirect()->route('systemconfiguration5.treatmentpoints.index')
            ->with('success', 'Treatment Point created successfully.');
    }

    public function edit($id)
    {
        $point = OpdTreatmentPoint::findOrFail($id);
        return Inertia::render('SystemConfiguration/FacilitySetup/TreatmentPoints/Edit', [
            'point' => $point
        ]);
    }

    public function update(Request $request, $id)
    {
        $point = OpdTreatmentPoint::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:opd_treatmentpoints,name,'.$id,
        ]);

        $point->update($validated);

        return redirect()->route('systemconfiguration5.treatmentpoints.index')
            ->with('success', 'Treatment Point updated successfully.');
    }

    public function destroy($id)
    {
        try {
            OpdTreatmentPoint::findOrFail($id)->delete();
            return redirect()->back()->with('success', 'Treatment Point deleted.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Cannot delete. Point is linked to visits.']);
        }
    }
}