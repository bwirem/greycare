<?php

namespace App\Http\Controllers\Hospital\Ipd;

use App\Http\Controllers\Controller;
use App\Models\Ipd\IpdWard;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IpdWardController extends Controller
{
    public function index(Request $request)
    {
        $query = IpdWard::query();

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        return Inertia::render('SystemConfiguration/FacilitySetup/Wards/Index', [
            'wards' => $query->orderBy('name')->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
            'success' => session('success'),
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/FacilitySetup/Wards/Create');
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255|unique:ipd_wards,name']);
        
        // Using create with fillable/guarded logic
        IpdWard::create($request->only('name'));

        return redirect()->route('systemconfiguration5.wards.index')
            ->with('success', 'Ward created successfully.');
    }

    public function edit(IpdWard $ward)
    {
        return Inertia::render('SystemConfiguration/FacilitySetup/Wards/Edit', [
            'ward' => $ward
        ]);
    }

    public function update(Request $request, IpdWard $ward)
    {
        $request->validate(['name' => 'required|string|max:255|unique:ipd_wards,name,' . $ward->id]);
        $ward->update($request->only('name'));

        return redirect()->route('systemconfiguration5.wards.index')
            ->with('success', 'Ward updated successfully.');
    }

    public function destroy(IpdWard $ward)
    {
        if ($ward->rooms()->exists()) {
            return back()->withErrors(['error' => 'Cannot delete ward. It contains rooms.']);
        }
        $ward->delete();
        return redirect()->route('systemconfiguration5.wards.index')
            ->with('success', 'Ward deleted successfully.');
    }
}