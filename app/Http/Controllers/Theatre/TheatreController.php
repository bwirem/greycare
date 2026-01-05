<?php

namespace App\Http\Controllers\Theatre;

use App\Http\Controllers\Controller;
use App\Models\Theatre\Theatre;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TheatreController extends Controller
{
    public function index()
    {
        return Inertia::render('SystemConfiguration/TheatreSetup/Theatres/Index', [
            'theatres' => Theatre::latest()->paginate(10)
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/TheatreSetup/Theatres/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'type' => 'nullable|string|max:100',     // <--- Added
            'location' => 'nullable|string|max:255', // <--- Added
            'is_active' => 'boolean',
        ]);

        Theatre::create($validated);

        return redirect()->route('systemconfiguration8.theatres.index')->with('success', 'Theatre created successfully.');
    }

    public function edit($id)
    {
        return Inertia::render('SystemConfiguration/TheatreSetup/Theatres/Edit', [
            'theatre' => Theatre::findOrFail($id)
        ]);
    }

    public function update(Request $request, $id)
    {
        $theatre = Theatre::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'type' => 'nullable|string|max:100',     // <--- Added
            'location' => 'nullable|string|max:255', // <--- Added
            'is_active' => 'boolean',
        ]);

        $theatre->update($validated);

        return redirect()->route('systemconfiguration8.theatres.index')->with('success', 'Theatre updated successfully.');
    }

    public function destroy($id)
    {
        Theatre::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Theatre deleted.');
    }
}