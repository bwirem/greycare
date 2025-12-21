<?php

namespace App\Http\Controllers\Rch;

use App\Http\Controllers\Controller;
use App\Models\Rch\RchFpVisit;
use App\Models\Rch\RchFpMethod;
use App\Models\Patient\Patient;
use App\Models\Opd\OpdBooking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class RchFamilyPlanningController extends Controller
{
    /**
     * Display a listing of FP Visits.
     */
    public function index(Request $request)
    {
        $query = RchFpVisit::query()
            ->with(['patient:code,first_name,last_name,phone_number', 'method:id,name,code']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('patient', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $visits = $query->latest('visit_date')->paginate(10)->withQueryString();

        // UPDATED PATH: Hospital/Rch/FamilyPlanning/Index
        return Inertia::render('Hospital/Rch/FamilyPlanning/Index', [
            'visits' => $visits,
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // UPDATED PATH: Hospital/Rch/FamilyPlanning/Create
        return Inertia::render('Hospital/Rch/FamilyPlanning/Create', [
            'methods' => RchFpMethod::where('is_active', true)->get()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_code' => 'required|exists:patients,code',
            'visit_date' => 'required|date',
            'method_id' => 'required|exists:rch_fp_methods,id',
            'weight_kg' => 'nullable|numeric|min:0',
            'bp_systolic' => 'nullable|string|max:10',
            'bp_diastolic' => 'nullable|string|max:10',
            'quantity' => 'required|integer|min:1',
            'side_effects' => 'nullable|string',
            'next_appointment_date' => 'nullable|date|after_or_equal:visit_date',
        ]);

        // Auto-link to an active OPD booking for today if one exists
        $booking = OpdBooking::where('patientcode', $request->patient_code)
            ->whereDate('created_at', Carbon::today())
            ->latest()
            ->first();

        $validated['opd_booking_id'] = $booking ? $booking->id : null;
        $validated['created_by'] = Auth::id();

        RchFpVisit::create($validated);

        return redirect()->route('rch0.index')->with('success', 'Family Planning visit recorded successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $visit = RchFpVisit::with('patient')->findOrFail($id);

        // UPDATED PATH: Hospital/Rch/FamilyPlanning/Edit
        return Inertia::render('Hospital/Rch/FamilyPlanning/Edit', [
            'visit' => $visit,
            'methods' => RchFpMethod::where('is_active', true)->get()
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $visit = RchFpVisit::findOrFail($id);

        $validated = $request->validate([
            'visit_date' => 'required|date',
            'method_id' => 'required|exists:rch_fp_methods,id',
            'weight_kg' => 'nullable|numeric',
            'bp_systolic' => 'nullable|string',
            'bp_diastolic' => 'nullable|string',
            'quantity' => 'required|integer|min:1',
            'side_effects' => 'nullable|string',
            'next_appointment_date' => 'nullable|date|after_or_equal:visit_date',
        ]);

        $visit->update($validated);

        return redirect()->route('rch0.index')->with('success', 'Visit updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $visit = RchFpVisit::findOrFail($id);
        $visit->delete();

        return redirect()->back()->with('success', 'Visit deleted.');
    }

    /**
     * API for Searching Patients (Used in Create Form)
     */
    public function searchPatient(Request $request)
    {
        $search = $request->query('query');
        
        if (!$search) return response()->json([]);

        $patients = Patient::where('first_name', 'like', "%{$search}%")
            ->orWhere('last_name', 'like', "%{$search}%")
            ->orWhere('code', 'like', "%{$search}%")
            ->orWhere('phone_number', 'like', "%{$search}%")
            ->limit(10)
            ->get(['code', 'first_name', 'last_name', 'phone_number', 'date_of_birth']);

        return response()->json($patients);
    }
}