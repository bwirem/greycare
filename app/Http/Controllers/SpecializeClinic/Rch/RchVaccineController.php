<?php

namespace App\Http\Controllers\SpecializeClinic\Rch;

use App\Http\Controllers\Controller;
use App\Models\Rch\RchVaccine;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RchVaccineController extends Controller
{
    public function index()
    {
        return Inertia::render('SystemConfiguration/RchSetup/Vaccines/Index', [
            'vaccines' => RchVaccine::latest()->paginate(10)
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/RchSetup/Vaccines/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:rch_vaccines,code',
            'target_age_weeks' => 'nullable|integer|min:0',
        ]);

        RchVaccine::create($validated);
        return redirect()->route('systemconfiguration14.vaccines.index')->with('success', 'Vaccine created successfully.');
    }

    public function edit($id)
    {
        return Inertia::render('SystemConfiguration/RchSetup/Vaccines/Edit', [
            'vaccine' => RchVaccine::findOrFail($id)
        ]);
    }

    public function update(Request $request, $id)
    {
        $vaccine = RchVaccine::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:rch_vaccines,code,' . $id,
            'target_age_weeks' => 'nullable|integer|min:0',
            'is_active' => 'boolean'
        ]);

        $vaccine->update($validated);
        return redirect()->route('systemconfiguration14.vaccines.index')->with('success', 'Vaccine updated successfully.');
    }

    public function destroy($id)
    {
        RchVaccine::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Vaccine deleted.');
    }
}