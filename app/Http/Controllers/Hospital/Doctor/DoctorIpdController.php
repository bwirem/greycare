<?php

namespace App\Http\Controllers\Hospital\Doctor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;

// Models - IPD
use App\Models\Ipd\IpdAdmission;
use App\Models\Ipd\IpdWardRound;
use App\Models\Ipd\IpdDischargeSummary;

// Models - Services
use App\Models\Pharmacy\PharmacyPrescription;
use App\Models\Pharmacy\PharmacyFrequency;
use App\Models\Pharmacy\PharmacyDuration;
use App\Models\Inventory\SIV_Product;

// Models - Diagnoses ICD
use App\Models\MedicalRecord\MrPatientDiagnosisIcdConfirmed;
use App\Models\MedicalRecord\MrPatientDiagnosisIcdProvisional;
use App\Models\MedicalRecord\MrPatientDiagnosisIcdDifferential;

// Models - Diagnoses
use App\Models\MedicalRecord\MrPatientDiagnosisConfirmed;
use App\Models\MedicalRecord\MrPatientDiagnosisProvisional;
use App\Models\MedicalRecord\MrPatientDiagnosisDifferential;

// Diagnosis Source Models
use App\Models\Diagnosis\DxtDiagnosesIpd;
use App\Models\Diagnosis\DxtDiagnosesIcd;

// Models - Lab, Radiology, Blood Bank
use App\Models\Laboratory\LabPrescription;
use App\Models\Laboratory\LabPanel;

// Radiology
use App\Models\Radiology\RadRequest;
use App\Models\Radiology\RadProcedure;

// Theatre
use App\Models\Theatre\TheatreProcedure;
use App\Models\Theatre\TheatreBooking;
use App\Models\Theatre\Theatre;

// Blood Bank
use App\Models\BloodBank\BbIssueRequest;
use App\Models\BloodBank\BbComponentType;

use App\Models\Ipd\IpdWard; // Import Ward Model

use App\Models\Billing\BILOrderItem;
use App\Models\Billing\BILOrder;

// --- NEW IMPORT: Billing Service ---
use App\Services\BillingService; 
use App\Services\IcdMappingService;

class DoctorIpdController extends Controller
{
    /**
     * 1. Ward List (Admitted Patients)
     */   
    public function index(Request $request)
    {
        $query = IpdAdmission::with(['patient', 'ward', 'bed'])
            ->where('status', 'Admitted');

        // Patient Search
        if ($request->search) {
            $search = trim($request->search);

            $query->whereHas('patient', function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                ->orWhere('first_name', 'like', "%{$search}%")
                ->orWhere('middle_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        // Ward Filter
        if ($request->ward_id) {
            $query->where('ward_id', $request->ward_id);
        }

        $wards = IpdWard::select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Hospital/Doctor/Ipd/Index', [
            'admissions' => $query->orderBy('ward_id')
                ->paginate(20)
                ->withQueryString(),

            'wards' => $wards,

            'filters' => $request->only([
                'search',
                'ward_id'
            ]),
        ]);
    }
    /**
     * 2. Ward Round Form
     */
    public function create(IpdAdmission $admission)
    {
         $admission->load([
            'patient',
            'wardRounds' => function($q) {
                $q->orderBy('round_date', 'desc')->with(['doctor', 'examination', 'assessment']);
            },
            
            // --- FIX: Load OPD Results & Reports Deeply ---
            
            // 1. OPD Lab Results
            'booking.labRequests.panel',
            'booking.labRequests.sample.results.parameter', // <--- WAS MISSING
            
            // 2. OPD Radiology Reports
            'booking.radiologyRequests.procedure',
            'booking.radiologyRequests.report', // <--- WAS MISSING
            
            // 3. OPD Diagnoses & Meds
            'booking.diagnosesConfirmed.diagnosis.icdMap',
            'booking.diagnosesProvisional.diagnosis.icdMap',
            'booking.icdDiagnosesConfirmed.icdDiagnosis',
            'booking.icdDiagnosesProvisional.icdDiagnosis',
            'booking.prescriptions.product',
            'booking.theatreBookings.procedure', 
            'booking.user',
           
            //History 
            'booking.history',

            // --- IPD Active Orders (Already correct) ---
            'labRequests.panel', 
            'labRequests.sample.results.parameter',
            'radiologyRequests.procedure',
            'radiologyRequests.report',
            'prescriptions.product',
            'bloodRequests.componentType',
            'theatreBookings.procedure', 
        ]);

        // ... (Existing Diagnosis History logic remains the same) ...
        $diagHistory = collect();
        $coveredIcdCodes = [];

        $genConf = MrPatientDiagnosisConfirmed::where('ipd_admission_id', $admission->id)
            ->with(['diagnosis.icdMap', 'user'])->get();
        $genProv = MrPatientDiagnosisProvisional::where('ipd_admission_id', $admission->id)
            ->with(['diagnosis.icdMap', 'user'])->get();
        $icdConf = MrPatientDiagnosisIcdConfirmed::where('ipd_admission_id', $admission->id)
            ->with(['icdDiagnosis', 'user'])->get();
        $icdProv = MrPatientDiagnosisIcdProvisional::where('ipd_admission_id', $admission->id)
            ->with(['icdDiagnosis', 'user'])->get();

        $processRecords = function($records, $status, $source) use (&$diagHistory, &$coveredIcdCodes) {
            foreach($records as $rec) {
                $icdCode = '-';
                $icdName = null;
                $localName = null;

                if ($source === 'local') {
                    $localName = $rec->diagnosis?->name ?? $rec->diagnosisdescription;
                    $icdCode = $rec->diagnosis?->icdMap?->code ?? $rec->diagnosis?->maptocode ?? '-';
                    $icdName = $rec->diagnosis?->icdMap?->name ?? null;
                    if ($icdCode !== '-') { $coveredIcdCodes[] = $icdCode; }
                } else {
                    $icdCode = $rec->icdDiagnosis?->code ?? '-';
                    $icdName = $rec->icdDiagnosis?->name ?? $rec->diagnosisdescription;
                    if (in_array($icdCode, $coveredIcdCodes)) { continue; }
                }

                $diagHistory->push([
                    'id' => $rec->id,
                    'created_at' => $rec->created_at,
                    'user_name' => $rec->user?->name ?? 'Unknown',
                    'status_label' => $status,
                    'local_name' => $localName,
                    'icd_code' => $icdCode,
                    'icd_name' => $icdName,
                ]);
            }
        };

        $processRecords($genConf, 'Confirmed', 'local');
        $processRecords($genProv, 'Provisional', 'local');
        $processRecords($icdConf, 'Confirmed', 'icd');
        $processRecords($icdProv, 'Provisional', 'icd');

        $sortedDiagHistory = $diagHistory->sortByDesc('created_at')->values();
        
        return Inertia::render('Hospital/Doctor/Ipd/WardRound', [
            'admission' => $admission,
            'patient' => $admission->patient,
            'previous_rounds' => $admission->wardRounds,
            'opd_consultation' => $admission->booking, 
            'diagnosis_history' => $sortedDiagHistory,
            'ordered_labs' => $admission->labRequests,
            'ordered_rads' => $admission->radiologyRequests,
            'ordered_meds' => $admission->prescriptions,
            'ordered_surgeries' => $admission->theatreBookings,
            'ordered_blood' => $admission->bloodRequests,

            // Data for Select Options
            'icd_list' => DxtDiagnosesIcd::select('id', 'name', 'code')->get(),    
            // 'ipd_diagnoses_list' => DxtDiagnosesIpd::with('icdMap:id,name,code')
            //     ->select('id', 'name', 'maptocode')->limit(100)->get(),                
            'lab_panels' => LabPanel::select('id', 'name')->orderBy('name')->get(),
            'rad_procedures' => RadProcedure::select('id', 'name')->orderBy('name')->get(),
            'surgery_procedures' => TheatreProcedure::select('id', 'name')->orderBy('name')->get(),
            'bb_components' => BbComponentType::select('id', 'name')->get(),
            'pharmacy_frequencies' => PharmacyFrequency::select('id', 'name', 'code', 'value')->get(),
            'pharmacy_durations' => PharmacyDuration::select('id', 'name', 'code', 'days')->where('is_active', true)->get(),
            'drugs_list' => SIV_Product::with('drugDetails') 
                ->select('id', 'name', 'costprice') 
                ->orderBy('name')
                ->get(),
            'theatre_list' => Theatre::select('id', 'name', 'type')->where('is_active', true)->orderBy('name')->get()

        ]);
    }

    /**
     * 3. Save Round - UPDATED WITH BILLING
     */
    public function store(Request $request, IpdAdmission $admission, BillingService $billingService, IcdMappingService $icdMappingService)
    {
        $request->validate([
            'clinical_notes' => 'required|string',
            'treatment_plan' => 'nullable|string',
            'general_condition' => 'nullable|string',
            'lab_requests' => 'nullable|array',
            'rad_requests' => 'nullable|array',
            'blood_requests' => 'nullable|array',
            'new_prescriptions' => 'nullable|array',
            'diagnoses' => 'nullable|array',
            'surgery_requests' => 'nullable|array',
        ]);

        try {
            DB::beginTransaction();
            
            // A. Create Ward Round Event
            $round = IpdWardRound::create([
                'ipd_admission_id' => $admission->id,
                'user_id' => Auth::id(),
                'patientcode' => $admission->patientcode,
                'round_date' => now(),
                'clinical_notes' => $request->clinical_notes,
                'treatment_plan' => $request->treatment_plan,
                'general_condition' => $request->general_condition,
            ]);

            // B. Save Physical Exam
            $round->examination()->create([
                'general_condition' => $request->general_condition,
                'glasgow_coma_score' => $request->glasgow_coma_score ?? null,
                'pallor' => $request->boolean('pallor') ? 1 : 0,
                'jaundice' => $request->boolean('jaundice') ? 1 : 0,
                'cvs_examination' => $request->cvs_examination ?? null,
                'rs_examination' => $request->rs_examination ?? null,
                'abdomen_examination' => $request->abdomen_examination ?? null,
            ]);

            // C. Save Lab Orders + BILLING
            if ($request->has('lab_requests')) {
                foreach ($request->lab_requests as $lab) {
                    $labRecord = LabPrescription::create([
                        'ipd_admission_id' => $admission->id, 
                        'patientcode' => $admission->patientcode,
                        'doctor_user_id' => Auth::id(),
                        'lab_panel_id' => $lab['panel_id'],
                        'status' => 'Requested',
                        'payment_status' => 'unpaid'
                    ]);

                    // Push to Billing
                    $panel = LabPanel::with('blsItem')->find($lab['panel_id']);
                    if ($panel && $panel->blsItem) {
                        $billingService->addToBill(
                            $admission->patientcode,
                            $panel->blsItem->id,
                            1,
                            'laboratory',
                            $labRecord->id,
                            $admission->pricecategory,
                            $admission->patient?->payment_category
                        );
                    }
                }
            }

            // D. Save Radiology Orders + BILLING
            if ($request->has('rad_requests')) {
                foreach ($request->rad_requests as $rad) {
                    $radRecord = RadRequest::create([
                        'ipd_admission_id' => $admission->id, 
                        'opd_booking_id' => $admission->opd_booking_id, 
                        'patientcode' => $admission->patientcode,
                        'requested_by' => Auth::id(),
                        'rad_procedure_id' => $rad['procedure_id'],
                        'status' => 'Ordered',
                        'payment_status' => 'unpaid',
                        'accession_number' => 'RAD-' . date('YmdHis') . '-' . rand(100,999)
                    ]);

                    // Push to Billing
                    $procedure = RadProcedure::with('blsItem')->find($rad['procedure_id']);
                    if ($procedure && $procedure->blsItem) {
                        $billingService->addToBill(
                            $admission->patientcode,
                            $procedure->blsItem->id,
                            1,
                            'radiology',
                            $radRecord->id,
                            $admission->pricecategory,
                            $admission->patient?->payment_category
                        );
                    }
                }
            }

            Log::info("Surgery Request: " . json_encode($request->surgery_request));

            // E. SAVE SURGERY + BILLING
            if (!empty($request->surgery_request['procedure_id']) && !empty($request->surgery_request['date'])) {
                $surgDate = Carbon::parse($request->surgery_request['date']);

                $surgRecord = TheatreBooking::create([
                    'ipd_admission_id'     => $admission->id,
                    'opd_booking_id'       => $admission->opd_booking_id,
                    'patientcode'          => $admission->patientcode,
                    'doctor_user_id'       => Auth::id(),
                    'theatre_id' => $request->surgery_request['theatre_id'] ?? null,
                    'theatre_procedure_id' => $request->surgery_request['procedure_id'],
                    'scheduled_at'         => $surgDate,
                    'status'               => 'Scheduled',
                    'payment_status'       => 'unpaid',
                    'remarks'              => 'Booked from Ward Round'
                ]);

                // Push to Billing
                $procedure = TheatreProcedure::with('blsItem')->find($request->surgery_request['procedure_id']);
                if ($procedure && $procedure->blsItem) {
                    $billingService->addToBill(
                        $admission->patientcode,
                        $procedure->blsItem->id,
                        1,
                        'theatre',
                        $surgRecord->id,
                        $admission->pricecategory,
                        $admission->patient?->payment_category
                    );
                }
            }

            // F. Save Blood Requests (No Billing Integration for now)
            if ($request->has('blood_requests')) {
                foreach ($request->blood_requests as $bb) {
                    BbIssueRequest::create([
                        'ipd_admission_id' => $admission->id,
                        'patientcode' => $admission->patientcode,
                        'requested_by' => Auth::id(),
                        'bb_component_type_id' => $bb['component_id'],
                        'units_required' => $bb['units'],
                        'blood_group_required' => $admission->patient->blood_group ?? $bb['blood_group'],
                        'urgency' => 'Routine',
                        'status' => 'Requested'
                    ]);
                }
            }

            // G. Save Pharmacy + BILLING
            if ($request->has('new_prescriptions')) {
                foreach ($request->new_prescriptions as $rx) {
                    $pharmRecord = PharmacyPrescription::create([
                        'ipd_admission_id' => $admission->id,
                        'patientcode' => $admission->patientcode,
                        'doctor_user_id' => Auth::id(),
                        'product_id' => $rx['product_id'],
                        'dosage' => $rx['dosage'],
                        'frequency' => $rx['frequency'],
                        'duration' => $rx['duration'],
                        'quantity_prescribed' => $rx['quantity'],
                        'status' => 'Prescribed',
                        'payment_status' => 'unpaid'
                    ]);
                   
                }
            }
           
            // H. Save New Diagnoses (Unchanged)
            if ($request->has('diagnoses')) {
                foreach ($request->diagnoses as $diag) {
                    $status = $diag['status']; 
                    $type = $diag['type'] ?? 'icd';

                    $mtuha = null;
                    if ($type === 'icd') {
                        $modelClassIcd = match ($status) {
                            'confirmed'    => MrPatientDiagnosisIcdConfirmed::class,
                            'differential' => MrPatientDiagnosisIcdDifferential::class,
                            default        => MrPatientDiagnosisIcdProvisional::class,
                        };
                        $modelClassIcd::create([
                            'ipd_admission_id'     => $admission->id,
                            'ipd_ward_round_id'    => $round->id,
                            'patientcode'          => $admission->patientcode,
                            'user_id'              => Auth::id(),
                            'transdate'            => now(),
                            'diagnosis_id'         => $diag['id'],
                            'diagnosisdescription' => $diag['label'],
                        ]);

                        $parts = explode(' - ', $diag['label']);
                        $code = trim($parts[0]); 
                        $mtuha = $icdMappingService->findMtuha($code, 'IPD');   
                    }

                   
                    $sourceModel = DxtDiagnosesIpd::class;

                    if ($mtuha) {
                        $modelClassMtuha = match ($status) {
                            'confirmed'    => MrPatientDiagnosisConfirmed::class,
                            'differential' => MrPatientDiagnosisDifferential::class,
                            default        => MrPatientDiagnosisProvisional::class,
                        };

                        $mtuha_code = match ($mtuha->mtuha_code) {
                            '0008a' => '81',
                            '0008b' => '82',                             
                            default => $mtuha->mtuha_code,
                        };

                        $modelClassMtuha::create([
                            'ipd_admission_id'     => $admission->id,
                            'ipd_ward_round_id'    => $round->id,
                            'patientcode'          => $admission->patientcode,
                            'user_id'              => Auth::id(),
                            'transdate'            => now(),
                            'diagnosis_id'         => $mtuha_code,                           
                            'diagnosisdescription' => $mtuha->description,
                            'diagnosis_type'       => $sourceModel,
                        ]);
                    }
                }
            }

            DB::commit();
            return redirect()->route('doctor1.index')->with('success', 'Ward round completed and billing updated.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("IPD Round Error: " . $e->getMessage());
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

     /**
     * 4. Initiate Discharge (Doctor's Order)
     */
    public function initiateDischarge(Request $request, IpdAdmission $admission)
    {
        $request->validate([
            'final_diagnosis' => 'required|string',
            'clinical_summary' => 'required|string',
            'discharge_medications' => 'required|string',
            'outcome' => 'required|string',
            'follow_up_date' => 'nullable|date',
            'follow_up_instructions' => 'nullable|string'
        ]);

        DB::transaction(function () use ($request, $admission) {
            
            // 1. Create Clinical Summary
            IpdDischargeSummary::updateOrCreate(
                ['ipd_admission_id' => $admission->id],
                [
                    'final_diagnosis' => $request->final_diagnosis,
                    'clinical_summary' => $request->clinical_summary,
                    'treatment_given' => $request->treatment_given ?? 'See Chart',
                    'discharge_medications' => $request->discharge_medications,
                    'outcome' => $request->outcome,
                    'follow_up_date' => $request->follow_up_date,
                    'follow_up_instructions' => $request->follow_up_instructions,
                    'doctor_user_id' => Auth::id(),
                    'summarized_at' => now()
                ]
            );

            // 2. Update Admission Status to "Discharge Pending"
            $admission->update([
                'status' => 'Discharge Pending'
            ]);
        });

        return redirect()->route('doctor1.index')
            ->with('success', 'Discharge initiated. Patient sent to Discharge List.');
    }

    /**
     * Delete an Order (Lab, Rad, Surgery)
     */
    /**
     * Delete an Order (Lab, Rad, Surgery, Pharmacy)
     */
    public function destroyOrder($type, $id)
    {
        try {
            DB::beginTransaction();

            $record = null;
            $billingSourceType = null;

            // 1. Identify Record and Billing Source Type
            switch ($type) {
                case 'lab':
                    $record = LabPrescription::findOrFail($id);
                    $billingSourceType = 'laboratory'; // Matches BillingService
                    
                    // Case-insensitive check
                    if (strtolower($record->status) !== 'requested' || $record->payment_status === 'paid') {
                        return back()->withErrors(['error' => 'Cannot delete. Status is processed or paid.']);
                    }
                    break;

                case 'rad':
                    $record = RadRequest::findOrFail($id);
                    $billingSourceType = 'radiology'; // Matches BillingService

                    if (strtolower($record->status) !== 'ordered' || $record->payment_status === 'paid') {
                        return back()->withErrors(['error' => 'Cannot delete. Status is processed or paid.']);
                    }
                    break;

                case 'surgery':
                    $record = TheatreBooking::findOrFail($id);
                    $billingSourceType = 'theatre'; // Matches BillingService

                    if (strtolower($record->status) !== 'scheduled' || $record->payment_status === 'paid') {
                        return back()->withErrors(['error' => 'Cannot delete. Status is processed or paid.']);
                    }
                    break;
               
                case 'pharmacy':
                    $record = PharmacyPrescription::findOrFail($id);
                    // Note: Check if you saved it as 'pharmacy' or 'drug' in BillingService. 
                    // Usually 'pharmacy' if not specified otherwise.
                    $billingSourceType = 'pharmacy'; 

                    if (strtolower($record->status) !== 'prescribed' || $record->payment_status === 'paid') {
                        return back()->withErrors(['error' => 'Cannot delete. Status is processed or paid.']);
                    }
                    break;
                
                default:
                    return back()->withErrors(['error' => 'Invalid order type']);
            }

            // 2. Delete Associated Billing Items & Recalculate Order
            if ($billingSourceType) {
                // Get the items first so we know which Orders to update
                $billItems = BILOrderItem::where('source_type', $billingSourceType)
                    ->where('source_id', $id)
                    ->get();

                foreach ($billItems as $item) {
                    $orderId = $item->order_id;
                    
                    // Delete the item
                    $item->delete();

                    // Recalculate Parent Order Total
                    if ($orderId) {
                        $order = BILOrder::find($orderId);
                        if ($order) {
                            $newTotal = $order->orderitems()->sum(DB::raw('price * quantity'));
                            $order->update(['total' => $newTotal]);
                        }
                    }
                }
            }

            // 3. Delete the Medical Record
            $record->delete();

            DB::commit();
            return back()->with('success', 'Order and associated bill removed successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Delete Order Error: " . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to delete order.']);
        }
    }
}

