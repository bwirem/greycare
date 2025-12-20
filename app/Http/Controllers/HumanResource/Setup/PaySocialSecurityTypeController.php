<?php

namespace App\Http\Controllers\HumanResource\Setup;

use App\Http\Controllers\Controller;
use App\Models\HumanResource\PaySocialSecurityType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaySocialSecurityTypeController extends Controller
{
    /**
     * Display a listing of Social Security Types (e.g. NSSF).
     */
    public function index(Request $request)
    {
        $query = PaySocialSecurityType::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('code', 'like', '%' . $request->search . '%');
        }

        $socialTypes = $query->orderBy('name', 'asc')->paginate(10);

        return Inertia::render('SystemConfiguration/PayrollSetup/SocialSecurity/Index', [
            'socialTypes' => $socialTypes,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('SystemConfiguration/PayrollSetup/SocialSecurity/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:pay_social_security_types',
            'name' => 'required|string|max:255',
            'employee_rate' => 'required|numeric|min:0|max:100', // Percentage
            'employer_rate' => 'required|numeric|min:0|max:100', // Percentage
            'max_deductible_amount' => 'nullable|numeric|min:0',
        ]);

        PaySocialSecurityType::create($validated);

        return redirect()->route('systemconfiguration12.social.index')
            ->with('success', 'Social Security Type created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PaySocialSecurityType $social)
    {
        return Inertia::render('SystemConfiguration/PayrollSetup/SocialSecurity/Edit', [
            'social' => $social,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PaySocialSecurityType $social)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:pay_social_security_types,code,' . $social->id,
            'name' => 'required|string|max:255',
            'employee_rate' => 'required|numeric|min:0|max:100',
            'employer_rate' => 'required|numeric|min:0|max:100',
            'max_deductible_amount' => 'nullable|numeric|min:0',
        ]);

        $social->update($validated);

        return redirect()->route('systemconfiguration12.social.index')
            ->with('success', 'Social Security Type updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PaySocialSecurityType $social)
    {
        $social->delete();

        return redirect()->route('systemconfiguration12.social.index')
            ->with('success', 'Social Security Type deleted successfully.');
    }
}