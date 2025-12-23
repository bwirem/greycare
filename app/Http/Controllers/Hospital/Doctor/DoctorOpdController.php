<?php

namespace App\Http\Controllers\Hospital\Doctor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;

// --- Core Models ---
use App\Models\Opd\OpdBooking;

// --- Medical Record Models (Generic/Polymorphic) ---
use App\Models\MedicalRecord\MrHistory;
use App\Models\MedicalRecord\MrExamination;
use App\Models\MedicalRecord\MrPatientDiagnosisConfirmed;
use App\Models\MedicalRecord\MrPatientDiagnosisProvisional;
use App\Models\MedicalRecord\MrPatientDiagnosisDifferential;

// --- Medical Record Models (ICD Specific) ---
use App\Models\MedicalRecord\MrPatientDiagnosisIcdConfirmed;
use App\Models\MedicalRecord\MrPatientDiagnosisIcdProvisional;
use App\Models\MedicalRecord\MrPatientDiagnosisIcdDifferential;

// --- Diagnosis Master Models ---
use App\Models\Diagnosis\DxtDiagnosesIcd;
use App\Models\Diagnosis\DxtDiagnosesOpd; // <--- Local OPD List

// --- Service Models ---
use App\Models\Laboratory\LabPrescription;
use App\Models\Laboratory\LabPanel;
use App\Models\Radiology\RadRequest;
use App\Models\Radiology\RadProcedure;
use App\Models\Pharmacy\PharmacyPrescription;
use App\Models\Pharmacy\PharmacyFrequency;
use App\Models\Pharmacy\PharmacyDuration;
use App\Models\Inventory\SIV_Product; 
use App\Models\Theatre\TheatreBooking;
use App\Models\Theatre\TheatreProcedure;
use App\Models\Ipd\IpdWard; // <--- ADDED THIS IMPORT

// Services
use App\Services\BillingService; // <--- NEW IMPORT

class DoctorOpdController extends Controller
{
    /**
     * 1. The Queue
     */
    public function index()
    {
        $queue = OpdBooking::with(['patient', 'latestVitalSign'])
            ->whereDate('created_at', today())
            // --- FILTER OUT ADMITTED PATIENTS ---
            ->where('consultation_status', '!=', 'Admitted')             
            // Optional: You might also want to hide 'Completed' or 'Cancelled'
            // ->whereNotIn('consultation_status', ['Admitted', 'Cancelled'])
            ->orderBy('created_at', 'asc')
            ->paginate(20);

        return Inertia::render('Hospital/Doctor/Opd/Index', [
            'queue' => $queue
        ]);
    }

    /**
     * 2. The Form
     */
    public function create(OpdBooking $booking)
    {
        // --- SECURITY CHECK ---
        // Check if Cash patient and Unpaid
        $isCash = stripos($booking->billingGroup?->name ?? 'Cash', 'Cash') !== false;
        
        if ($isCash && $booking->payment_status !== 'paid' && $booking->payment_status !== 'waived') {
            return redirect()->route('doctor0.index')
                ->with('error', 'Patient must clear the consultation bill before being seen.');
        }

        // 1. Load Relationships
        $booking->load([
            'patient',
            'latestVitalSign',
            'history.complains',
            'examination',
            // Local Diagnoses (Polymorphic)
            'diagnosesConfirmed.diagnosis.icdMap', 
            'diagnosesProvisional.diagnosis.icdMap',
            // Standard ICD Diagnoses
            'icdDiagnosesConfirmed.icdDiagnosis', 
            'icdDiagnosesProvisional.icdDiagnosis',
            // Services
            'labRequests.panel',
            'labRequests.sample.results.parameter',
            'labRequests' => function($q) {
                $q->with(['panel', 'rejectionLog.reason']);
            },
            'radiologyRequests.procedure',
            'radiologyRequests.report',
            'prescriptions.product' 
        ]);

        // 2. Process Diagnosis History (Deduplication Logic)
        $history = collect([]);
        $coveredIcdCodes = []; 

        // A. Process Local Diagnoses First (Prioritize these)
        $this->processDiagnosisList($booking->diagnosesConfirmed, 'Confirmed', 'local', $history, $coveredIcdCodes);
        $this->processDiagnosisList($booking->diagnosesProvisional, 'Provisional', 'local', $history, $coveredIcdCodes);

        // B. Process ICD Diagnoses (Skip if covered by Local)
        $this->processDiagnosisList($booking->icdDiagnosesConfirmed, 'Confirmed', 'icd', $history, $coveredIcdCodes);
        $this->processDiagnosisList($booking->icdDiagnosesProvisional, 'Provisional', 'icd', $history, $coveredIcdCodes);

        // Sort by Date Descending
        $sortedHistory = $history->sortByDesc('created_at')->values();

        return Inertia::render('Hospital/Doctor/Opd/Consultation', [
            'booking' => $booking,
            'patient' => $booking->patient,
            'vital_signs' => $booking->latestVitalSign,
            'existing_history' => $booking->history,
            'existing_exam' => $booking->examination,
            'ordered_labs' => $booking->labRequests,
            'ordered_rads' => $booking->radiologyRequests,
            'ordered_meds' => $booking->prescriptions,
            'ordered_surgeries' => $booking->theatreBookings()->with('procedure')->get(),
            'previous_diagnoses' => $sortedHistory,

            // Dropdowns
            'icd_list' => DxtDiagnosesIcd::select('id', 'name', 'code')->limit(200)->get(), 
            'opd_diagnoses_list' => DxtDiagnosesOpd::with('icdMap:id,name,code')->select('id', 'name', 'maptocode')->limit(200)->get(),
            'lab_panels' => LabPanel::select('id', 'name')->orderBy('name')->get(),
            'rad_procedures' => RadProcedure::select('id', 'name')->orderBy('name')->get(),
            'surgery_procedures' => TheatreProcedure::select('id', 'name')->orderBy('name')->get(),
            'drugs_list' => SIV_Product::with('drugDetails')->select('id', 'name', 'costprice')->orderBy('name')->get(),
            'pharmacy_frequencies' => PharmacyFrequency::select('id', 'name', 'code', 'value')->get(),
            'pharmacy_durations' => PharmacyDuration::select('id', 'name', 'code', 'days')->where('is_active', true)->orderBy('days')->get(),
            // --- ADDED THIS LINE ---
            'wards_list' => IpdWard::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    /**
     * Private Helper to Process Diagnosis Lists and avoid duplicates
     */
    private function processDiagnosisList($list, $statusLabel, $sourceType, &$historyCollection, &$coveredCodes)
    {
        foreach ($list as $record) {
            
            // Format the data
            $data = [
                'id' => $record->id,
                'created_at' => $record->created_at,
                'user_name' => $record->user?->name ?? 'Unknown',
                'status_label' => $statusLabel,
                'source_type' => $sourceType,
            ];

            if ($sourceType === 'local') {
                $localDiag = $record->diagnosis; 
                $data['local_name'] = $localDiag?->name ?? $record->diagnosisdescription;
                $data['icd_code'] = $localDiag?->icdMap?->code ?? $localDiag?->maptocode ?? '-';
                $data['icd_name'] = $localDiag?->icdMap?->name ?? null;

                // Track that this ICD code is covered
                if ($data['icd_code'] !== '-' && $data['icd_code'] !== null) {
                    $coveredCodes[] = $data['icd_code'];
                }
                
                // Add to history
                $historyCollection->push($data);

            } else {
                // ICD Source
                $icdDiag = $record->icdDiagnosis;
                $code = $icdDiag?->code;

                // DEDUPLICATION CHECK:
                // If this ICD code was already added via a Local Diagnosis, skip adding this duplicate row.
                if ($code && in_array($code, $coveredCodes)) {
                    continue; 
                }

                $data['local_name'] = null;
                $data['icd_code'] = $code ?? '-';
                $data['icd_name'] = $icdDiag?->name ?? $record->diagnosisdescription;
                
                $historyCollection->push($data);
            }
        }
    }

    /**
     * 3. The Save (Updated Diagnosis Logic)
     */
    public function store(Request $request, OpdBooking $booking, BillingService $billingService)
    {
        $request->validate([
            'history_presenting_illness' => 'nullable|string',
            'complaints' => 'nullable|array',
            'general_condition' => 'nullable|string',
            'diagnoses' => 'nullable|array',
            'prescriptions' => 'nullable|array',
            'lab_requests' => 'nullable|array',
            'rad_requests' => 'nullable|array',
            'surgery_request' => 'nullable|array',
        ]);

        try {
            DB::beginTransaction();

            // 1. History
            $history = $booking->history()->updateOrCreate(
                ['opd_booking_id' => $booking->id],
                [
                    'history_presenting_illness' => $request->history_presenting_illness,
                    'past_medical_history' => $request->past_medical_history ?? null,
                    'social_and_family_history' => $request->social_and_family_history ?? null,
                    'review_of_other_systems' => $request->review_of_other_systems ?? null,
                ]
            );

            if ($request->has('complaints')) {
                $history->complains()->delete();
                foreach ($request->complaints as $idx => $comp) {
                    if (!empty($comp['chief_complaint'])) {
                        $history->complains()->create([
                            'chief_complaint' => $comp['chief_complaint'],
                            'duration' => $comp['duration'] ?? null,
                            'sort_order' => $idx
                        ]);
                    }
                }
            }

            // 2. Examination
            $booking->examination()->updateOrCreate(
                ['examinable_id' => $booking->id, 'examinable_type' => OpdBooking::class],
                [
                    'general_condition' => $request->general_condition,
                    'glasgow_coma_score' => $request->glasgow_coma_score ?? null,
                    'pallor' => $request->boolean('pallor') ? 1 : 0,
                    'jaundice' => $request->boolean('jaundice') ? 1 : 0,
                    'cvs_examination' => $request->cvs_examination ?? null,
                    'rs_examination' => $request->rs_examination ?? null,
                    'abdomen_examination' => $request->abdomen_examination ?? null,
                ]
            );

            // 3. DIAGNOSES (Updated Logic)
            if ($request->has('diagnoses')) {
                foreach ($request->diagnoses as $diag) {
                    
                    $status = $diag['status']; 
                    $type = $diag['type'] ?? 'icd';

                    // --- SCENARIO 1: Save ICD Tables (Standard Reporting) ---
                    // Use 'icd_id' passed from frontend mapping, or 'id' if type was direct ICD selection
                    $icdId = $diag['icd_id'] ?? ($type === 'icd' ? $diag['id'] : null);
                    $icdLabel = $diag['icd_label'] ?? ($type === 'icd' ? $diag['label'] : null);

                    if ($icdId) {
                        $modelClassIcd = match ($status) {
                            'confirmed'    => MrPatientDiagnosisIcdConfirmed::class,
                            'differential' => MrPatientDiagnosisIcdDifferential::class,
                            default        => MrPatientDiagnosisIcdProvisional::class,
                        };

                        $modelClassIcd::create([
                            'opd_booking_id'       => $booking->id,
                            'patientcode'          => $booking->patientcode,
                            'user_id'              => Auth::id(),
                            'transdate'            => now(),
                            'diagnosis_id'         => $icdId, 
                            'diagnosisdescription' => $icdLabel,
                        ]);
                    }

                    // --- SCENARIO 2: Save Local Tables (Polymorphic) ---
                    // Save if user selected Local, OR if they selected ICD but it maps to a Local ID
                    $mtuhaId = null;
                    $sourceModel = null;

                    if ($type !== 'icd') {
                        // Direct selection of local diagnosis
                        $mtuhaId = $diag['id'];
                        $sourceModel = DxtDiagnosesOpd::class; // Map to OPD Master
                    } elseif (!empty($diag['linked_mtuha_id'])) {
                        // Indirect selection via ICD mapping
                        $mtuhaId = $diag['linked_mtuha_id'];
                        $sourceModel = DxtDiagnosesOpd::class; // Map to OPD Master
                    }

                    if ($mtuhaId) {
                        $modelClassMtuha = match ($status) {
                            'confirmed'    => MrPatientDiagnosisConfirmed::class,
                            'differential' => MrPatientDiagnosisDifferential::class,
                            default        => MrPatientDiagnosisProvisional::class,
                        };

                        $modelClassMtuha::create([
                            'opd_booking_id'       => $booking->id,
                            'patientcode'          => $booking->patientcode,
                            'user_id'              => Auth::id(),
                            'transdate'            => now(),
                            'diagnosis_id'         => $mtuhaId,
                            'diagnosis_type'       => $sourceModel,
                            'diagnosisdescription' => $diag['linked_mtuha'] ?? $diag['label'],
                        ]);
                    }
                }
            }

             // =================================================================
            // 4. LAB ORDERS + BILLING PUSH
            // =================================================================
            if ($request->has('lab_requests')) {
                foreach ($request->lab_requests as $lab) {
                    $exists = LabPrescription::where('opd_booking_id', $booking->id)
                        ->where('lab_panel_id', $lab['panel_id'])->exists();
                    
                    if (!$exists) {
                        // A. Create Clinical Record
                        $labRecord = LabPrescription::create([
                            'opd_booking_id' => $booking->id,
                            'patientcode' => $booking->patientcode,
                            'doctor_user_id' => Auth::id(),
                            'lab_panel_id' => $lab['panel_id'],
                            'status' => 'Requested',
                            'payment_status' => 'unpaid' // Mark unpaid initially
                        ]);

                        // B. Push to Billing
                        $panel = LabPanel::with('blsItem')->find($lab['panel_id']);
                        if ($panel && $panel->blsItem) {
                            $billingService->addToBill(
                                $booking->patientcode,
                                $panel->blsItem->id, // Bill Item ID
                                1, // Qty
                                'laboratory', // Source Type
                                $labRecord->id // Source ID
                            );
                        }
                    }
                }
            }

            // =================================================================
            // 5. RADIOLOGY ORDERS + BILLING PUSH
            // =================================================================
            if ($request->has('rad_requests')) {
                foreach ($request->rad_requests as $rad) {
                    $exists = RadRequest::where('opd_booking_id', $booking->id)
                        ->where('rad_procedure_id', $rad['procedure_id'])->exists();

                    if (!$exists) {
                        // A. Create Clinical Record
                        $radRecord = RadRequest::create([
                            'opd_booking_id' => $booking->id,
                            'patientcode' => $booking->patientcode,
                            'requested_by' => Auth::id(),
                            'rad_procedure_id' => $rad['procedure_id'],
                            'status' => 'Ordered',
                            'payment_status' => 'unpaid',
                            'accession_number' => 'RAD-' . date('YmdHis') . '-' . rand(100,999)
                        ]);

                        // B. Push to Billing
                        $procedure = RadProcedure::with('blsItem')->find($rad['procedure_id']);
                        if ($procedure && $procedure->blsItem) {
                            $billingService->addToBill(
                                $booking->patientcode,
                                $procedure->blsItem->id,
                                1,
                                'radiology',
                                $radRecord->id
                            );
                        }
                    }
                }
            }

            // =================================================================
            // 6. PHARMACY + BILLING PUSH
            // =================================================================
            if ($request->has('prescriptions')) {
                foreach ($request->prescriptions as $rx) {
                    $exists = PharmacyPrescription::where('opd_booking_id', $booking->id)
                        ->where('product_id', $rx['product_id'])
                        ->where('status', 'Prescribed')->exists();

                    if (!$exists) {
                        // A. Create Clinical Record
                        $pharmRecord = PharmacyPrescription::create([
                            'opd_booking_id' => $booking->id,
                            'patientcode' => $booking->patientcode,
                            'doctor_user_id' => Auth::id(),
                            'product_id' => $rx['product_id'],
                            'dosage' => $rx['dosage'],
                            'frequency' => $rx['frequency'],
                            'duration' => $rx['duration'] ?? '5 days',
                            'quantity_prescribed' => $rx['quantity'], 
                            'status' => 'Prescribed',
                            'payment_status' => 'unpaid'
                        ]);

                        // B. Push to Billing
                        $product = SIV_Product::with('blsItem')->find($rx['product_id']);
                        if ($product && $product->blsItem) {
                            $billingService->addToBill(
                                $booking->patientcode,
                                $product->blsItem->id,
                                $rx['quantity'], // Quantity from prescription
                                'pharmacy',
                                $pharmRecord->id
                            );
                        }
                    }
                }
            }

            // =================================================================
            // 7. SURGERY + BILLING PUSH
            // =================================================================
            if (!empty($request->surgery_request['procedure_id']) && !empty($request->surgery_request['date'])) {
                $procId = $request->surgery_request['procedure_id'];
                
                // A. Create/Find Clinical Record
                $surgRecord = TheatreBooking::firstOrCreate([
                    'opd_booking_id' => $booking->id,
                    'theatre_procedure_id' => $procId
                ], [
                    'patientcode' => $booking->patientcode,
                    'doctor_user_id' => Auth::id(),
                    'scheduled_at' => Carbon::parse($request->surgery_request['date']),
                    'status' => 'Scheduled',
                    'payment_status' => 'unpaid'
                ]);

                // B. Push to Billing (Only if just created/unpaid)
                if ($surgRecord->wasRecentlyCreated || $surgRecord->payment_status === 'unpaid') {
                    $procedure = TheatreProcedure::with('blsItem')->find($procId);
                    if ($procedure && $procedure->blsItem) {
                        $billingService->addToBill(
                            $booking->patientcode,
                            $procedure->blsItem->id,
                            1,
                            'theatre',
                            $surgRecord->id
                        );
                    }
                }
            }


            // 8. Update Status
            $booking->update(['consultation_status' => 'Seen']);

            DB::commit();

            return redirect()->route('doctor0.index')
                ->with('success', 'Consultation saved successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('OPD Save Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Error: ' . $e->getMessage()]);
        }
    }
}