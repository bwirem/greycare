<?php

namespace App\Http\Controllers\SpecializeClinic\Rch;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

// --- Imports ---
use App\Models\Rch\RchDelivery;
use App\Models\Rch\RchPncVisit;
use App\Models\Rch\RchAncPregnancy;
use App\Models\Patient\Patient;
use App\Models\Billing\BLSCustomer;
use App\Models\Opd\OpdBooking;
use App\Models\Opd\OpdTreatmentPoint;
use App\Models\Patient\PatientBillingGroup;

class RchPostnatalController extends Controller
{
    /**
     * Display Deliveries and PNC Visits.
     */
    public function index(Request $request)
    {
        // We return two collections: Recent Deliveries and Recent PNC Visits
        
        $deliveriesQuery = RchDelivery::query()
            ->with(['pregnancy.patient:code,first_name,last_name'])
            ->latest('delivery_datetime');

        $pncQuery = RchPncVisit::query()
            ->with(['patient:code,first_name,last_name'])
            ->latest('created_at');

        if ($request->filled('search')) {
            $search = $request->search;
            // Search logic for deliveries
            $deliveriesQuery->whereHas('pregnancy.patient', function($q) use ($search){
                 $q->where('first_name', 'like', "%{$search}%")
                   ->orWhere('last_name', 'like', "%{$search}%")
                   ->orWhere('code', 'like', "%{$search}%");
            });
            // Search logic for PNC
            $pncQuery->whereHas('patient', function($q) use ($search){
                 $q->where('first_name', 'like', "%{$search}%")
                   ->orWhere('last_name', 'like', "%{$search}%")
                   ->orWhere('code', 'like', "%{$search}%");
            });
        }

        return Inertia::render('SpecializeClinic/Rch/Postnatal/Index', [
            'deliveries' => $deliveriesQuery->paginate(10, ['*'], 'del_page')->withQueryString(),
            'pncVisits' => $pncQuery->paginate(10, ['*'], 'pnc_page')->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Show form to record a Delivery (Birth).
     */
    public function createDelivery(Request $request)
    {
        // We can pre-fill patient if passed from ANC module
        $preselected = null;
        if($request->patient_code) {
            $preselected = RchAncPregnancy::with('patient')
                ->where('patient_code', $request->patient_code)
                ->where('is_active', true)
                ->first();
        }

        return Inertia::render('SpecializeClinic/Rch/Postnatal/CreateDelivery', [
            'preselected' => $preselected
        ]);
    }

    /**
     * Store Delivery Record (Handles Both Existing ANC and Unbooked Patients).
     */
    public function storeDelivery(Request $request)
    {
        $rules = [
            'is_new_patient' => 'boolean',
            'delivery_datetime' => 'required|date',
            'mode_of_delivery' => 'required|string',
            'outcome' => 'required|string',
            'placenta_delivery' => 'nullable|string',
            'blood_loss_ml' => 'nullable|numeric',
            'child_gender' => 'required|string|in:Male,Female',
            'birth_weight_kg' => 'required|numeric',
            'apgar_score_1min' => 'nullable|integer|min:0|max:10',
            'apgar_score_5min' => 'nullable|integer|min:0|max:10',
            'complications' => 'nullable|string',
        ];

        // Dynamic validation based on patient type
        if ($request->is_new_patient) {
            $rules['first_name']    = 'required|string|max:100';
            $rules['last_name']     = 'required|string|max:100';
            $rules['phone_number']  = 'required|string|max:20';
            $rules['date_of_birth'] = 'required|date|before:today';
        } else {
            $rules['pregnancy_id'] = 'required|exists:rch_anc_pregnancies,id';
        }

        $validated = $request->validate($rules);

        try {
            DB::beginTransaction();

            $pregnancyId = null;

            if ($request->is_new_patient) {
                // 1. Generate Patient Code
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

                // 4. Create "Unbooked" Pregnancy to satisfy relational constraints
                $pregnancy = RchAncPregnancy::create([
                    'patient_code' => $patientCode,
                    'anc_number'   => 'UNBOOKED-' . time(),
                    'gravida'      => 1, // Defaulting for walk-in bypass
                    'parity'       => 0,
                    'lmp_date'     => Carbon::now()->subMonths(9),
                    'edd_date'     => Carbon::now(),
                    'is_active'    => false, // Marked as delivered
                    'created_by'   => Auth::id(),
                ]);

                $pregnancyId = $pregnancy->id;
            } else {
                $pregnancyId = $validated['pregnancy_id'];
                
                // Mark Existing ANC Pregnancy as Delivered (Inactive)
                $pregnancy = RchAncPregnancy::find($pregnancyId);
                $pregnancy->is_active = false; 
                $pregnancy->save();
            }

            // 5. Store Delivery Details
            $deliveryData = collect($validated)->except([
                'is_new_patient', 'first_name', 'last_name', 'phone_number', 'date_of_birth'
            ])->toArray();
            
            $deliveryData['pregnancy_id'] = $pregnancyId;
            $deliveryData['conducted_by'] = Auth::id();

            // Link to OPD Booking if one exists today
            $booking = OpdBooking::where('patientcode', $pregnancy->patient_code ?? $patientCode)
                ->whereDate('created_at', Carbon::today())
                ->latest()
                ->first();
            
            if ($booking) {
                $deliveryData['opd_booking_id'] = $booking->id;
            }

            RchDelivery::create($deliveryData);

            DB::commit();
            return redirect()->route('rch2.index')->with('success', 'Delivery recorded successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'System Error: ' . $e->getMessage()]);
        }
    }

    /**
     * Show form for PNC Visit (Mother).
     */
    public function createVisit()
    {
        return Inertia::render('SpecializeClinic/Rch/Postnatal/CreateVisit');
    }
    /**
     * Store PNC Visit (Handles Both Existing and Unbooked Mothers).
     */
    public function storeVisit(Request $request)
    {
        $rules = [
            'is_new_patient' => 'boolean',
            'visit_date' => 'required|date',
            'timing' => 'required|string', 
            'uterus_involution' => 'nullable|string',
            'lochia_status' => 'nullable|string',
            'c_section_wound' => 'nullable|string',
            'vitamin_a_given' => 'boolean',
            'counseling_given' => 'nullable|string',
        ];

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
                // Generate unbooked patient code and profiles
                do {
                    $patientCode = 'PAT-' . date('ymd') . '-' . mt_rand(100, 999);
                } while (Patient::where('code', $patientCode)->exists());

                Patient::create([
                    'code'          => $patientCode,
                    'first_name'    => $validated['first_name'],
                    'last_name'     => $validated['last_name'],
                    'gender'        => 'Female', 
                    'date_of_birth' => $validated['date_of_birth'],
                    'phone_number'  => $validated['phone_number'],
                ]);

                BLSCustomer::firstOrCreate(
                    ['patient_code' => $patientCode], 
                    ['customer_type' => 'individual', 'first_name' => $validated['first_name'], 'surname' => $validated['last_name'], 'phone' => $validated['phone_number']]
                );
            } else {
                $patientCode = $request->patient_code;
            }

            // --- 1. HANDLE OPD BOOKING ---
            $booking = OpdBooking::where('patientcode', $patientCode)->whereDate('created_at', Carbon::today())->latest()->first();

            if (!$booking) {
                $tp = OpdTreatmentPoint::firstOrCreate(['name' => 'RCH Clinic']);
                $billingGroup = PatientBillingGroup::where('name', 'like', '%Cash%')->first();
                
                $booking = OpdBooking::create([
                    'bookdate'             => now(),
                    'patientcode'          => $patientCode,
                    'treatmentpoint_id'    => $tp->id,
                    'billinggroup_id'      => $billingGroup ? $billingGroup->id : 1,
                    'doctor_user_id'       => $user->id,
                    'user_id'              => $user->id,
                    'wheretaken'           => 'RCH Clinic',
                    'DoctorName'           => $user->name,
                    'vitalsignstatus'      => 'Closed', 
                    'consultation_status'  => 'PncVisit',
                    'pricecategory'        => $billingGroup->pricecategory ?? 'price1', 
                    'visit_classification' => 'Revisit',
                    'payment_status'       => 'unpaid',
                ]);
            }

            // --- 2. CREATE PNC VISIT ---
            $pncData = collect($validated)->except(['is_new_patient', 'first_name', 'last_name', 'phone_number', 'date_of_birth'])->toArray();
            $pncData['patient_code'] = $patientCode;
            $pncData['opd_booking_id'] = $booking->id;
            $pncData['created_by'] = $user->id;

            // Link delivery if existing
            $delivery = RchDelivery::whereHas('pregnancy', function($q) use ($patientCode){
                 $q->where('patient_code', $patientCode);
            })->latest('delivery_datetime')->first();

            if ($delivery) $pncData['delivery_id'] = $delivery->id;

            RchPncVisit::create($pncData);

            DB::commit();
            return redirect()->route('rch2.index')->with('success', 'PNC Visit recorded successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error: ' . $e->getMessage()]);
        }
    }
}