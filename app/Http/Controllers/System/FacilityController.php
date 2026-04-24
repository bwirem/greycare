<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\System\Facility;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FacilityController extends Controller
{
    public function index(Request $request)
    {
        $query = Facility::query();

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                  ->orWhere('location', 'like', "%{$request->search}%");
        }

        return Inertia::render('SystemConfiguration/FacilitySetup/Facilities/Index', [
            'facilities' => $query->latest()->paginate(10),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/FacilitySetup/Facilities/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'is_active' => 'boolean',
        ]);

        // Default is_active to true if not present in request (though checkbox usually handles this)
        $validated['is_active'] = $request->boolean('is_active', true);

        Facility::create($validated);

        return redirect()->route('systemconfiguration5.facilities.index')
            ->with('success', 'Facility created successfully.');
    }

    public function edit($id)
    {
        return Inertia::render('SystemConfiguration/FacilitySetup/Facilities/Edit', [
            'facility' => Facility::findOrFail($id)
        ]);
    }

    public function update(Request $request, $id)
    {
        $facility = Facility::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'is_active' => 'boolean',
        ]);

        $validated['is_active'] = $request->boolean('is_active', true);

        $facility->update($validated);

        return redirect()->route('systemconfiguration5.facilities.index')
            ->with('success', 'Facility updated successfully.');
    }

    public function destroy($id)
    {
        try {
            Facility::findOrFail($id)->delete();
            return redirect()->back()->with('success', 'Facility deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Cannot delete facility. It is currently in use.']);
        }
    }
}