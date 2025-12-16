<?php

namespace App\Http\Controllers\Hospital\Patient;

use App\Http\Controllers\Controller;
use App\Models\Patient\PatientBillingGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PatientBillingGroupController extends Controller
{
    public function index(Request $request)
    {
        $query = PatientBillingGroup::query();

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%");
        }

        return Inertia::render('SystemConfiguration/FacilitySetup/BillingGroups/Index', [
            'groups' => $query->latest()->paginate(10),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/FacilitySetup/BillingGroups/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            //'code' => 'nullable|string|max:50',
            'pricecategory' => 'nullable|string|max:50',
            // Configuration Flags (Integers/Booleans based on your migration)
            'hasid' => 'boolean',
            'hasceiling' => 'boolean',
            'ceilingamount' => 'nullable|numeric',
            'isinsurance' => 'boolean',
            'isdefault' => 'boolean',
            'isexemption' => 'boolean',
            'inactive' => 'boolean',
            'url' => 'nullable|string|max:255',
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string|max:255',
        ]);

        PatientBillingGroup::create($validated);

        return redirect()->route('systemconfiguration5.billinggroups.index')
            ->with('success', 'Billing Group created successfully.');
    }

    public function edit($id)
    {
        $group = PatientBillingGroup::findOrFail($id);
        return Inertia::render('SystemConfiguration/FacilitySetup/BillingGroups/Edit', [
            'group' => $group
        ]);
    }

    public function update(Request $request, $id)
    {
        $group = PatientBillingGroup::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            //'code' => 'nullable|string|max:50',
            'pricecategory' => 'nullable|string|max:50',
            'hasid' => 'boolean',
            'hasceiling' => 'boolean',
            'ceilingamount' => 'nullable|numeric',
            'isinsurance' => 'boolean',
            'isdefault' => 'boolean',
            'isexemption' => 'boolean',
            'inactive' => 'boolean',
            'url' => 'nullable|string|max:255',
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string|max:255',
        ]);

        $group->update($validated);

        return redirect()->route('systemconfiguration5.billinggroups.index')
            ->with('success', 'Billing Group updated successfully.');
    }

    public function destroy($id)
    {
        try {
            $group = PatientBillingGroup::findOrFail($id);
            $group->delete();
            return redirect()->back()->with('success', 'Billing Group deleted.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Cannot delete group. It might be linked to patients.']);
        }
    }
}