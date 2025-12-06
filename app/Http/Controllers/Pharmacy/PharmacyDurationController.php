<?php

namespace App\Http\Controllers\Pharmacy;

use App\Http\Controllers\Controller;
use App\Models\Pharmacy\PharmacyDuration;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PharmacyDurationController extends Controller
{
    public function index()
    {
        return Inertia::render('SystemConfiguration/PharmacySetup/Durations/Index', [
            'durations' => PharmacyDuration::latest()->paginate(10)
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/PharmacySetup/Durations/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255', // e.g. "1 Week"
            'code' => 'required|string|max:20',  // e.g. "1/52"
            'days' => 'required|integer|min:1',  // e.g. 7
            'is_active' => 'boolean',
        ]);

        PharmacyDuration::create($validated);

        return redirect()->route('systemconfiguration9.durations.index')
            ->with('success', 'Duration created successfully.');
    }

    public function edit($id)
    {
        return Inertia::render('SystemConfiguration/PharmacySetup/Durations/Edit', [
            'duration' => PharmacyDuration::findOrFail($id)
        ]);
    }

    public function update(Request $request, $id)
    {
        $duration = PharmacyDuration::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20',
            'days' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $duration->update($validated);

        return redirect()->route('systemconfiguration9.durations.index')
            ->with('success', 'Duration updated successfully.');
    }

    public function destroy($id)
    {
        PharmacyDuration::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Duration deleted.');
    }
}