<?php

namespace App\Http\Controllers\Hospital\Opd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

// Models
use App\Models\Patient\Patient;
use App\Models\Opd\OpdBooking;
use App\Models\Opd\OpdTreatmentPoint;
use App\Models\Patient\PatientBillingGroup;
use App\Models\Patient\PatientBillingSubgroup;

use App\Models\MedicalRecord\MrVitalSign;
use App\Models\User;
use App\Models\UserGroupFunction;
use App\Models\UserGroupModuleItem;
use App\Models\Billing\BLSCustomer;
use App\Models\Billing\BILOrder;

use App\Models\Facility\FacilityOption; 
use Barryvdh\DomPDF\Facade\Pdf;

// Services
use App\Services\ConsultationPricingService;
use App\Services\BillingService; 

class OpdRegistrationController extends Controller
{
    // Helper to get user permissions
    private function getUserPermissions() {
        $user = Auth::user();
        if (!$user) return [];

        return UserGroupModuleItem::join('usergroupfunctions', 'usergroupmoduleitems.id', '=', 'usergroupfunctions.usergroupmoduleitem_id')
            ->where('usergroupmoduleitems.usergroup_id', $user->usergroup_id)
            ->get(['usergroupmoduleitems.moduleitemkey', 'usergroupfunctions.functionaccesskey'])
            ->map(function ($item) {
                // Creates strings like "systemconfiguration2.allow_price"
                return $item->moduleitemkey . '.' . $item->functionaccesskey; 
            })
            ->toArray();
    }

    /**
     * Display a listing of OPD Registrations.
     */   
    
    public function index(Request $request)
    {
        // 1. Get the date from request, default to Today
        $dateFilter = $request->input('date', date('Y-m-d'));

        $bookings = OpdBooking::with(['patient', 'billingGroup', 'treatmentPoint', 'latestVitalSign'])
            // 2. Use the variable instead of now()
            ->whereDate('created_at', $dateFilter) 
            ->whereNotIn('consultation_status', ['Seen']) 
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
                'treatment_point_id' => $booking->treatmentpoint_id, 
                'clinic'       => $booking->treatmentPoint?->name ?? 'General OPD', 
                'status'       => $booking->vitalsignstatus === 'Sent' ? 'Triaged' : 'Waiting',
                'time'         => $booking->created_at->format('h:i A'),
                'visit_type'   => $booking->visit_classification, 
            ];
        });

        $treatmentPoints = OpdTreatmentPoint::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Hospital/Opd/Registrations/Index', [
            'registrations' => $registrations,
            'treatmentPoints' => $treatmentPoints,
            // 3. Pass the filter back to React
            'filters' => [
                'date' => $dateFilter
            ],
            'userPermissions' => $this->getUserPermissions(),
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
            'billingGroups'   => PatientBillingGroup::select('id', 'name', 'isexemption', 'isinsurance','hassubgroups')->get(),
            'billingSubgroups' => PatientBillingSubgroup::select('id', 'name')->get(),  
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
            'billingsubgroup_id'   => 'nullable|exists:patient_billing_subgroups,id',
            
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
                'address'   => 'nullable|string|max:255',
            ]);
        }

        $validated = $request->validate($rules);     

        try {
            DB::beginTransaction();

            // --- 1. DETERMINE PAYMENT CATEGORY ---
            $billingGroup = PatientBillingGroup::findOrFail($validated['billinggroup_id']);
            //$billingSubGroup = PatientBillingSubgroup::findOrFail($validated['billingsubgroup_id']);
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
                    'address'   => $validated['address'],
                    
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
                    'patient_code'  => $patientCode,                    
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
                'billingsubgroup_id' => $validated['billingsubgroup_id'] ?? null,   
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

           
            // --- 6. CHECK PERMISSIONS (For Redirection Logic) ---
            $user = auth()->user();
            $hasChargePermission = false;

            if ($user && $user->usergroup_id) {
                $hasChargePermission = UserGroupFunction::query()
                    ->where('usergroup_id', $user->usergroup_id)
                    ->where('functionaccesskey', 'charge_patient')
                    ->whereHas('userGroupModuleItem', function ($query) {
                        $query->where('moduleitemkey', 'outpatient4');
                    })
                    ->exists();
            }

            // --- 6. PUSH TO BILLING ---
            $generatedOrder = null; // Variable to hold the order
            if ($booking->bill_item_id) {
               $generatedOrder = $billingService->addToBill(
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

             // If Cash + Permission + Order Exists => Go to Edit/Payment Screen
            if ($hasChargePermission && $paymentCategory == 'Cash' && $generatedOrder) {                
                
                // Redirects to BilPostController@edit logic automatically
                return redirect()->route('outpatient0.billing.edit', ['order' => $generatedOrder->id])
                    ->with('success', 'Registration Successful. File: ' . $patientCode);
            }

            // Otherwise (Insurance, Exemption, or User cannot collect cash), 
            // go back to the Registration List.
            return redirect()->route('outpatient0.index')
                ->with('success', 'Registration Successful. File: ' . $patientCode);
           

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
        $booking = OpdBooking::with('patient')->findOrFail($id);

        return Inertia::render('Hospital/Opd/Registrations/Edit', [
            'booking'          => $booking,
            'treatmentPoints'  => OpdTreatmentPoint::select('id', 'name')->get(),         
            // ADDED hassubgroups to the select array!
            'billingGroups'    => PatientBillingGroup::select('id', 'name', 'isexemption', 'isinsurance', 'hassubgroups')->get(),
            // ADDED billingSubgroups to the view!
            'billingSubgroups' => PatientBillingSubgroup::select('id', 'name')->get(),  
            'doctors'          => User::select('id', 'name')->whereNotNull('specialization_id')->get(), 
        ]);
    }

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
            'address'        => 'nullable|string|max:255',
            
            'treatmentpoint_id' => 'required|exists:opd_treatmentpoints,id',
            'doctor_user_id'    => 'nullable|exists:users,id', 
            'billinggroup_id'   => 'required|exists:patient_billing_groups,id',
            'billingsubgroup_id' => 'nullable|exists:patient_billing_subgroups,id',
            'billinggroupmembershipno' => 'nullable|string|max:100',
            'authorizationno'   => 'nullable|string|max:100',
            'schemeid'          => 'nullable|string|max:100',
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
                'address'       => $validated['address'],
                
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

            // 4. Update Booking & Re-Bill
            $doctorName = $booking->DoctorName; 
            $updateData = [
                'treatmentpoint_id' => $validated['treatmentpoint_id'],
                'billinggroup_id'   => $validated['billinggroup_id'],
                'billingsubgroup_id' => $validated['billingsubgroup_id'] ?? null,
                'doctor_user_id'    => $validated['doctor_user_id'],
                'wheretaken'        => OpdTreatmentPoint::find($validated['treatmentpoint_id'])->name,
                
                // Update price category on the booking
                'pricecategory'            => $billingGroup->pricecategory ?? 'price1',
                
                'billinggroupmembershipno' => $validated['billinggroupmembershipno'] ?? null,
                'authorizationno'          => $validated['authorizationno'] ?? null,
                'schemeid'                 => $validated['schemeid'] ?? null,
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
                    $booking->pricecategory,
                    $paymentCategory 
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

     /**
     * Renders the Control Number PDF to the browser for preview or frontend printing.
     */
    public function controlNumberPreview()
    {
        // 1. Retrieve the data saved in the session during createOrder/updateOrder
        $orderId = session('latest_order_id');
        $controlResponse = session('latest_control_response');

        if (!$orderId) {
            // Adjust the redirect route to match your application's flow
            return redirect()->back()->with('error', 'No control number to display.');
        }

        // 2. Fetch the Order and eager load relationships needed for the receipt
        $order = BILOrder::with(['customer', 'orderitems.item'])->findOrFail($orderId);
        
        // 3. Fetch Facility details for the header
        $facility = FacilityOption::first();

        // 4. Define Custom Paper Size [0, 0, Width, Height] in points
        // 80mm = 226.77 points. Height is long (1000) to act as a continuous roll.
        $customPaper = array(0, 0, 226.77, 1000); 

        // 5. Generate the PDF
        $pdf = Pdf::loadView('pdfs.control_number_receipt', [
            'order' => $order,
            'controlResponse' => $controlResponse,
            'facility' => $facility,
        ])->setPaper($customPaper, 'portrait');

        // 6. Return as inline PDF so the browser opens it in a preview/print tab
        return response($pdf->output(), 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="control_number_ORD-' . $order->id . '.pdf"');
    }
}

