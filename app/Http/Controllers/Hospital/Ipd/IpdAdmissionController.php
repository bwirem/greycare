<?php

namespace App\Http\Controllers\Hospital\Ipd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

// Models
use App\Models\Ipd\IpdAdmission;
use App\Models\Ipd\IpdAdmissionLog;
use App\Models\Opd\OpdBooking;
use App\Models\Ipd\IpdWard;
use App\Models\Ipd\IpdBed;
use App\Models\Patient\Patient;
use App\Models\Patient\PatientBillingGroup;
use App\Models\Billing\BLSCustomer;
use App\Models\Facility\FacilityOption; 

// Services
use App\Services\ConsultationPricingService; // You might need a specific AdmissionPricingService if logic differs
use App\Services\BillingService; 

class IpdAdmissionController extends Controller
{
    /**
     * Display listing of Admissions.
     */   
    public function index(Request $request)
    {
        $query = IpdAdmission::with(['patient', 'ward', 'bed'])
            ->whereIn('status', ['Admitted', 'Pending'])
            ->orderByRaw("FIELD(status, 'Pending', 'Admitted')")
            ->orderBy('created_at', 'desc');

        // 1. Existing Search Filter
        if ($request->search) {
            $query->whereHas('patient', function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('last_name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%");
            });
        }

        // 2. Existing Status Filter
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // --- 3. NEW: Ward Filter ---
        if ($request->ward_id) {
            $query->where('ward_id', $request->ward_id);
        }

        // 4. Fetch Wards for Dropdown
        $wards = IpdWard::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Hospital/Ipd/Admissions/Index', [
            'admissions' => $query->paginate(15)->withQueryString(),
            'wards'      => $wards, // Pass wards to view
            'filters'    => $request->only(['search', 'status', 'ward_id']) // Maintain state
        ]);
    }

    /**
     * Show form for creating admission.
     */    

    public function create(Request $request)
    {
        $patient = null;
        $pendingAdmission = null;

        if ($request->admission_id) {
            $pendingAdmission = IpdAdmission::with(['patient', 'ward'])->find($request->admission_id);
            if ($pendingAdmission) {
                $patient = $pendingAdmission->patient;
            }
        } else if ($request->patient_code) {
            $patient = Patient::where('code', $request->patient_code)->first();
        }

        $wards = IpdWard::with(['rooms.beds' => function($q) {
            $q->where('status', 'Free'); 
        }])->orderBy('name')->get();

        // Get Facility Option for Default Cash Group
        $defaultCashId = FacilityOption::value('default_cash_billing_group_id');

        if ($request->opd_booking_id) {
                OpdBooking::where('id', $request->opd_booking_id)
                    ->update([
                        'consultation_status' => 'Admitted',
                        'ipdstart' => now(),
                    ]);
            }

        return Inertia::render('Hospital/Ipd/Admissions/Create', [
            'patient' => $patient,           
            'wards' => $wards,
            'pendingAdmission' => $pendingAdmission,
            // Select specific columns needed for logic
            'billingGroups' => PatientBillingGroup::select('id', 'name', 'isexemption', 'isinsurance')->get(),
            'defaultCashGroupId' => $defaultCashId
        ]);
    }

    /**
     * Store (Create New, Register Patient if New, or Update Pending)
     */
    public function store(Request $request, BillingService $billingService)
    {      
      
        // 1. Validation
        $isExistingPatient = $request->filled('patient_code');

        $rules = [
            'ward_id' => 'required|exists:ipd_wards,id',
            'admission_date' => 'required|date',
            
            'room_id' => 'nullable|exists:ipd_rooms,id',
            'bed_id' => 'nullable|exists:ipd_beds,id',
            'pending_admission_id' => 'nullable|exists:ipd_admissions,id',

            'billinggroup_id' => 'required|exists:patient_billing_groups,id',
            'billinggroupmembershipno' => 'nullable|string|max:100',
            'authorizationno' => 'nullable|string|max:50',
            // 'schemeid' => 'nullable|string',
        ];
     
        // If New Patient, validate demographics
        if (!$isExistingPatient) {          
 
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

        // Bed Availability Check
        if ($request->filled('bed_id')) {
            $bed = IpdBed::find($request->bed_id);
            if ($bed->status !== 'Free') {
                return back()->withErrors(['bed_id' => 'Selected bed is already occupied.']);
            }
        }

        try {
            DB::beginTransaction();

            // --- A. DETERMINE PAYMENT CATEGORY ---
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
            }

            // --- B. HANDLE PATIENT (Update or Create) ---
            $patientCode = null;

            if ($isExistingPatient) {
                $patientCode = $request->patient_code;
                Patient::where('code', $patientCode)->update([
                    'payment_category'        => $paymentCategory,
                    'insurance_provider_id'   => $insuranceProviderId,
                    'insurance_provider_name' => $insuranceProviderName,
                    'insurance_member_no'     => $insuranceMemberNo,
                ]);
            } else {
                
                // 1. GENERATE UNIQUE CODE
                // The loop keeps running until it finds a code that DOES NOT exist in the database
                do {
                    // Format: PAT-260102-859 (PAT-YYMMDD-Random)
                    $patientCode = 'PAT-' . date('ymd') . '-' . mt_rand(100, 999);
                } while (Patient::where('code', $patientCode)->exists());
              
                // 2. CREATE PATIENT
                // At this point, $patientCode is guaranteed to be unique
                
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

            // Ensure Billing Customer Exists
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

            // --- C. ADMISSION LOGIC ---
            $status = $request->filled('bed_id') ? 'Admitted' : 'Pending';
            $admission = null;

            // Scenario 1: Update Existing Pending Admission
            if ($request->pending_admission_id) {
                $admission = IpdAdmission::find($request->pending_admission_id);
                $admission->update([
                    'ward_id' => $request->ward_id,
                    'room_id' => $request->room_id,
                    'bed_id'  => $request->bed_id,
                    'admission_date' => $request->admission_date,
                    'status' => $status,
                    
                    // Update Billing Info
                    'billinggroup_id' => $validated['billinggroup_id'],
                    'pricecategory'   => $billingGroup->pricecategory ?? 'price1',
                    'billinggroupmembershipno' => $validated['billinggroupmembershipno'] ?? null,
                    'authorizationno' => $validated['authorizationno'] ?? null,
                   
                ]);
            } 
            // Scenario 2: Create New Admission
            else {
                // Check if already active
                $isActive = IpdAdmission::where('patientcode', $patientCode)
                    ->whereIn('status', ['Admitted', 'Pending'])->exists();
                
                if($isActive) {
                    throw new \Exception('Patient is already currently admitted or has a pending request.');
                }

                $admission = IpdAdmission::create([
                    'patientcode' => $patientCode,
                    'opd_booking_id' => $request->opd_booking_id ?? null,
                    'ward_id' => $request->ward_id,
                    'room_id' => $request->room_id,
                    'bed_id' => $request->bed_id,
                    'admission_date' => $request->admission_date,
                    'user_id' => Auth::id(),
                    'status' => $status,

                    // Billing Fields
                    'billinggroup_id' => $validated['billinggroup_id'],
                    'pricecategory'   => $billingGroup->pricecategory ?? 'price1',
                    'billinggroupmembershipno' => $validated['billinggroupmembershipno'] ?? null,
                    'authorizationno' => $validated['authorizationno'] ?? null,
                    'schemeid' => $request->schemeid ?? null,
                ]);
            }

            // --- D. LOGGING & STATUS UPDATES ---

            // 1. Audit Log
            IpdAdmissionLog::create([
                'patientcode' => $admission->patientcode,
                'opd_booking_id' => $admission->opd_booking_id,
                'transdate' => now(),
                'ward_id' => $admission->ward_id,
                'room_id' => $admission->room_id,
                'bed_id' => $admission->bed_id,
                'status' => $status,
                'user_id' => Auth::id(),
                'registrystatus' => $request->urgency ?? 'Routine'
            ]);

            // 2. Bed & Patient Status Update
            if ($request->filled('bed_id')) {
                IpdBed::where('id', $request->bed_id)->update(['status' => 'Occupied']);
                Patient::where('code', $patientCode)->update(['is_admitted' => true]);
            }

            // 3. Update Source OPD Booking (if applicable)
            if ($request->opd_booking_id) {
                OpdBooking::where('id', $request->opd_booking_id)
                    ->update([
                        'consultation_status' => 'Admitted',
                        'ipdstart' => now(),
                    ]);
            }

            // --- E. BILLING (Optional: Add Admission Fee) ---
            // If you have a specific bill item for "Admission Fee" or "Daily Bed Charge", trigger it here.
            // Example:
            /*
            $billingService->addToBill(
                $admission->patientcode,
                $admissionFeeItemId, 
                1,
                'admission',
                $admission->id,
                $admission->pricecategory
            );
            */

            DB::commit();
            return redirect()->route('inpatient0.index')->with('success', 'Admission Processed Successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Admission Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Admission failed: ' . $e->getMessage()]);
        }
    }
}