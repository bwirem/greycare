<?php

namespace App\Http\Controllers\Mortuary;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Mortuary\Mortuary;

class MortuaryController extends Controller
{
    /**
     * Display a listing of the mortuaries.
     */
    public function index(Request $request)
    {
        $query = Mortuary::query();

        // Handle Search
        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('type', 'like', '%' . $request->search . '%');
        }

        return Inertia::render('SystemConfiguration/MortuarySetup/Mortuaries/Index', [
            'mortuaries' => $query->orderBy('name')->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
            'success' => session('success'),
        ]);
    }

    /**
     * Show the form for creating a new mortuary.
     */
    public function create()
    {
        return Inertia::render('SystemConfiguration/MortuarySetup/Mortuaries/Create');
    }

    /**
     * Store a newly created mortuary in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:mortuaries,name',
            'type' => 'nullable|string|max:100',
        ]);

        Mortuary::create($validated);

        return redirect()->route('systemconfiguration16.mortuaries.index')
            ->with('success', 'Mortuary Facility created successfully.');
    }

    /**
     * Show the form for editing the specified mortuary.
     */
    public function edit(Mortuary $mortuary)
    {
        return Inertia::render('SystemConfiguration/MortuarySetup/Mortuaries/Edit', [
            'mortuary' => $mortuary
        ]);
    }

    /**
     * Update the specified mortuary in storage.
     */
    public function update(Request $request, Mortuary $mortuary)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:mortuaries,name,' . $mortuary->id,
            'type' => 'nullable|string|max:100',
        ]);

        $mortuary->update($validated);

        return redirect()->route('systemconfiguration16.mortuaries.index')
            ->with('success', 'Mortuary Facility updated successfully.');
    }

    /**
     * Remove the specified mortuary from storage.
     */
    public function destroy(Mortuary $mortuary)
    {
        // Prevent deletion if it has rooms attached to it
        if ($mortuary->rooms()->exists()) {
            return back()->withErrors([
                'error' => 'Cannot delete this Mortuary because it contains Rooms. Please delete or reassign the rooms first.'
            ]);
        }
        
        $mortuary->delete();

        return redirect()->route('systemconfiguration16.mortuaries.index')
            ->with('success', 'Mortuary Facility deleted successfully.');
    }
}