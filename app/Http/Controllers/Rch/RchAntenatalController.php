<?php

namespace App\Http\Controllers\Rch;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;

// --- RCH Models ---
use App\Models\Rch\RchAncPregnancy;
use App\Models\Rch\RchAncVisit;

// --- Patient & Core Models ---
use App\Models\Patient\Patient;
use App\Models\Patient\PatientBillingGroup;
use App\Models\Opd\OpdBooking;
use App\Models\Opd\OpdTreatmentPoint; // <--- ADDED IMPORT
use App\Models\Billing\BLSCustomer;

// --- Service / Order Models ---
use App\Models\Laboratory\LabPrescription;
use App\Models\Laboratory\LabPanel;
use App\Models\Radiology\RadRequest;
use App\Models\Radiology\RadProcedure;
use App\Models\Theatre\TheatreBooking;
use App\Models\Theatre\TheatreProcedure;

// --- Services ---
use App\Services\BillingService; 

class RchAntenatalController extends Controller
{
    /**
     * Display Active Pregnancies (ANC Register).
     */
    public function index(Request $request)
    {
        $query = RchAncPregnancy::query()
            ->with(['patient:code,first_name,last_name,phone_number'])
            ->withCount('visits') 
            ->where('is_active', true);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('patient', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            })->orWhere('anc_number', 'like', "%{$search}%");
        }

        if ($request->wantsJson()) {
            return response()->json($query->limit(10)->get());
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
        $rules = [
            'is_new_patient' => 'boolean',
            'anc_number'     => 'nullable|string|max:50',
            'gravida'        => 'required|integer|min:1',
            'parity'         => 'required|integer|min:0',
            'lmp_date'       => 'required|date|before:today',
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
            DB::transaction(function () use ($request, $validated) {
                
                $patientCode = null;

                if ($request->is_new_patient) {
                    do {
                        $patientCode = 'PAT-' . date('ymd') . '-' . mt_rand(100, 999);
                    } while (Patient::where('code', $patientCode)->exists());

                    Patient::create([
                        'code'          => $patientCode,
                        'first_name'    => $validated['first_name'],
                        'last_name'     => $validated['last_name'],
                        'middle_name'   => $request->middle_name,
                        'gender'        => 'Female', 
                        'date_of_birth' => $validated['date_of_birth'],
                        'phone_number'  => $validated['phone_number'],
                        //'is_active'     => true,
                    ]);

                    BLSCustomer::firstOrCreate(
                        ['patient_code' => $patientCode], 
                        [
                            'customer_type' => 'individual',
                            'first_name'    => $validated['first_name'],
                            'surname'       => $validated['last_name'],
                            'other_names'   => $request->middle_name,
                            'phone'         => $validated['phone_number'],
                        ]
                    );
                } else {
                    $patientCode = $validated['patient_code'];
                }

                $exists = RchAncPregnancy::where('patient_code', $patientCode)
                    ->where('is_active', true)->exists();

                if ($exists) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'patient_code' => 'This patient already has an active pregnancy record.'
                    ]);
                }

                $lmp = Carbon::parse($validated['lmp_date']);
                $edd = $lmp->copy()->addDays(7)->addMonths(9);

                RchAncPregnancy::create([
                    'patient_code' => $patientCode,
                    'anc_number'   => $validated['anc_number'],
                    'gravida'      => $validated['gravida'],
                    'parity'       => $validated['parity'],
                    'lmp_date'     => $validated['lmp_date'],
                    'edd_date'     => $edd,
                    'is_active'    => true,
                    'created_by'   => Auth::id(),
                ]);
            });

            return redirect()->route('rch1.index')->with('success', 'Pregnancy registered successfully.');

        } catch (\Exception $e) {
            if ($e instanceof \Illuminate\Validation\ValidationException) throw $e;
            return back()->withErrors(['error' => 'System Error: ' . $e->getMessage()]);
        }
    }

    /**
     * Show form to Add a Daily Visit.
     */
    public function createVisit(Request $request)
    {
        $preselected = null;
        $history = ['labs' => [], 'rads' => [], 'surgeries' => []];

        if ($request->patient_code) {
            $pregnancy = RchAncPregnancy::with('patient')
                ->where('patient_code', $request->patient_code)
                ->where('is_active', true)
                ->first();
            
            if ($pregnancy) {
                $preselected = $pregnancy;

                $history['labs'] = LabPrescription::with(['panel', 'rejectionLog.reason'])
                    ->where('patientcode', $pregnancy->patient_code)
                    ->whereDate('created_at', '>=', Carbon::today()->subDays(2))
                    ->latest()->get();
                
                $history['rads'] = RadRequest::with(['procedure'])
                    ->where('patientcode', $pregnancy->patient_code)
                    ->whereDate('created_at', '>=', Carbon::today()->subDays(2))
                    ->latest()->get();

                $history['surgeries'] = TheatreBooking::with(['procedure'])
                    ->where('patientcode', $pregnancy->patient_code)
                    ->whereDate('created_at', '>=', Carbon::today())
                    ->latest()->get();
            }
        }

        $options = [
            'lab' => LabPanel::select('id', 'name as label', 'id as value')->orderBy('name')->get(),
            'rad' => RadProcedure::select('id', 'name as label', 'id as value')->orderBy('name')->get(),
            'surgery' => TheatreProcedure::select('id', 'name as label', 'id as value')->orderBy('name')->get(),
        ];

        return Inertia::render('Hospital/Rch/Antenatal/CreateVisit', [
            'preselectedPregnancy' => $preselected,
            'options' => $options,
            'history' => $history 
        ]);
    }

    /**
     * Store the Daily Visit & Process Orders + Billing.
     */
    public function storeVisit(Request $request, BillingService $billingService)
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
            'lab_requests' => 'nullable|array',
            'rad_requests' => 'nullable|array',
            'surgery_request' => 'nullable|array', 
        ]);

        try {
            DB::beginTransaction();

            $pregnancy = RchAncPregnancy::with('patient')->findOrFail($request->pregnancy_id);
            $patientCode = $pregnancy->patient_code;
            $user = Auth::user();

            // --- 1. HANDLE OPD BOOKING (Container) ---
            $booking = OpdBooking::where('patientcode', $patientCode)
                ->whereDate('created_at', Carbon::today())
                ->latest()
                ->first();

            if (!$booking) {

                // A. Ensure "RCH Clinic" Treatment Point exists (Create if missing)
                $tp = OpdTreatmentPoint::firstOrCreate(['name' => 'RCH Clinic']);

               // B. Find Default Billing Group (Cash)
                $billingGroup = PatientBillingGroup::where('name', 'like', '%Cash%')->first();
                $billingGroupId = $billingGroup ? $billingGroup->id : 1;
                $priceCategory = $billingGroup->pricecategory ?? 'price1';

                // C. Create Booking using YOUR SCHEMA
                $booking = OpdBooking::create([
                    'bookdate'           => now(),
                    'patientcode'        => $patientCode,
                    'treatmentpoint_id'  => $tp->id, // Will use existing or newly created ID
                    'billinggroup_id'    => $billingGroupId,
                    'doctor_user_id'     => $user->id,
                    'user_id'            => $user->id,
                    'wheretaken'         => 'RCH Clinic',
                    'DoctorName'         => $user->name,
                    'vitalsignstatus'    => 'Closed', 
                    'consultation_status'=> 'RchVisit', // Updated status
                    
                    // Billing / Price info
                    'pricecategory'        => $priceCategory, 
                    'visit_classification' => 'Revisit',
                    'payment_status'       => 'unpaid',
                    
                    // Nullables
                    'billinggroupmembershipno' => null, 
                    'authorizationno'          => null,          
                    'schemeid'                 => null,
                    'bill_item_id'             => null, 
                ]);
            }

            // Ensure we have a valid ID
            if (!$booking || !$booking->getKey()) {
                throw new \Exception("Failed to generate OPD Booking ID.");
            }

            // --- 2. CREATE ANC VISIT ---
            $ancData = collect($validated)->except(['lab_requests', 'rad_requests', 'surgery_request'])->toArray();
            $ancData['opd_booking_id'] = $booking->getKey();
            $ancData['created_by'] = Auth::id();
            
            RchAncVisit::create($ancData);

            // --- 3. PROCESS ORDERS ---
            
            // Lab
            if ($request->has('lab_requests')) {
                foreach ($request->lab_requests as $lab) {
                    $exists = LabPrescription::where('opd_booking_id', $booking->getKey())
                        ->where('lab_panel_id', $lab['panel_id'])->exists();
                    
                    if (!$exists) {
                        $labRecord = LabPrescription::create([
                            'opd_booking_id' => $booking->getKey(),
                            'patientcode' => $patientCode,
                            'doctor_user_id' => Auth::id(),
                            'lab_panel_id' => $lab['panel_id'],
                            'status' => 'Requested',
                            'payment_status' => 'unpaid'
                        ]);
                        // Bill
                        $panel = LabPanel::with('blsItem')->find($lab['panel_id']);
                        if ($panel && $panel->blsItem) {
                            $billingService->addToBill(
                                $patientCode, $panel->blsItem->id, 1, 'laboratory',
                                $labRecord->id, $booking->pricecategory ?? 'price1', $booking->billinggroup_id ?? 1
                            );
                        }
                    }
                }
            }

            // Rad
            if ($request->has('rad_requests')) {
                foreach ($request->rad_requests as $rad) {
                    $exists = RadRequest::where('opd_booking_id', $booking->getKey())
                        ->where('rad_procedure_id', $rad['procedure_id'])->exists();

                    if (!$exists) {
                        $radRecord = RadRequest::create([
                            'opd_booking_id' => $booking->getKey(),
                            'patientcode' => $patientCode,
                            'requested_by' => Auth::id(),
                            'rad_procedure_id' => $rad['procedure_id'],
                            'status' => 'Ordered',
                            'payment_status' => 'unpaid',
                            'accession_number' => 'RAD-' . date('YmdHis') . '-' . rand(100,999)
                        ]);
                        // Bill
                        $procedure = RadProcedure::with('blsItem')->find($rad['procedure_id']);
                        if ($procedure && $procedure->blsItem) {
                            $billingService->addToBill(
                                $patientCode, $procedure->blsItem->id, 1, 'radiology',
                                $radRecord->id, $booking->pricecategory ?? 'price1', $booking->billinggroup_id ?? 1
                            );
                        }
                    }
                }
            }

            // Surgery
            if (!empty($request->surgery_request['procedure_id']) && !empty($request->surgery_request['date'])) {
                $procId = $request->surgery_request['procedure_id'];
                
                $surgRecord = TheatreBooking::firstOrCreate([
                    'opd_booking_id' => $booking->getKey(),
                    'theatre_procedure_id' => $procId
                ], [
                    'patientcode' => $patientCode,
                    'doctor_user_id' => Auth::id(),
                    'scheduled_at' => Carbon::parse($request->surgery_request['date']),
                    'status' => 'Scheduled',
                    'payment_status' => 'unpaid'
                ]);

                if ($surgRecord->wasRecentlyCreated || $surgRecord->payment_status === 'unpaid') {
                    $procedure = TheatreProcedure::with('blsItem')->find($procId);
                    if ($procedure && $procedure->blsItem) {
                        $billingService->addToBill(
                            $patientCode, $procedure->blsItem->id, 1, 'theatre',
                            $surgRecord->id, $booking->pricecategory ?? 'price1', $booking->billinggroup_id ?? 1
                        );
                    }
                }
            }

            DB::commit();
            return redirect()->route('rch1.index')->with('success', 'ANC Visit recorded successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('RCH Visit Save Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Error: ' . $e->getMessage()]);
        }
    }

    /**
     * EDIT Visit: Prepares Data for Clinical + Orders Tabs
     */
    public function edit($id)
    {
        // 1. Fetch Visit & Relations
        $visit = RchAncVisit::with(['pregnancy.patient', 'opdBooking'])->findOrFail($id);
        
        // 2. Prepare History Arrays (Prevent null errors)
        $history = [
            'labs' => [],
            'rads' => [],
            'surgeries' => []
        ];

        // 3. Fetch Existing Orders ONLY if an OPD Booking is linked
        if ($visit->opd_booking_id) {
            $history['labs'] = LabPrescription::with(['panel', 'rejectionLog.reason'])
                ->where('opd_booking_id', $visit->opd_booking_id)
                ->get();
            
            $history['rads'] = RadRequest::with(['procedure'])
                ->where('opd_booking_id', $visit->opd_booking_id)
                ->get();

            $history['surgeries'] = TheatreBooking::with(['procedure'])
                ->where('opd_booking_id', $visit->opd_booking_id)
                ->get();
        }

        // 4. Fetch Dropdowns for the "Add New" forms
        // Ensure these tables exist and have data
        $options = [
            'lab' => LabPanel::select('id', 'name as label', 'id as value')->orderBy('name')->get(),
            'rad' => RadProcedure::select('id', 'name as label', 'id as value')->orderBy('name')->get(),
            'surgery' => TheatreProcedure::select('id', 'name as label', 'id as value')->orderBy('name')->get(),
        ];
        
        // 5. Return to React
        return Inertia::render('Hospital/Rch/Antenatal/EditVisit', [
            'visit' => $visit,
            'options' => $options,
            'existing_orders' => $history
        ]);
    }

    /**
     * UPDATE Visit: Saves Clinical Data + Adds New Orders
     */
    public function update(Request $request, $id, BillingService $billingService)
    {
        $visit = RchAncVisit::with(['pregnancy.patient', 'opdBooking'])->findOrFail($id);
        
        $validated = $request->validate([
            // Clinical Fields
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

            // New Order Arrays
            'lab_requests' => 'nullable|array',
            'rad_requests' => 'nullable|array',
            'surgery_request' => 'nullable|array',
        ]);

        try {
            DB::beginTransaction();

            // 1. Update Clinical Data
            $ancData = collect($validated)->except(['lab_requests', 'rad_requests', 'surgery_request'])->toArray();
            $visit->update($ancData);

            // 2. Process NEW Orders (If added)
            // Use the booking ID from the visit record
            $bookingId = $visit->opd_booking_id;
            $patientCode = $visit->pregnancy->patient_code;
            
            // If the visit has no booking ID (legacy data), try to find/create one (Optional Safety)
            if (!$bookingId) {
                // Logic to create booking if missing... 
                // For now, we skip order addition if no booking exists to prevent errors
            } elseif ($bookingId) {
                
                // --- A. LAB ORDERS ---
                if ($request->has('lab_requests')) {
                    foreach ($request->lab_requests as $lab) {
                        $exists = LabPrescription::where('opd_booking_id', $bookingId)
                            ->where('lab_panel_id', $lab['panel_id'])->exists();
                        
                        if (!$exists) {
                            $labRecord = LabPrescription::create([
                                'opd_booking_id' => $bookingId,
                                'patientcode' => $patientCode,
                                'doctor_user_id' => Auth::id(),
                                'lab_panel_id' => $lab['panel_id'],
                                'status' => 'Requested',
                                'payment_status' => 'unpaid'
                            ]);
                            // Add to Bill
                            $panel = LabPanel::with('blsItem')->find($lab['panel_id']);
                            if ($panel && $panel->blsItem) {
                                $booking = OpdBooking::find($bookingId);
                                $billingService->addToBill(
                                    $patientCode, $panel->blsItem->id, 1, 'laboratory',
                                    $labRecord->id, $booking->pricecategory ?? 'price1', $booking->billinggroup_id ?? 1
                                );
                            }
                        }
                    }
                }

                // --- B. RAD ORDERS ---
                if ($request->has('rad_requests')) {
                    foreach ($request->rad_requests as $rad) {
                        $exists = RadRequest::where('opd_booking_id', $bookingId)
                            ->where('rad_procedure_id', $rad['procedure_id'])->exists();

                        if (!$exists) {
                            $radRecord = RadRequest::create([
                                'opd_booking_id' => $bookingId,
                                'patientcode' => $patientCode,
                                'requested_by' => Auth::id(),
                                'rad_procedure_id' => $rad['procedure_id'],
                                'status' => 'Ordered',
                                'payment_status' => 'unpaid',
                                'accession_number' => 'RAD-' . date('YmdHis') . '-' . rand(100,999)
                            ]);
                            // Add to Bill
                            $procedure = RadProcedure::with('blsItem')->find($rad['procedure_id']);
                            if ($procedure && $procedure->blsItem) {
                                $booking = OpdBooking::find($bookingId);
                                $billingService->addToBill(
                                    $patientCode, $procedure->blsItem->id, 1, 'radiology',
                                    $radRecord->id, $booking->pricecategory ?? 'price1', $booking->billinggroup_id ?? 1
                                );
                            }
                        }
                    }
                }

                // --- C. SURGERY ---
                if (!empty($request->surgery_request['procedure_id']) && !empty($request->surgery_request['date'])) {
                    $procId = $request->surgery_request['procedure_id'];
                    
                    $surgRecord = TheatreBooking::firstOrCreate([
                        'opd_booking_id' => $bookingId,
                        'theatre_procedure_id' => $procId
                    ], [
                        'patientcode' => $patientCode,
                        'doctor_user_id' => Auth::id(),
                        'scheduled_at' => Carbon::parse($request->surgery_request['date']),
                        'status' => 'Scheduled',
                        'payment_status' => 'unpaid'
                    ]);

                    if ($surgRecord->wasRecentlyCreated || $surgRecord->payment_status === 'unpaid') {
                        $procedure = TheatreProcedure::with('blsItem')->find($procId);
                        if ($procedure && $procedure->blsItem) {
                             $booking = OpdBooking::find($bookingId);
                             $billingService->addToBill(
                                $patientCode, $procedure->blsItem->id, 1, 'theatre',
                                $surgRecord->id, $booking->pricecategory ?? 'price1', $booking->billinggroup_id ?? 1
                            );
                        }
                    }
                }
            }

            DB::commit();
            return redirect()->route('rch1.history', $visit->pregnancy_id)->with('success', 'Visit updated successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('RCH Edit Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Error: ' . $e->getMessage()]);
        }
    }

    public function searchActivePregnancy(Request $request)
    {
        $patientCode = $request->query('patient_code');
        $pregnancy = RchAncPregnancy::with('patient')
            ->where('patient_code', $patientCode)
            ->where('is_active', true)
            ->first();

        if ($pregnancy) {
            $pregnancy->calculated_ga = Carbon::parse($pregnancy->lmp_date)->diffInWeeks(Carbon::now());
            return response()->json(['status' => 'found', 'data' => $pregnancy]);
        }
        return response()->json(['status' => 'not_found']);
    }

    /**
     * Show History of Visits for a specific Pregnancy.
     */
    public function history($pregnancyId)
    {
        $pregnancy = RchAncPregnancy::with('patient')->findOrFail($pregnancyId);
        
        $visits = RchAncVisit::where('pregnancy_id', $pregnancyId)
            ->with(['opdBooking']) // Load booking if you want to show bill status
            ->latest('created_at')
            ->get();

        return Inertia::render('Hospital/Rch/Antenatal/History', [
            'pregnancy' => $pregnancy,
            'visits' => $visits
        ]);
    }
}