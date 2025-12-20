<?php

namespace App\Http\Controllers\HumanResource\Setup;

use App\Http\Controllers\Controller;
use App\Models\HumanResource\HrmBank; // Ensure you create this Model
use Illuminate\Http\Request;
use Inertia\Inertia;

class HrmBankController extends Controller
{
    public function index(Request $request)
    {
        $query = HrmBank::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('code', 'like', '%' . $request->search . '%');
        }

        $banks = $query->orderBy('name', 'asc')->paginate(10);

        return Inertia::render('SystemConfiguration/HrSetup/Banks/Index', [
            'banks' => $banks,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/HrSetup/Banks/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:hrm_banks',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        HrmBank::create($validated);

        return redirect()->route('systemconfiguration11.banks.index')
            ->with('success', 'Bank created successfully.');
    }

    public function edit(HrmBank $bank)
    {
        return Inertia::render('SystemConfiguration/HrSetup/Banks/Edit', [
            'bank' => $bank,
        ]);
    }

    public function update(Request $request, HrmBank $bank)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:hrm_banks,code,' . $bank->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $bank->update($validated);

        return redirect()->route('systemconfiguration11.banks.index')
            ->with('success', 'Bank updated successfully.');
    }

    public function destroy(HrmBank $bank)
    {
        $bank->delete();
        return redirect()->route('systemconfiguration11.banks.index')
            ->with('success', 'Bank deleted successfully.');
    }
}