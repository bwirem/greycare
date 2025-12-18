<?php

namespace App\Http\Controllers\Hospital\Doctor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

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

use App\Models\Radiology\RadRequest;
use App\Models\Radiology\RadProcedure;

use App\Models\BloodBank\BbIssueRequest;
use App\Models\BloodBank\BbComponentType;


class DoctorIpdController extends Controller
{
    /**
     * 1. Ward List (Admitted Patients)
     */
    public function index(Request $request)
    {
        $query = IpdAdmission::with(['patient', 'ward', 'bed'])
            ->where('status', 'Admitted');

        if($request->ward_id) {
            $query->where('ward_id', $request->ward_id);
        }

        return Inertia::render('Hospital/Doctor/Ipd/Index', [
            'admissions' => $query->orderBy('ward_id')->paginate(20)
        ]);
    }

    /**
     * 2. Ward Round Form
     */
    public function create(IpdAdmission $admission)
    {
        // Load Admission Context + History
        $admission->load([
            'patient',
            // Load previous rounds with their details for the "History" tab
            'wardRounds' => function($q) {
                $q->orderBy('round_date', 'desc')->with(['doctor', 'examination', 'assessment']);
            },

            // --- NEW: Load Original OPD Consultation Data ---
            'booking.history.complains',
            'booking.examination',
            'booking.diagnosesConfirmed',
            'booking.diagnosesProvisional',
            'booking.prescriptions.product',
            'booking.labRequests.panel',
            'booking.radiologyRequests.procedure',
            'booking.user', // The OPD Doctor
            
            // Load Active Orders linked to this Admission (Cumulative view)
            'labRequests.panel', 
            'labRequests.sample.results.parameter', // Nested results
            
            'radiologyRequests.procedure',
            'radiologyRequests.report', // Nested report
            
            'prescriptions.product'
        ]);

        // --- FETCH & DEDUPLICATE DIAGNOSIS HISTORY ---
        
        $diagHistory = collect();
        $coveredIcdCodes = []; // Array to track codes handled by Local Diagnoses

        // 1. Fetch from Database
        // Generic/Local (Mtuha)
        $genConf = MrPatientDiagnosisConfirmed::where('ipd_admission_id', $admission->id)
            ->with(['diagnosis.icdMap', 'user'])->get();
        $genProv = MrPatientDiagnosisProvisional::where('ipd_admission_id', $admission->id)
            ->with(['diagnosis.icdMap', 'user'])->get();
        
        // ICD Specific
        $icdConf = MrPatientDiagnosisIcdConfirmed::where('ipd_admission_id', $admission->id)
            ->with(['icdDiagnosis', 'user'])->get();
        $icdProv = MrPatientDiagnosisIcdProvisional::where('ipd_admission_id', $admission->id)
            ->with(['icdDiagnosis', 'user'])->get();

        // 2. Define Formatter Logic
        $processRecords = function($records, $status, $source) use (&$diagHistory, &$coveredIcdCodes) {
            foreach($records as $rec) {
                
                $icdCode = '-';
                $icdName = null;
                $localName = null;

                if ($source === 'local') {
                    // It's a Local/Mtuha Diagnosis
                    $localName = $rec->diagnosis?->name ?? $rec->diagnosisdescription;
                    
                    // Get the Mapped Code
                    $icdCode = $rec->diagnosis?->icdMap?->code ?? $rec->diagnosis?->maptocode ?? '-';
                    $icdName = $rec->diagnosis?->icdMap?->name ?? null;

                    // Add this code to 'covered' list so we don't show the duplicate ICD entry later
                    if ($icdCode !== '-') {
                        $coveredIcdCodes[] = $icdCode;
                    }
                } else {
                    // It's a Standard ICD Diagnosis
                    $icdCode = $rec->icdDiagnosis?->code ?? '-';
                    $icdName = $rec->icdDiagnosis?->name ?? $rec->diagnosisdescription;
                    
                    // DEDUPLICATION CHECK:
                    // If this ICD code was already added via a Local Diagnosis, SKIP it.
                    if (in_array($icdCode, $coveredIcdCodes)) {
                        continue; 
                    }
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

        // 3. Process LOCAL First (Priority)
        $processRecords($genConf, 'Confirmed', 'local');
        $processRecords($genProv, 'Provisional', 'local');

        // 4. Process ICD Second (Filter duplicates)
        $processRecords($icdConf, 'Confirmed', 'icd');
        $processRecords($icdProv, 'Provisional', 'icd');

        // 5. Sort
        $sortedDiagHistory = $diagHistory->sortByDesc('created_at')->values();
        
        return Inertia::render('Hospital/Doctor/Ipd/WardRound', [
            'admission' => $admission,
            'patient' => $admission->patient,
            'previous_rounds' => $admission->wardRounds,

            // --- NEW: Pass OPD Data ---
            'opd_consultation' => $admission->booking, 

            // --- NEW PROP ---
            'diagnosis_history' => $sortedDiagHistory,
            
            // Existing Orders for Dashboard
            'ordered_labs' => $admission->labRequests,
            'ordered_rads' => $admission->radiologyRequests,
            'ordered_meds' => $admission->prescriptions,
            
            // Dropdown Data
            'icd_list' => DxtDiagnosesIcd::select('id', 'name', 'code')->limit(100)->get(),    
            'ipd_diagnoses_list' => DxtDiagnosesIpd::with('icdMap:id,name,code') // Load relation
                ->select('id', 'name', 'maptocode') // MUST include 'maptocode' for the link to work
                ->limit(100)
                ->get(),                

            // Dropdowns
            'lab_panels' => LabPanel::select('id', 'name')->orderBy('name')->get(),
            'rad_procedures' => RadProcedure::select('id', 'name')->orderBy('name')->get(),
            'drugs_list' => SIV_Product::select('id', 'name', 'costprice')->orderBy('name')->get(),
            'bb_components' => BbComponentType::select('id', 'name')->get(),
            
            // Pharmacy related
            'pharmacy_frequencies' => PharmacyFrequency::select('id', 'name', 'code', 'value')->get(),
            'pharmacy_durations' => PharmacyDuration::select('id', 'name', 'code', 'days')->where('is_active', true)->get(),
            
            // Ensure drugs list includes info if needed (though usually calculated on basic units)           
            'drugs_list' => SIV_Product::with('drugDetails') 
            ->select('id', 'name', 'costprice') 
            ->orderBy('name')
            ->get(),
        ]);
    }

    /**
     * 3. Save Round
     */
    public function store(Request $request, IpdAdmission $admission)
    {
        $request->validate([
            // Assessment
            'clinical_notes' => 'required|string',
            'treatment_plan' => 'nullable|string',
            'general_condition' => 'nullable|string',
            
            // Orders
            'lab_requests' => 'nullable|array',
            'rad_requests' => 'nullable|array',
            'blood_requests' => 'nullable|array',
            'new_prescriptions' => 'nullable|array',
            'diagnoses' => 'nullable|array',
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

            // B. Save Physical Exam (Polymorphic linked to Round)
            $round->examination()->create([
                'general_condition' => $request->general_condition,
                'glasgow_coma_score' => $request->glasgow_coma_score ?? null,
                'pallor' => $request->boolean('pallor') ? 1 : 0,
                'jaundice' => $request->boolean('jaundice') ? 1 : 0,
                'cvs_examination' => $request->cvs_examination ?? null,
                'rs_examination' => $request->rs_examination ?? null,
                'abdomen_examination' => $request->abdomen_examination ?? null,
            ]);

            // C. Save Lab Orders (Linked to Admission)
            if ($request->has('lab_requests')) {
                foreach ($request->lab_requests as $lab) {
                    LabPrescription::create([
                        'ipd_admission_id' => $admission->id, 
                        'patientcode' => $admission->patientcode,
                        'doctor_user_id' => Auth::id(),
                        'lab_panel_id' => $lab['panel_id'],
                        'status' => 'ordered'
                    ]);
                }
            }

            // D. Save Radiology Orders
            if ($request->has('rad_requests')) {
                foreach ($request->rad_requests as $rad) {
                    RadRequest::create([
                        'ipd_admission_id' => $admission->id, // Add this column to rad_requests migration if missing
                        'opd_booking_id' => $admission->opd_booking_id, // Fallback link
                        'patientcode' => $admission->patientcode,
                        'requested_by' => Auth::id(),
                        'rad_procedure_id' => $rad['procedure_id'],
                        'status' => 'ordered',
                        'accession_number' => 'RAD-' . date('YmdHis') . '-' . rand(100,999)
                    ]);
                }
            }

            // E. Save Blood Requests
            if ($request->has('blood_requests')) {
                foreach ($request->blood_requests as $bb) {
                    BbIssueRequest::create([
                        'ipd_admission_id' => $admission->id,
                        'patientcode' => $admission->patientcode,
                        'requested_by' => Auth::id(),
                        'bb_component_type_id' => $bb['component_id'],
                        'units_required' => $bb['units'],
                        'blood_group_required' => $admission->patient->blood_group ?? 'Unknown',
                        'urgency' => 'Routine',
                        'status' => 'Requested'
                    ]);
                }
            }

            // F. Save Pharmacy
            if ($request->has('new_prescriptions')) {
                foreach ($request->new_prescriptions as $rx) {
                    PharmacyPrescription::create([
                        'ipd_admission_id' => $admission->id,
                        'patientcode' => $admission->patientcode,
                        'doctor_user_id' => Auth::id(),
                        'product_id' => $rx['product_id'],
                        'dosage' => $rx['dosage'],
                        'frequency' => $rx['frequency'],
                        'duration' => $rx['duration'],
                        'quantity_prescribed' => $rx['quantity'],
                        'status' => 'Prescribed'
                    ]);
                }
            }
           
            // G. Save New Diagnoses
            if ($request->has('diagnoses')) {


                foreach ($request->diagnoses as $diag) {
                    
                    $status = $diag['status']; 
                    $type = $diag['type'] ?? 'icd';

                    // ---------------------------------------------------------
                    // SCENARIO 1: Save ICD-10 Code
                    // ---------------------------------------------------------
                    // Always save if type is ICD
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
                            'diagnosis_id'         => $diag['id'], // ICD ID
                            'diagnosisdescription' => $diag['label'],
                        ]);
                    }

                    // ---------------------------------------------------------
                    // SCENARIO 2: Save Local Mtuha/IPD Code
                    // ---------------------------------------------------------
                    // Save if:
                    // 1. User selected a Local Diagnosis directly (type != icd)
                    // 2. OR User selected ICD but it has a linked Mtuha ID
                    
                    $mtuhaId = null;
                    $sourceModel = null;

                    if ($type !== 'icd') {
                        // Direct selection of local diagnosis
                        $mtuhaId = $diag['id'];
                        $sourceModel = DxtDiagnosesIpd::class; // Or map based on type
                    } elseif (!empty($diag['linked_mtuha_id'])) {
                        // Indirect selection via ICD mapping
                        $mtuhaId = $diag['linked_mtuha_id'];
                        $sourceModel = DxtDiagnosesIpd::class; // Mapped ones are usually IPD
                    }

                    if ($mtuhaId) {
                        $modelClassMtuha = match ($status) {
                            'confirmed'    => MrPatientDiagnosisConfirmed::class,
                            'differential' => MrPatientDiagnosisDifferential::class,
                            default        => MrPatientDiagnosisProvisional::class,
                        };

                        $modelClassMtuha::create([
                            'ipd_admission_id'     => $admission->id,
                            'ipd_ward_round_id'    => $round->id,
                            'patientcode'          => $admission->patientcode,
                            'user_id'              => Auth::id(),
                            'transdate'            => now(),
                            'diagnosis_id'         => $mtuhaId, // The Mtuha ID
                            'diagnosis_type'       => $sourceModel,
                            'diagnosisdescription' => $diag['linked_mtuha'] ?? $diag['label'],
                        ]);
                    }
                }
            }

            DB::commit();
            return redirect()->route('doctor1.index')->with('success', 'Ward round completed.');

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
            // This moves it to the Nurse/Billing/Discharge List
            $admission->update([
                'status' => 'Discharge Pending'
            ]);
        });

        return redirect()->route('doctor1.index')
            ->with('success', 'Discharge initiated. Patient sent to Discharge List.');
    }
}