<?php

namespace App\Http\Controllers\Hospital\Ipd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

// Model
use App\Models\Ipd\IpdDischargeStatus;

class IpdDischargeStatusController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = IpdDischargeStatus::query();

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        return Inertia::render('SystemConfiguration/FacilitySetup/DischargeStatuses/Index', [
            'statuses' => $query->orderBy('name')->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('SystemConfiguration/FacilitySetup/DischargeStatuses/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:ipd_discharge_statuses,name',
        ]);

        IpdDischargeStatus::create($validated);

        return redirect()->route('systemconfiguration5.dischargestatuses.index')
            ->with('success', 'Discharge status created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $status = IpdDischargeStatus::findOrFail($id);

        return Inertia::render('SystemConfiguration/FacilitySetup/DischargeStatuses/Edit', [
            'status' => $status
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $status = IpdDischargeStatus::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:ipd_discharge_statuses,name,' . $status->id,
        ]);

        $status->update($validated);

        return redirect()->route('systemconfiguration5.dischargestatuses.index')
            ->with('success', 'Discharge status updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $status = IpdDischargeStatus::findOrFail($id);
        $status->delete();

        return redirect()->back()->with('success', 'Discharge status deleted successfully.');
    }
}