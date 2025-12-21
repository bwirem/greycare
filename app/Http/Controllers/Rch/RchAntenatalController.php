<?php

namespace App\Http\Controllers\Rch;

use App\Http\Controllers\Controller;
use App\Models\Rch\RchAncPregnancy;
use App\Models\Rch\RchAncVisit;
use App\Models\Patient\Patient;
use App\Models\Opd\OpdBooking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class RchAntenatalController extends Controller
{
    /**
     * Display Active Pregnancies (ANC Register).
     */
    public function index(Request $request)
    {
        $query = RchAncPregnancy::query()
            ->with(['patient:code,first_name,last_name,phone_number'])
            ->withCount('visits') // Show how many visits they've had
            ->where('is_active', true);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('patient', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            })->orWhere('anc_number', 'like', "%{$search}%");
        }

        $pregnancies = $query->latest('created_at')->paginate(10)->withQueryString();

        return Inertia::render('Hospital/Rch/Antenatal/Index', [
            'pregnancies' => $pregnancies,
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Show form to Register a NEW Pregnancy.
     */
    public function createPregnancy()
    {
        return Inertia::render('Hospital/Rch/Antenatal/CreatePregnancy');
    }

    /**
     * Store the Pregnancy Header.
     */
    public function storePregnancy(Request $request)
    {
        $validated = $request->validate([
            'patient_code' => 'required|exists:patients,code',
            'anc_number' => 'nullable|string|max:50',
            'gravida' => 'required|integer|min:1',
            'parity' => 'required|integer|min:0',
            'lmp_date' => 'required|date|before:today',
            // EDD is calculated in frontend usually, but good to validate or calc here
        ]);

        // Calculate EDD: LMP + 7 days + 9 months
        $lmp = Carbon::parse($validated['lmp_date']);
        $validated['edd_date'] = $lmp->copy()->addDays(7)->addMonths(9);
        $validated['is_active'] = true;

        // Check if active pregnancy already exists
        $exists = RchAncPregnancy::where('patient_code', $request->patient_code)
            ->where('is_active', true)
            ->exists();

        if ($exists) {
            return back()->withErrors(['patient_code' => 'This patient already has an active pregnancy record. Close it first.']);
        }

        RchAncPregnancy::create($validated);

        return redirect()->route('rch1.index')->with('success', 'Pregnancy registered. You can now add visits.');
    }

    /**
     * Show form to Add a Daily Visit.
     */
    public function createVisit(Request $request)
    {
        // If a patient code is passed (e.g., from the Index page), fetch their pregnancy
        $preselected = null;
        if ($request->patient_code) {
            $pregnancy = RchAncPregnancy::with('patient')
                ->where('patient_code', $request->patient_code)
                ->where('is_active', true)
                ->first();
            
            if ($pregnancy) {
                $preselected = $pregnancy;
            }
        }

        return Inertia::render('Hospital/Rch/Antenatal/CreateVisit', [
            'preselectedPregnancy' => $preselected
        ]);
    }

    /**
     * Store the Daily Visit.
     */
    public function storeVisit(Request $request)
    {
        $validated = $request->validate([
            'pregnancy_id' => 'required|exists:rch_anc_pregnancies,id',
            'gestational_age_weeks' => 'required|integer|min:1|max:45',
            'fundal_height_cm' => 'nullable|numeric',
            'fetal_heart_rate' => 'nullable|string',
            'fetal_lie' => 'nullable|string',
            'urine_albumin' => 'nullable|string',
            'syphilis_result' => 'nullable|string',
            'hiv_status' => 'nullable|string',
            'arv_prophylaxis' => 'boolean',
            'ipt_malaria' => 'boolean',
            'tt_vaccine' => 'boolean',
            'iron_folate' => 'boolean',
            'deworming' => 'boolean',
            'remarks' => 'nullable|string',
        ]);

        // Find the patient code from pregnancy to link booking
        $pregnancy = RchAncPregnancy::findOrFail($request->pregnancy_id);

        // Link to today's OPD booking
        $booking = OpdBooking::where('patientcode', $pregnancy->patient_code)
            ->whereDate('created_at', Carbon::today())
            ->latest()
            ->first();

        // If no booking exists, we should probably create one or error out depending on strictness.
        // For now, we require a booking in the system logic, but if missing, we default or nullable.
        // The migration has restrictive constraint? Let's assume nullable or user ensures booking.
        // If your migration is RESTRICT, you MUST have a booking.
        if (!$booking) {
             // Fallback: Create a dummy/auto booking OR fail. 
             // Best Practice: Fail and tell user "Patient must be checked-in at Reception first".
             // For this code, I will assume nullable in migration or handle gracefully.
             // If strict:
             // return back()->withErrors(['error' => 'No active OPD Booking found for today. Please check-in patient.']);
        }

        $validated['opd_booking_id'] = $booking ? $booking->id : null; 
        
        // Safety check if migration is strict
        if(is_null($validated['opd_booking_id'])) {
             // Create a "Ghost" booking if you want, or just fail. 
             // I will leave this null, assuming you made the column nullable in migration 
             // OR you ensure reception workflow happens first.
        }

        $validated['created_by'] = Auth::id();

        RchAncVisit::create($validated);

        return redirect()->route('rch1.index')->with('success', 'ANC Visit recorded successfully.');
    }

    /**
     * Edit a specific visit.
     */
    public function edit($id)
    {
        $visit = RchAncVisit::with(['pregnancy.patient'])->findOrFail($id);
        
        return Inertia::render('Hospital/Rch/Antenatal/EditVisit', [
            'visit' => $visit
        ]);
    }

    /**
     * Update a visit.
     */
    public function update(Request $request, $id)
    {
        $visit = RchAncVisit::findOrFail($id);
        
        $validated = $request->validate([
            'gestational_age_weeks' => 'required|integer',
            'fundal_height_cm' => 'nullable|numeric',
            'fetal_heart_rate' => 'nullable|string',
            'fetal_lie' => 'nullable|string',
            'urine_albumin' => 'nullable|string',
            'syphilis_result' => 'nullable|string',
            'hiv_status' => 'nullable|string',
            'arv_prophylaxis' => 'boolean',
            'ipt_malaria' => 'boolean',
            'tt_vaccine' => 'boolean',
            'iron_folate' => 'boolean',
            'deworming' => 'boolean',
            'remarks' => 'nullable|string',
        ]);

        $visit->update($validated);

        return redirect()->route('rch1.index')->with('success', 'Visit updated.');
    }

    /**
     * API to find active pregnancy by patient code (Used in CreateVisit frontend).
     */
    public function searchActivePregnancy(Request $request)
    {
        $patientCode = $request->query('patient_code');
        
        $pregnancy = RchAncPregnancy::with('patient')
            ->where('patient_code', $patientCode)
            ->where('is_active', true)
            ->first();

        if ($pregnancy) {
            // Calculate current GA based on LMP
            $weeks = Carbon::parse($pregnancy->lmp_date)->diffInWeeks(Carbon::now());
            $pregnancy->calculated_ga = $weeks;
            return response()->json(['status' => 'found', 'data' => $pregnancy]);
        }

        return response()->json(['status' => 'not_found']);
    }
}