<?php

namespace App\Http\Controllers\HumanResource\Setup;

use App\Http\Controllers\Controller;
use App\Models\HumanResource\PayTaxBracket; // Ensure Model exists
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayTaxBracketController extends Controller
{
    public function index(Request $request)
    {
        $query = PayTaxBracket::query();
        
        // No search needed usually for tax brackets as they are few, but kept structure
        $brackets = $query->orderBy('lower_limit', 'asc')->paginate(10);

        return Inertia::render('SystemConfiguration/PayrollSetup/TaxBrackets/Index', [
            'brackets' => $brackets,
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/PayrollSetup/TaxBrackets/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'lower_limit' => 'required|numeric|min:0',
            'upper_limit' => 'nullable|numeric|gt:lower_limit',
            'rate' => 'required|numeric|min:0|max:100',
            'fixed_amount' => 'required|numeric|min:0',
        ]);

        PayTaxBracket::create($validated);

        return redirect()->route('systemconfiguration12.tax.index')
            ->with('success', 'Tax Bracket added successfully.');
    }

    public function edit(PayTaxBracket $tax)
    {
        return Inertia::render('SystemConfiguration/PayrollSetup/TaxBrackets/Edit', [
            'tax' => $tax,
        ]);
    }

    public function update(Request $request, PayTaxBracket $tax)
    {
        $validated = $request->validate([
            'lower_limit' => 'required|numeric|min:0',
            'upper_limit' => 'nullable|numeric|gt:lower_limit',
            'rate' => 'required|numeric|min:0|max:100',
            'fixed_amount' => 'required|numeric|min:0',
        ]);

        $tax->update($validated);

        return redirect()->route('systemconfiguration12.tax.index')
            ->with('success', 'Tax Bracket updated successfully.');
    }

    public function destroy(PayTaxBracket $tax)
    {
        $tax->delete();
        return redirect()->route('systemconfiguration12.tax.index')
            ->with('success', 'Tax Bracket removed successfully.');
    }
}