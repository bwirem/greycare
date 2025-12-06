<?php

namespace App\Http\Controllers\Pharmacy;

use App\Http\Controllers\Controller;
use App\Models\Pharmacy\PharmacyFrequency;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PharmacyFrequencyController extends Controller
{
    public function index()
    {
        return Inertia::render('SystemConfiguration/PharmacySetup/Frequencies/Index', [
            'frequencies' => PharmacyFrequency::latest()->paginate(10)
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/PharmacySetup/Frequencies/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20',
            'value' => 'required|numeric|min:0', // The multiplier
        ]);

        PharmacyFrequency::create($validated);
        return redirect()->route('systemconfiguration9.frequencies.index')->with('success', 'Frequency added.');
    }
    
    // Implement edit/update/destroy similarly...
    public function edit($id) {
        return Inertia::render('SystemConfiguration/PharmacySetup/Frequencies/Edit', [
            'frequency' => PharmacyFrequency::findOrFail($id)
        ]);
    }

    public function update(Request $request, $id) {
        $freq = PharmacyFrequency::findOrFail($id);
        $freq->update($request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20',
            'value' => 'required|numeric',
        ]));
        return redirect()->route('systemconfiguration9.frequencies.index')->with('success', 'Updated.');
    }
}