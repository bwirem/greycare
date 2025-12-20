<?php

namespace App\Http\Controllers\HumanResource\Setup;

use App\Http\Controllers\Controller;
use App\Models\HumanResource\PayInsuranceType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayInsuranceTypeController extends Controller
{
    /**
     * Display a listing of Insurance Types (e.g. NHIF, UAP).
     */
    public function index(Request $request)
    {
        $query = PayInsuranceType::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('code', 'like', '%' . $request->search . '%');
        }

        $insuranceTypes = $query->orderBy('name', 'asc')->paginate(10);

        return Inertia::render('SystemConfiguration/PayrollSetup/Insurance/Index', [
            'insuranceTypes' => $insuranceTypes,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('SystemConfiguration/PayrollSetup/Insurance/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:pay_insurance_types',
            'name' => 'required|string|max:255',
            'rate' => 'required|numeric|min:0|max:100', // Percentage calculation
            'fixed_amount' => 'required|numeric|min:0', // Fixed deduction
        ]);

        PayInsuranceType::create($validated);

        return redirect()->route('systemconfiguration12.insurance.index')
            ->with('success', 'Insurance Type created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PayInsuranceType $insurance)
    {
        return Inertia::render('SystemConfiguration/PayrollSetup/Insurance/Edit', [
            'insurance' => $insurance,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PayInsuranceType $insurance)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:pay_insurance_types,code,' . $insurance->id,
            'name' => 'required|string|max:255',
            'rate' => 'required|numeric|min:0|max:100',
            'fixed_amount' => 'required|numeric|min:0',
        ]);

        $insurance->update($validated);

        return redirect()->route('systemconfiguration12.insurance.index')
            ->with('success', 'Insurance Type updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PayInsuranceType $insurance)
    {
        $insurance->delete();

        return redirect()->route('systemconfiguration12.insurance.index')
            ->with('success', 'Insurance Type deleted successfully.');
    }
}