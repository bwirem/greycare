<?php

namespace App\Http\Controllers\Facility;
use App\Http\Controllers\Controller;

use App\Models\Facility\FacilityOption;
use App\Models\Accounting\ChartOfAccount;
use App\Models\Patient\PatientBillingGroup;
use App\Models\Ipd\IpdDischargeStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage; // Import Storage

class FacilityOptionController extends Controller
{
    /**
     * Display a listing of FacilityOptions.
     */
    public function index(Request $request)
    {
        $query = FacilityOption::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $facilityoptions = $query->orderBy('created_at', 'desc')->paginate(10);

        return inertia('SystemConfiguration/FacilitySetup/FacilityOptions/Index',[
            'facilityoptions' => $facilityoptions,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new FacilityOption.
     */
    public function create()
    {
        // Enforce Single Facility Option Rule (Optional, based on your logic)
        $facilityoption = FacilityOption::first();
        if ($facilityoption) {
            return redirect()->route('systemconfiguration5.facilityoptions.edit', $facilityoption->id);
        }

        $chartOfAccounts = ChartOfAccount::where('is_active', true)->orderBy('account_name')->get();
        $billinggroups = PatientBillingGroup::where('isinsurance', false)->orderBy('name')->get();
        $deathstatuses = IpdDischargeStatus::orderBy('name')->get();

        return inertia('SystemConfiguration/FacilitySetup/FacilityOptions/Create',[
            'chartOfAccounts' => $chartOfAccounts,
            'billinggroups' => $billinggroups,
            'deathstatuses' => $deathstatuses,
        ]);
    }

    /**
     * Store a newly created FacilityOption in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|string|max:255',
            'tin' => 'nullable|string|max:50',
            'vrn' => 'nullable|string|max:50',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Validate Image
            'chart_of_account_id' => 'nullable|integer|exists:chart_of_accounts,id',
            'default_cash_billing_group_id' => 'nullable|integer|exists:patient_billing_groups,id',
            'affectstockatcashier' => 'boolean',
            'doubleentryissuing' => 'boolean',
            'allownegativestock' => 'boolean',
            'show_register_button' => 'boolean',
            
            // Payment Gateway API Configuration Validation
            'cash_payment_control_number' => 'boolean', // New field for control number
            'corporate_id' => 'nullable|string|max:255',
            'token_id' => 'nullable|string|max:255',
            'access_token' => 'nullable|string',
            'registration_url' => 'nullable|url|max:255',
            'check_payment_url' => 'nullable|url|max:255',
            'crdb_payment_type' => 'nullable|string|max:50',
            'default_death_status_id' => 'nullable|integer|exists:ipd_discharge_statuses,id',
        ]);

        // Handle Logo Upload
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('facility_logos', 'public');
            $validated['logo_path'] = $path;
        }

        FacilityOption::create($validated);

        return redirect()->route('systemconfiguration5.facilityoptions.index')
            ->with('success', 'Facility option created successfully.');
    }

    /**
     * Show the form for editing the specified FacilityOption.
     */
    public function edit(FacilityOption $facilityoption)
    {
        $chartOfAccounts = ChartOfAccount::where('is_active', true)->orderBy('account_name')->get();
        $billinggroups = PatientBillingGroup::where('isinsurance', false)->orderBy('name')->get();
        $deathstatuses = IpdDischargeStatus::orderBy('name')->get();

        return inertia('SystemConfiguration/FacilitySetup/FacilityOptions/Edit',[
            'facilityoption' => $facilityoption,
            'chartOfAccounts' => $chartOfAccounts,
            'billinggroups' => $billinggroups,
            'deathstatuses' => $deathstatuses,
        ]);
    }

    /**
     * Update the specified FacilityOption in storage.
     */
    public function update(Request $request, FacilityOption $facilityoption)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|string|max:255',
            'tin' => 'nullable|string|max:50',
            'vrn' => 'nullable|string|max:50',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'chart_of_account_id' => 'nullable|integer|exists:chart_of_accounts,id',
            'default_cash_billing_group_id' => 'nullable|integer|exists:patient_billing_groups,id',
            'affectstockatcashier' => 'boolean',
            'doubleentryissuing' => 'boolean',
            'allownegativestock' => 'boolean',
            'show_register_button' => 'boolean',
            'cash_payment_control_number' => 'boolean', // New field for control number

            // Payment Gateway API Configuration Validation
            'corporate_id' => 'nullable|string|max:255',
            'token_id' => 'nullable|string|max:255',
            'access_token' => 'nullable|string',
            'registration_url' => 'nullable|url|max:255',
            'check_payment_url' => 'nullable|url|max:255',
            'crdb_payment_type' => 'nullable|string|max:50',
            'default_death_status_id' => 'nullable|integer|exists:ipd_discharge_statuses,id',
        ]);

        // Handle Logo Upload
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($facilityoption->logo_path && Storage::disk('public')->exists($facilityoption->logo_path)) {
                Storage::disk('public')->delete($facilityoption->logo_path);
            }
            
            $path = $request->file('logo')->store('facility_logos', 'public');
            $validated['logo_path'] = $path;
        }

        $facilityoption->update($validated);

        return redirect()->route('systemconfiguration5.facilityoptions.index')
            ->with('success', 'Facility option updated successfully.');
    }
}