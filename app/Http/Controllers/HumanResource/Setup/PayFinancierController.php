<?php

namespace App\Http\Controllers\HumanResource\Setup;

use App\Http\Controllers\Controller;
use App\Models\HumanResource\PayFinancier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayFinancierController extends Controller
{
    /**
     * Display a listing of Financiers (Banks/Saccos for Loans).
     */
    public function index(Request $request)
    {
        $query = PayFinancier::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('code', 'like', '%' . $request->search . '%');
        }

        $financiers = $query->orderBy('name', 'asc')->paginate(10);

        return Inertia::render('SystemConfiguration/PayrollSetup/Financiers/Index', [
            'financiers' => $financiers,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('SystemConfiguration/PayrollSetup/Financiers/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:pay_financiers',
            'name' => 'required|string|max:255',
            'contact_info' => 'nullable|string|max:255',
        ]);

        PayFinancier::create($validated);

        return redirect()->route('systemconfiguration12.financiers.index')
            ->with('success', 'Financier created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PayFinancier $financier)
    {
        return Inertia::render('SystemConfiguration/PayrollSetup/Financiers/Edit', [
            'financier' => $financier,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PayFinancier $financier)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:pay_financiers,code,' . $financier->id,
            'name' => 'required|string|max:255',
            'contact_info' => 'nullable|string|max:255',
        ]);

        $financier->update($validated);

        return redirect()->route('systemconfiguration12.financiers.index')
            ->with('success', 'Financier updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PayFinancier $financier)
    {
        $financier->delete();

        return redirect()->route('systemconfiguration12.financiers.index')
            ->with('success', 'Financier deleted successfully.');
    }
}