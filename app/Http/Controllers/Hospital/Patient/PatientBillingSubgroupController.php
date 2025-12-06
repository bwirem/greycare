<?php

namespace App\Http\Controllers\Hospital\Patient;

use App\Http\Controllers\Controller;
use App\Models\Patient\PatientBillingSubgroup;
use App\Models\Patient\PatientBillingGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PatientBillingSubgroupController extends Controller
{
    public function index(Request $request)
    {
        $query = PatientBillingSubgroup::with('group');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        return Inertia::render('SystemConfiguration/FacilitySetup/BillingSubgroups/Index', [
            'subgroups' => $query->latest()->paginate(10),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/FacilitySetup/BillingSubgroups/Create', [
            'billingGroups' => PatientBillingGroup::select('id', 'name')->orderBy('name')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'billinggroup_id' => 'required|exists:patient_billing_groups,id', // Matches migration
            'description' => 'nullable|string|max:255',
        ]);

        PatientBillingSubgroup::create($validated);

        return redirect()->route('systemconfiguration5.billingsubgroups.index')
            ->with('success', 'Billing Subgroup created successfully.');
    }

    public function edit($id)
    {
        return Inertia::render('SystemConfiguration/FacilitySetup/BillingSubgroups/Edit', [
            'subgroup' => PatientBillingSubgroup::findOrFail($id),
            'billingGroups' => PatientBillingGroup::select('id', 'name')->orderBy('name')->get()
        ]);
    }

    public function update(Request $request, $id)
    {
        $subgroup = PatientBillingSubgroup::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'billinggroup_id' => 'required|exists:patient_billing_groups,id',
            'description' => 'nullable|string|max:255',
        ]);

        $subgroup->update($validated);

        return redirect()->route('systemconfiguration5.billingsubgroups.index')
            ->with('success', 'Billing Subgroup updated successfully.');
    }

    public function destroy($id)
    {
        try {
            PatientBillingSubgroup::findOrFail($id)->delete();
            return redirect()->back()->with('success', 'Subgroup deleted.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Cannot delete subgroup. It is in use.']);
        }
    }
}