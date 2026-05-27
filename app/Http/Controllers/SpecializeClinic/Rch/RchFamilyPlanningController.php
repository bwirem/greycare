<?php

namespace App\Http\Controllers\SpecializeClinic\Rch;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

// --- Models ---
use App\Models\Rch\RchFpVisit;
use App\Models\Rch\RchFpMethod;
use App\Models\Patient\Patient;
use App\Models\Billing\BLSCustomer;
use App\Models\Opd\OpdBooking;
use App\Models\Opd\OpdTreatmentPoint;
use App\Models\Patient\PatientBillingGroup;

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

        return Inertia::render('SpecializeClinic/Rch/FamilyPlanning/Index', [
            'visits' => $visits,
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('SpecializeClinic/Rch/FamilyPlanning/Create', [
            'methods' => RchFpMethod::where('is_active', true)->get()
        ]);
    }

    /**
     * Store a newly created resource in storage (Handles Existing & Walk-ins).
     */
    public function store(Request $request)
    {
        $rules = [
            'is_new_patient' => 'boolean',
            'visit_date' => 'required|date',
            'method_id' => 'required|exists:rch_fp_methods,id',
            'weight_kg' => 'nullable|numeric|min:0',
            'bp_systolic' => 'nullable|string|max:10',
            'bp_diastolic' => 'nullable|string|max:10',
            'quantity' => 'required|integer|min:1',
            'side_effects' => 'nullable|string',
            'next_appointment_date' => 'nullable|date|after_or_equal:visit_date',
        ];

        // Dynamic validation based on patient type
        if ($request->is_new_patient) {
            $rules['first_name']    = 'required|string|max:100';
            $rules['last_name']     = 'required|string|max:100';
            $rules['phone_number']  = 'required|string|max:20';
            $rules['date_of_birth'] = 'required|date|before:today';
        } else {
            $rules['patient_code']  = 'required|exists:patients,code';
        }

        $validated = $request->validate($rules);

        try {
            DB::beginTransaction();

            $patientCode = null;
            $user = Auth::user();

            if ($request->is_new_patient) {
                // 1. Generate new Patient Code
                do {
                    $patientCode = 'PAT-' . date('ymd') . '-' . mt_rand(100, 999);
                } while (Patient::where('code', $patientCode)->exists());

                // 2. Create Patient Profile
                Patient::create([
                    'code'          => $patientCode,
                    'first_name'    => $validated['first_name'],
                    'last_name'     => $validated['last_name'],
                    'gender'        => 'Female', 
                    'date_of_birth' => $validated['date_of_birth'],
                    'phone_number'  => $validated['phone_number'],
                ]);

                // 3. Create Billing Profile
                BLSCustomer::firstOrCreate(
                    ['patient_code' => $patientCode], 
                    [
                        'customer_type' => 'individual',
                        'first_name'    => $validated['first_name'],
                        'surname'       => $validated['last_name'],
                        'phone'         => $validated['phone_number'],
                    ]
                );
            } else {
                $patientCode = $request->patient_code;
            }

            // --- 4. HANDLE OPD BOOKING ---
            // Auto-link to today's booking or Create a new one
            $booking = OpdBooking::where('patientcode', $patientCode)
                ->whereDate('created_at', Carbon::today())
                ->latest()
                ->first();

            if (!$booking) {
                $tp = OpdTreatmentPoint::firstOrCreate(['name' => 'Family Planning']);
                $billingGroup = PatientBillingGroup::where('name', 'like', '%Cash%')->first();
                
                $booking = OpdBooking::create([
                    'bookdate'             => now(),
                    'patientcode'          => $patientCode,
                    'treatmentpoint_id'    => $tp->id,
                    'billinggroup_id'      => $billingGroup ? $billingGroup->id : 1,
                    'doctor_user_id'       => $user->id,
                    'user_id'              => $user->id,
                    'wheretaken'           => 'Family Planning',
                    'DoctorName'           => $user->name,
                    'vitalsignstatus'      => 'Closed', 
                    'consultation_status'  => 'FpVisit',
                    'pricecategory'        => $billingGroup->pricecategory ?? 'price1', 
                    'visit_classification' => 'Revisit',
                    'payment_status'       => 'unpaid',
                ]);
            }

            // --- 5. CREATE FP VISIT ---
            $fpData = collect($validated)->except([
                'is_new_patient', 'first_name', 'last_name', 'phone_number', 'date_of_birth'
            ])->toArray();
            
            $fpData['patient_code'] = $patientCode;
            $fpData['opd_booking_id'] = $booking->id;
            $fpData['created_by'] = $user->id;

            RchFpVisit::create($fpData);

            DB::commit();

            return redirect()->route('rch0.index')->with('success', 'Family Planning visit recorded successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'System Error: ' . $e->getMessage()]);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $visit = RchFpVisit::with('patient')->findOrFail($id);

        return Inertia::render('SpecializeClinic/Rch/FamilyPlanning/Edit', [
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