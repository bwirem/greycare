<?php

namespace App\Http\Controllers\Hospital\Opd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

// Models
use App\Models\Patient\Patient;
use App\Models\Opd\OpdBooking;
use App\Models\Opd\OpdTreatmentPoint;
use App\Models\Patient\PatientBillingGroup;
use App\Models\MedicalRecord\MrVitalSign;
use App\Models\User;
use App\Models\Billing\BLSCustomer;
use App\Models\Facility\FacilityOption; 

// Services
use App\Services\ConsultationPricingService;
use App\Services\BillingService; 

class OpdRegistrationController extends Controller
{
    /**
     * Display a listing of OPD Registrations.
     */   
    public function index()
    {
        $bookings = OpdBooking::with(['patient', 'billingGroup', 'treatmentPoint', 'latestVitalSign'])
            ->whereDate('created_at', now()) 
            ->latest() 
            ->get();

        $registrations = $bookings->map(function ($booking) {
            return [
                'id'           => $booking->id,
                'visit_number' => $booking->visit_number,
                'file_number'  => $booking->patient?->code ?? 'N/A',
                'patient_name' => $booking->patient 
                                    ? $booking->patient->first_name . ' ' . $booking->patient->last_name 
                                    : 'Unknown',
                'age'          => $booking->patient?->age ?? 0,
                'gender'       => $booking->patient?->gender ?? '-',
                'payment_mode' => $booking->billingGroup?->name ?? 'Cash',
                'doctor_name'  => $booking->DoctorName ?? 'Unassigned',
                
                // --- ADD THIS LINE ---
                'treatment_point_id' => $booking->treatmentpoint_id, 
                // ---------------------

                'clinic'       => $booking->treatmentPoint?->name ?? 'General OPD', 
                'status'       => $booking->vitalsignstatus === 'Closed' ? 'Triaged' : 'Waiting',
                'time'         => $booking->created_at->format('h:i A'),
                'visit_type'   => $booking->visit_classification, 
            ];
        });

        // --- FETCH TREATMENT POINTS ---
        $treatmentPoints = OpdTreatmentPoint::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Hospital/Opd/Registrations/Index', [
            'registrations' => $registrations,
            'treatmentPoints' => $treatmentPoints,
        ]);
    }

    /**
     * Show the form for creating a new registration.
     */
    public function create()
    {
        // Get default cash ID
        $defaultCashId = FacilityOption::value('default_cash_billing_group_id');

        return Inertia::render('Hospital/Opd/Registrations/Create', [
            'treatmentPoints' => OpdTreatmentPoint::select('id', 'name')->get(),         
            'billingGroups'   => PatientBillingGroup::select('id', 'name', 'isexemption', 'isinsurance')->get(),
            'doctors'         => User::select('id', 'name')
                                    ->whereNotNull('specialization_id')
                                    ->get(), 
            'defaultCashId'   => $defaultCashId,
        ]);
    }

    /**
     * AJAX Search for Patients
     */
    public function searchPatient(Request $request)
    {
        $query = $request->input('query');

        if (!$query || strlen($query) < 2) {
            return response()->json([]);
        }

        $patients = Patient::where('code', 'like', "%{$query}%")
            ->orWhere('first_name', 'like', "%{$query}%")
            ->orWhere('last_name', 'like', "%{$query}%")
            ->orWhere('phone_number', 'like', "%{$query}%")
            ->orWhere('national_id', 'like', "%{$query}%")
            ->limit(10)
            ->get(['code', 'first_name', 'last_name', 'middle_name', 'gender', 'date_of_birth', 'national_id', 'phone_number']);

        return response()->json($patients);
    }

    /**
     * Store: Register Patient & Push Charge to Billing
     */
    public function store(Request $request, ConsultationPricingService $pricingService, BillingService $billingService)
    {  
        $isRevisit = $request->filled('existing_patient_code');

        $rules = [
            'treatmentpoint_id' => 'required|exists:opd_treatmentpoints,id',
            'doctor_user_id'    => 'nullable|exists:users,id', 
            'billinggroup_id'   => 'required|exists:patient_billing_groups,id',
            
            'authorizationno'          => 'nullable|string|max:50',
            'billinggroupmembershipno' => 'nullable|string|max:100', 
            
            'weight'            => 'nullable|numeric',
            'temp'              => 'nullable|numeric',
        ];     
       
        if (!$isRevisit) {
            $rules = array_merge($rules, [
                'first_name'    => 'required|string|max:255',
                'last_name'     => 'required|string|max:255',
                'gender'        => 'required|string|in:Male,Female',
                'date_of_birth' => 'required|date',
                'national_id'   => 'nullable|string|max:50|unique:patients,national_id',
                'phone_number'  => 'required|string|max:50',
                'middle_name'   => 'nullable|string|max:255',
            ]);
        }

        $validated = $request->validate($rules);     

        try {
            DB::beginTransaction();

            // --- 1. DETERMINE PAYMENT CATEGORY ---
            $billingGroup = PatientBillingGroup::findOrFail($validated['billinggroup_id']);
            $facilityOption = FacilityOption::first();

            $paymentCategory = 'Cash';
            $insuranceProviderId = null;
            $insuranceProviderName = null;
            $insuranceMemberNo = null;

            if ($billingGroup->isexemption) {
                $paymentCategory = 'Exemption';
                $insuranceProviderName = $billingGroup->name;
                $insuranceMemberNo = $validated['billinggroupmembershipno'] ?? null;
            } elseif ($billingGroup->isinsurance) {
                $paymentCategory = 'Insurance';
                $insuranceProviderId = $billingGroup->id;
                $insuranceProviderName = $billingGroup->name;
                $insuranceMemberNo = $validated['billinggroupmembershipno'] ?? null;
            } elseif ($facilityOption && $billingGroup->id != $facilityOption->default_cash_billing_group_id) {
                $paymentCategory = 'Invoice';
                $insuranceProviderId = $billingGroup->id;
                $insuranceProviderName = $billingGroup->name;
                $insuranceMemberNo = $validated['billinggroupmembershipno'] ?? null;
            } else {
                $paymentCategory = 'Cash';
            }

            // --- 2. HANDLE PATIENT & CUSTOMER ---
            $patientCode = null;

            if ($isRevisit) {
                $patientCode = $request->existing_patient_code;
                
                Patient::where('code', $patientCode)->update([
                    'payment_category'        => $paymentCategory,
                    'insurance_provider_id'   => $insuranceProviderId,
                    'insurance_provider_name' => $insuranceProviderName,
                    'insurance_member_no'     => $insuranceMemberNo,
                ]);

            } else {
                $patientCode = 'PAT-' . date('y') . '-' . strtoupper(Str::random(6)); 
              
                Patient::create([
                    'code'          => $patientCode,
                    'first_name'    => $validated['first_name'],
                    'last_name'     => $validated['last_name'],
                    'middle_name'   => $request->middle_name,
                    'gender'        => $validated['gender'],
                    'date_of_birth' => $validated['date_of_birth'],
                    'national_id'   => $validated['national_id'] ?? null,
                    'phone_number'  => $validated['phone_number'],
                    
                    'payment_category'        => $paymentCategory,
                    'insurance_provider_id'   => $insuranceProviderId,
                    'insurance_provider_name' => $insuranceProviderName,
                    'insurance_member_no'     => $insuranceMemberNo,
                ]);
            }

            // Ensure Billing Customer exists
            BLSCustomer::firstOrCreate(
                ['patient_code' => $patientCode], 
                [
                    'customer_type' => 'individual',
                    'first_name'    => $validated['first_name'] ?? Patient::where('code', $patientCode)->value('first_name'),
                    'surname'       => $validated['last_name'] ?? Patient::where('code', $patientCode)->value('last_name'),
                    'other_names'   => $request->middle_name ?? Patient::where('code', $patientCode)->value('middle_name'),
                    'phone'         => $validated['phone_number'] ?? Patient::where('code', $patientCode)->value('phone_number'),
                    'billing_group_id' => $billingGroup->id,
                ]
            );

            // --- 3. CALCULATE CHARGE ---
            $chargeDetails = $pricingService->determineConsultationCharge(
                $patientCode, 
                $validated['doctor_user_id']
            );

            // --- 4. CREATE BOOKING ---
            $clinicName = OpdTreatmentPoint::find($validated['treatmentpoint_id'])->name;
            $doctorName = null;
            if ($request->filled('doctor_user_id')) {
                $doctorName = User::find($request->doctor_user_id)?->name;
            }
            
            $hasVitals = !empty($validated['weight']) || !empty($validated['temp']);
            
            $booking = OpdBooking::create([
                'bookdate'           => now(),
                'patientcode'        => $patientCode,
                'treatmentpoint_id'  => $validated['treatmentpoint_id'],
                'billinggroup_id'    => $validated['billinggroup_id'],
                'doctor_user_id'     => $validated['doctor_user_id'],
                'user_id'            => auth()->id(),
                'wheretaken'         => $clinicName,
                'DoctorName'         => $doctorName,
                'vitalsignstatus'    => $hasVitals ? 'Closed' : 'Pending',
                'consultation_status'=> 'Pending',
                
                // Store the Price Category on the Booking Record
                'pricecategory'            => $billingGroup->pricecategory ?? 'price1', 
                
                'billinggroupmembershipno' => $validated['billinggroupmembershipno'] ?? null, 
                'authorizationno'          => $validated['authorizationno'] ?? null,          
                'schemeid'                 => $request->schemeid ?? null,

                'bill_item_id'         => $chargeDetails['bill_item_id'] ?? null,
                'visit_classification' => $chargeDetails['classification'] ?? 'New Case',
                'payment_status'       => 'unpaid',
            ]);

            // --- 5. CREATE VITALS ---
            if ($hasVitals) {
                MrVitalSign::create([
                    'opd_booking_id' => $booking->id,
                    'patientcode'    => $patientCode,
                    'user_id'        => auth()->id(),
                    'vitaldatetime'  => now(),
                    'weight'         => $validated['weight'] ?? 0,
                    'temperature'    => $validated['temp'] ?? 0,
                ]);
            }

            // --- 6. PUSH TO BILLING ---
            if ($booking->bill_item_id) {
                $billingService->addToBill(
                    $booking->patientcode,      
                    $booking->bill_item_id,     
                    1,                          
                    'consultation',             
                    $booking->id,               
                    $booking->pricecategory, // Pass price category (e.g., price1, price2)
                    $paymentCategory //e.g. Cash,Exemption,Insurance, 
                );
            }

            DB::commit();
            return redirect()->route('outpatient0.index')->with('success', 'Registration Successful. File: ' . $patientCode);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Registration Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Registration failed: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $booking = OpdBooking::with(['patient', 'billingGroup', 'treatmentPoint', 'user', 'latestVitalSign'])
            ->findOrFail($id);

        return Inertia::render('Hospital/Opd/Registrations/Show', [
            'booking' => $booking
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $booking = OpdBooking::with(['patient'])->findOrFail($id);

        return Inertia::render('Hospital/Opd/Registrations/Edit', [
            'booking' => $booking,
            'treatmentPoints' => OpdTreatmentPoint::select('id', 'name')->get(),
            'billingGroups'   => PatientBillingGroup::select('id', 'name')->get(),
            'doctors'         => User::select('id', 'name')->get(),
        ]);
    }

    /**
     * Update: Edit Registration details & Update Bill if needed
     */
    public function update(Request $request, $id, ConsultationPricingService $pricingService, BillingService $billingService)
    {
        $booking = OpdBooking::findOrFail($id);
        $patient = Patient::where('code', $booking->patientcode)->first();

        $validated = $request->validate([
            'first_name'     => 'required|string|max:255',
            'last_name'      => 'required|string|max:255',
            'middle_name'    => 'nullable|string|max:255',
            'date_of_birth'  => 'nullable|date',
            'contact'        => 'nullable|string|max:50', 
            
            'treatmentpoint_id' => 'required|exists:opd_treatmentpoints,id',
            'doctor_user_id'    => 'nullable|exists:users,id', 
            'billinggroup_id'   => 'required|exists:patient_billing_groups,id',
            'billinggroupmembershipno' => 'nullable|string|max:100',
        ]);

        DB::transaction(function () use ($validated, $booking, $patient, $pricingService, $billingService, $request) {
            
            // 1. PAYMENT CATEGORY LOGIC
            $billingGroup = PatientBillingGroup::findOrFail($validated['billinggroup_id']);
            $facilityOption = FacilityOption::first();

            $paymentCategory = 'Cash';
            $insuranceProviderId = null;
            $insuranceProviderName = null;
            $insuranceMemberNo = null;

            if ($billingGroup->isexemption) {
                $paymentCategory = 'Exemption';
                $insuranceProviderName = $billingGroup->name;
                $insuranceMemberNo = $validated['billinggroupmembershipno'] ?? null;
            } elseif ($billingGroup->isinsurance) {
                $paymentCategory = 'Insurance';
                $insuranceProviderId = $billingGroup->id;
                $insuranceProviderName = $billingGroup->name;
                $insuranceMemberNo = $validated['billinggroupmembershipno'] ?? null;
            } elseif ($facilityOption && $billingGroup->id != $facilityOption->default_cash_billing_group_id) {
                $paymentCategory = 'Invoice';
                $insuranceProviderId = $billingGroup->id;
                $insuranceProviderName = $billingGroup->name;
                $insuranceMemberNo = $validated['billinggroupmembershipno'] ?? null;
            } else {
                $paymentCategory = 'Cash';
            }

            // 2. Update Patient
            $patient->update([
                'first_name'    => $validated['first_name'],
                'last_name'     => $validated['last_name'],
                'middle_name'   => $validated['middle_name'],
                'date_of_birth' => $validated['date_of_birth'],
                'phone_number'  => $validated['contact'] ?? $patient->phone_number,
                
                'payment_category'        => $paymentCategory,
                'insurance_provider_id'   => $insuranceProviderId,
                'insurance_provider_name' => $insuranceProviderName,
                'insurance_member_no'     => $insuranceMemberNo,
            ]);

            // 3. Update Customer
            BLSCustomer::where('patient_code', $patient->code)->update([
                'first_name'  => $validated['first_name'],
                'surname'     => $validated['last_name'],
                'other_names' => $validated['middle_name'],
                'phone'       => $validated['contact'] ?? $patient->phone_number,
                'billing_group_id' => $billingGroup->id,
            ]);

            // 4. Update Booking & Re-Bill
            $doctorName = $booking->DoctorName; 
            $updateData = [
                'treatmentpoint_id' => $validated['treatmentpoint_id'],
                'billinggroup_id'   => $validated['billinggroup_id'],
                'doctor_user_id'    => $validated['doctor_user_id'],
                'wheretaken'        => OpdTreatmentPoint::find($validated['treatmentpoint_id'])->name,
                
                // Update price category on the booking
                'pricecategory'            => $billingGroup->pricecategory ?? 'price1',
                
                'billinggroupmembershipno' => $validated['billinggroupmembershipno'] ?? null,
            ];

            $shouldUpdateBill = false;

            if (isset($validated['doctor_user_id']) && $validated['doctor_user_id'] != $booking->doctor_user_id) {
                $doctorName = User::find($validated['doctor_user_id'])?->name;
                $updateData['DoctorName'] = $doctorName;

                if ($booking->payment_status === 'unpaid') {
                    $chargeDetails = $pricingService->determineConsultationCharge(
                        $patient->code, 
                        $validated['doctor_user_id']
                    );
                    
                    if ($chargeDetails) {
                        $updateData['bill_item_id'] = $chargeDetails['bill_item_id'];
                        $updateData['visit_classification'] = $chargeDetails['classification'];
                        $shouldUpdateBill = true;
                    }
                }
            }

            // Perform Update
            $booking->update($updateData);

            // 5. Push Updated Charge to Billing
            if ($shouldUpdateBill && $booking->bill_item_id) {
                $billingService->addToBill(
                    $booking->patientcode,
                    $booking->bill_item_id, 
                    1,
                    'consultation',
                    $booking->id,
                    $booking->pricecategory, // Use the updated price category
                    $paymentCategory //e.g. Cash,Exemption,Insurance, 
                );
            }
        });

        return redirect()->route('outpatient0.index')->with('success', 'Registration updated successfully.');
    }

    /**
     * Print the OPD Ticket/Slip.
     */
    public function printSlip($id)
    {
        $booking = OpdBooking::with(['patient', 'treatmentPoint'])->findOrFail($id);
        return view('prints.opd_slip', compact('booking'));
    }
}

