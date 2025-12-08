<?php

namespace App\Http\Controllers\Diagnosis;

use App\Http\Controllers\Controller;
use App\Models\Diagnosis\DxtDiagnosesGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DxtDiagnosesGroupController extends Controller
{
    public function index(Request $request)
    {
        $query = DxtDiagnosesGroup::query();

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        return Inertia::render('SystemConfiguration/FacilitySetup/DiagnosisGroups/Index', [
            'groups' => $query->orderBy('name')->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
            'success' => session('success'),
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/FacilitySetup/DiagnosisGroups/Create');
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255|unique:dxt_diagnoses_groups,name']);

        DxtDiagnosesGroup::create($request->only('name'));

        return redirect()->route('systemconfiguration5.diagnosisgroups.index')
            ->with('success', 'Group created successfully.');
    }

    public function edit($id)
    {
        $group = DxtDiagnosesGroup::findOrFail($id);
        return Inertia::render('SystemConfiguration/FacilitySetup/DiagnosisGroups/Edit', ['group' => $group]);
    }

    public function update(Request $request, $id)
    {
        $group = DxtDiagnosesGroup::findOrFail($id);
        $request->validate(['name' => 'required|string|max:255|unique:dxt_diagnoses_groups,name,' . $id]);

        $group->update($request->only('name'));

        return redirect()->route('systemconfiguration5.diagnosisgroups.index')
            ->with('success', 'Group updated successfully.');
    }

    public function destroy($id)
    {
        try {
            $group = DxtDiagnosesGroup::findOrFail($id);
            // Check dependencies (ICD, Opd, etc)
            if($group->icdDiagnoses()->exists()) {
                 return back()->withErrors(['error' => 'Cannot delete group. It is used by diagnoses.']);
            }
            $group->delete();
            return back()->with('success', 'Group deleted.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Error deleting group.']);
        }
    }
}