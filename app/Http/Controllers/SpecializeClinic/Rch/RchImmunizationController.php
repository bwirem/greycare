<?php

namespace App\Http\Controllers\SpecializeClinic\Rch;

use App\Http\Controllers\Controller;
use App\Models\Rch\RchImmunization;
use App\Models\Rch\RchVaccine;
use App\Models\Patient\Patient;
use App\Models\Opd\OpdBooking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class RchImmunizationController extends Controller
{
    /**
     * Display Immunization Register.
     */
    public function index(Request $request)
    {
        $query = RchImmunization::query()
            ->with(['patient:code,first_name,last_name,date_of_birth', 'vaccine:id,name,code']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('patient', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            })->orWhereHas('vaccine', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        return Inertia::render('SpecializeClinic/Rch/Immunization/Index', [
            'records' => $query->latest('administered_date')->paginate(10)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Show form to administer vaccine.
     */
    public function create()
    {
        // Fetch active vaccines for the dropdown
        $vaccines = RchVaccine::where('is_active', true)
            ->orderBy('target_age_weeks', 'asc')
            ->orderBy('name', 'asc')
            ->get();

        return Inertia::render('SpecializeClinic/Rch/Immunization/Create', [
            'vaccines' => $vaccines
        ]);
    }

    /**
     * Store immunization record.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_code' => 'required|exists:patients,code',
            'vaccine_id' => 'required|exists:rch_vaccines,id',
            'administered_date' => 'required|date',
            'batch_number' => 'nullable|string|max:50',
            'remarks' => 'nullable|string|max:255',
        ]);

        // Link to today's booking if exists
        $booking = OpdBooking::where('patientcode', $request->patient_code)
            ->whereDate('created_at', Carbon::today())
            ->latest()
            ->first();

        $validated['opd_booking_id'] = $booking ? $booking->id : null;
        $validated['created_by'] = Auth::id();

        RchImmunization::create($validated);

        return redirect()->route('rch4.index')->with('success', 'Vaccine administered successfully.');
    }

    /**
     * Edit record.
     */
    public function edit($id)
    {
        $record = RchImmunization::with('patient')->findOrFail($id);
        
        $vaccines = RchVaccine::where('is_active', true)
            ->orderBy('target_age_weeks', 'asc')
            ->get();

        return Inertia::render('SpecializeClinic/Rch/Immunization/Edit', [
            'record' => $record,
            'vaccines' => $vaccines
        ]);
    }

    /**
     * Update record.
     */
    public function update(Request $request, $id)
    {
        $record = RchImmunization::findOrFail($id);

        $validated = $request->validate([
            'vaccine_id' => 'required|exists:rch_vaccines,id',
            'administered_date' => 'required|date',
            'batch_number' => 'nullable|string|max:50',
            'remarks' => 'nullable|string|max:255',
        ]);

        $record->update($validated);

        return redirect()->route('rch4.index')->with('success', 'Record updated successfully.');
    }

    /**
     * Delete record.
     */
    public function destroy($id)
    {
        $record = RchImmunization::findOrFail($id);
        $record->delete();

        return redirect()->back()->with('success', 'Record deleted.');
    }
}