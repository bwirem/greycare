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

// Services
use App\Services\ConsultationPricingService;
use App\Services\BillingService; // <--- NEW IMPORT

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
                'clinic'       => $booking->treatmentPoint?->name ?? 'General OPD', 
                'status'       => $booking->vitalsignstatus === 'Closed' ? 'Triaged' : 'Waiting',
                'time'         => $booking->created_at->format('h:i A'),
                'visit_type'   => $booking->visit_classification, 
            ];
        });

        return Inertia::render('Hospital/Opd/Registrations/Index', [
            'registrations' => $registrations,
        ]);
    }

    /**
     * Show the form for creating a new registration.
     */
    public function create()
    {
        return Inertia::render('Hospital/Opd/Registrations/Create', [
            'treatmentPoints' => OpdTreatmentPoint::select('id', 'name')->get(),
            'billingGroups'   => PatientBillingGroup::select('id', 'name')->get(),
            'doctors'         => User::select('id', 'name')->get(), 
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

            $patientCode = null;

            // --- 1. DETERMINE PAYMENT CATEGORY ---
            $billingGroup = PatientBillingGroup::findOrFail($validated['billinggroup_id']);
            $isCash = stripos($billingGroup->name, 'Cash') !== false;
            $paymentCategory = $isCash ? 'Cash' : 'Insurance';
            $insuranceProviderId = $isCash ? null : $billingGroup->id;
            $insuranceProviderName = $isCash ? null : $billingGroup->name;
            $insuranceMemberNo = $isCash ? null : ($validated['billinggroupmembershipno'] ?? null);

            // --- 2. HANDLE PATIENT & CUSTOMER ---
            if ($isRevisit) {
                $patientCode = $request->existing_patient_code;
                
                // Update Patient Master
                Patient::where('code', $patientCode)->update([
                    'payment_category'        => $paymentCategory,
                    'insurance_provider_id'   => $insuranceProviderId,
                    'insurance_provider_name' => $insuranceProviderName,
                    'insurance_member_no'     => $insuranceMemberNo,
                ]);

                // Ensure Billing Customer exists
                $existingPatient = Patient::find($patientCode);
                if ($existingPatient) {
                    BLSCustomer::firstOrCreate(['patient_code' => $patientCode], [
                        'customer_type' => 'individual',
                        'first_name' => $existingPatient->first_name,
                        'surname' => $existingPatient->last_name,
                        'other_names' => $existingPatient->middle_name,
                        'phone' => $existingPatient->phone_number,
                    ]);
                }

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

                BLSCustomer::create([
                    'patient_code'  => $patientCode,
                    'customer_type' => 'individual',
                    'first_name'    => $validated['first_name'],
                    'surname'       => $validated['last_name'],
                    'other_names'   => $request->middle_name,
                    'phone'         => $validated['phone_number'],
                ]);
            }

            // --- 3. CALCULATE CHARGE (New/Revisit) ---
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

            // --- 6. PUSH TO BILLING (The Magic Step) ---
            if ($booking->bill_item_id) {
                               
                $billingService->addToBill(
                    $booking->patientcode,      // Patient Code
                    $booking->bill_item_id,     // Billing Item ID (from Pricing Service)
                    1,                          // Quantity
                    'consultation',             // Source Type (Matches Schema)
                    $booking->id                // Source ID (OpdBooking ID)
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
            
            // 1. Payment Category Logic
            $billingGroup = PatientBillingGroup::findOrFail($validated['billinggroup_id']);
            $isCash = stripos($billingGroup->name, 'Cash') !== false;
            $paymentCategory = $isCash ? 'Cash' : 'Insurance';
            $insuranceProviderId = $isCash ? null : $billingGroup->id;
            $insuranceProviderName = $isCash ? null : $billingGroup->name;
            $insuranceMemberNo = $isCash ? null : ($validated['billinggroupmembershipno'] ?? null);

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
            ]);

            // 4. Update Booking & Re-Bill if Doctor Changed
            $doctorName = $booking->DoctorName; 
            $updateData = [
                'treatmentpoint_id' => $validated['treatmentpoint_id'],
                'billinggroup_id'   => $validated['billinggroup_id'],
                'doctor_user_id'    => $validated['doctor_user_id'],
                'wheretaken'        => OpdTreatmentPoint::find($validated['treatmentpoint_id'])->name,
                'billinggroupmembershipno' => $validated['billinggroupmembershipno'] ?? null,
            ];

            $shouldUpdateBill = false;

            if (isset($validated['doctor_user_id']) && $validated['doctor_user_id'] != $booking->doctor_user_id) {
                $doctorName = User::find($validated['doctor_user_id'])?->name;
                $updateData['DoctorName'] = $doctorName;

                // Recalculate only if unpaid
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

            $booking->update($updateData);

            // 5. Push Updated Charge to Billing
            if ($shouldUpdateBill && $booking->bill_item_id) {
                $billingService->addToBill(
                    $booking->patientcode,
                    $booking->bill_item_id, // New Item ID
                    1,
                    'consultation',
                    $booking->id
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