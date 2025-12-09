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
use App\Models\Patient\Patient;

// --- Medical Record Models ---
use App\Models\MedicalRecord\MrHistory;
use App\Models\MedicalRecord\MrExamination;
use App\Models\MedicalRecord\MrPatientDiagnosisConfirmed;
use App\Models\MedicalRecord\MrPatientDiagnosisProvisional;

// --- Diagnosis Master Models ---
use App\Models\Diagnosis\DxtDiagnosesIcd;
use App\Models\Diagnosis\DxtDiagnosesOpd; // Fallback if using local list

// --- Service Models ---
use App\Models\Laboratory\LabPrescription;
use App\Models\Laboratory\LabPanel;
use App\Models\Radiology\RadRequest;
use App\Models\Radiology\RadProcedure;
use App\Models\Pharmacy\PharmacyPrescription;
use App\Models\SIV_Product; // Drugs
use App\Models\Theatre\TheatreBooking;
use App\Models\Theatre\TheatreProcedure;

class DoctorOpdController extends Controller
{
    /**
     * 1. The Queue: List patients waiting for consultation.
     */
    public function index()
    {
        $queue = OpdBooking::with(['patient', 'latestVitalSign'])
            ->whereDate('created_at', today())
            // ->where('status', '!=', 'completed') // Optional: Hide completed
            ->where('consultation_status', 'pending')
            ->orderBy('created_at', 'asc')
            ->paginate(20);

        return Inertia::render('Hospital/Doctor/Opd/Index', [
            'queue' => $queue
        ]);
    }

    /**
     * 2. The Form: Load clinical data and dropdown options.
     */
    public function create(OpdBooking $booking)
    {
        // Eager load everything to support "Edit/Resume" mode
        $booking->load([
            'patient',
            'latestVitalSign',
            'history.complains',
            'examination',
            'diagnosesConfirmed', // You might need .diagnosis polymorphic load
            'diagnosesProvisional',
            'labRequests.panel',
            'radiologyRequests.procedure',
            'pharmacyRequests.product' // Assuming relation exists
        ]);

        return Inertia::render('Hospital/Doctor/Opd/Consultation', [
            'booking' => $booking,
            'patient' => $booking->patient,
            'vital_signs' => $booking->latestVitalSign,
            
            // Pre-fill form if data exists
            'existing_history' => $booking->history,
            'existing_exam' => $booking->examination,
            
            // Dropdown Data (Optimized Selects)
            // In a large production app, these should be API calls, not passed to view
            'icd_list' => DxtDiagnosesIcd::select('id', 'name', 'code')->limit(200)->get(), 
            'lab_panels' => LabPanel::select('id', 'name')->orderBy('name')->get(),
            'rad_procedures' => RadProcedure::select('id', 'name')->orderBy('name')->get(),
            'surgery_procedures' => TheatreProcedure::select('id', 'name')->orderBy('name')->get(),
            'drugs_list' => SIV_Product::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    /**
     * 3. The Save: Transactional save of all clinical data.
     */
    public function store(Request $request, OpdBooking $booking)
    {
        // A. Validation
        $request->validate([
            // History
            'history_presenting_illness' => 'nullable|string',
            'complaints' => 'nullable|array',
            
            // Exam
            'general_condition' => 'nullable|string',
            
            // Diagnosis
            'diagnoses' => 'nullable|array',
            
            // Orders
            'prescriptions' => 'nullable|array',
            'lab_requests' => 'nullable|array',
            'rad_requests' => 'nullable|array',
            'surgery_request' => 'nullable|array',
        ]);

        try {
            DB::beginTransaction();

            // ---------------------------------------------------------
            // 1. History & Complaints
            // ---------------------------------------------------------
            $history = $booking->history()->updateOrCreate(
                ['opd_booking_id' => $booking->id],
                [
                    'history_presenting_illness' => $request->history_presenting_illness,
                    'past_medical_history' => $request->past_medical_history ?? null,
                    'social_and_family_history' => null // Add to frontend if needed
                ]
            );

            // Sync Complaints: Delete old, add new
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

            // ---------------------------------------------------------
            // 2. Physical Examination (Polymorphic)
            // ---------------------------------------------------------
            $booking->examination()->updateOrCreate(
                [
                    'examinable_id' => $booking->id,
                    'examinable_type' => OpdBooking::class
                ],
                [
                    'general_condition' => $request->general_condition,
                    'glasgow_coma_score' => $request->glasgow_coma_score ?? null,
                    'pallor' => $request->boolean('pallor') ? 1 : 0,
                    'jaundice' => $request->boolean('jaundice') ? 1 : 0,
                    // Default integers to 0 to avoid SQL errors
                    'cyanosis' => 0, 
                    'rash' => 0,
                    'neck_stiffness' => 0,
                    'finger_clubbing' => 0,
                    'oral_thrush' => 0,
                    // Systemic
                    'cvs_examination' => $request->cvs_examination ?? null,
                    'rs_examination' => $request->rs_examination ?? null,
                    'abdomen_examination' => $request->abdomen_examination ?? null,
                ]
            );

            // ---------------------------------------------------------
            // 3. Diagnoses
            // ---------------------------------------------------------
            if ($request->has('diagnoses')) {
                foreach ($request->diagnoses as $diag) {
                    // Determine Model Type based on frontend 'type'
                    $modelType = ($diag['type'] === 'icd') 
                        ? DxtDiagnosesIcd::class 
                        : DxtDiagnosesOpd::class; // Or your local list model

                    $data = [
                        'opd_booking_id' => $booking->id,
                        'patientcode' => $booking->patientcode,
                        'user_id' => Auth::id(),
                        'diagnosis_id' => $diag['id'],
                        'diagnosis_type' => $modelType,
                        // 'remarks' => $diag['label'] // Optional
                    ];

                    if ($diag['status'] === 'confirmed') {
                        // Avoid duplicates if re-saving
                        MrPatientDiagnosisConfirmed::firstOrCreate(
                            ['opd_booking_id' => $booking->id, 'diagnosis_id' => $diag['id']],
                            $data
                        );
                    } else {
                        MrPatientDiagnosisProvisional::firstOrCreate(
                            ['opd_booking_id' => $booking->id, 'diagnosis_id' => $diag['id']],
                            $data
                        );
                    }
                }
            }

            // ---------------------------------------------------------
            // 4. Lab Requests
            // ---------------------------------------------------------
            if ($request->has('lab_requests')) {
                foreach ($request->lab_requests as $lab) {
                    LabPrescription::create([
                        'opd_booking_id' => $booking->id,
                        'patientcode' => $booking->patientcode,
                        'doctor_user_id' => Auth::id(),
                        'lab_panel_id' => $lab['panel_id'],
                        'status' => 'ordered'
                    ]);
                }
            }

            // ---------------------------------------------------------
            // 5. Radiology Requests
            // ---------------------------------------------------------
            if ($request->has('rad_requests')) {
                foreach ($request->rad_requests as $rad) {
                    RadRequest::create([
                        'opd_booking_id' => $booking->id,
                        'patientcode' => $booking->patientcode,
                        'requested_by' => Auth::id(),
                        'rad_procedure_id' => $rad['procedure_id'],
                        'status' => 'ordered'
                    ]);
                }
            }

            // ---------------------------------------------------------
            // 6. Pharmacy (Prescriptions)
            // ---------------------------------------------------------
            if ($request->has('prescriptions')) {
                foreach ($request->prescriptions as $rx) {
                    PharmacyPrescription::create([
                        'opd_booking_id' => $booking->id,
                        'patientcode' => $booking->patientcode,
                        'doctor_user_id' => Auth::id(),
                        'product_id' => $rx['product_id'],
                        'dosage' => $rx['dosage'],
                        'frequency' => $rx['frequency'],
                        'duration' => $rx['duration'] ?? '1 week', // fallback
                        // Ensure 'quantity' from JSON maps to 'quantity_prescribed' in DB
                        'quantity_prescribed' => $rx['quantity'], 
                        'status' => 'Prescribed'
                    ]);
                }
            }

            // ---------------------------------------------------------
            // 7. Surgery Booking
            // ---------------------------------------------------------
            if (
                $request->has('surgery_request') && 
                !empty($request->surgery_request['procedure_id']) &&
                !empty($request->surgery_request['date'])
            ) {
                // Parse date string "2025-12-27T18:23"
                $surgeryDate = Carbon::parse($request->surgery_request['date']);

                TheatreBooking::create([
                    'opd_booking_id' => $booking->id,
                    'patientcode' => $booking->patientcode,
                    'doctor_user_id' => Auth::id(),
                    'theatre_procedure_id' => $request->surgery_request['procedure_id'],
                    'scheduled_at' => $surgeryDate,
                    'status' => 'Scheduled'
                ]);
            }

            // ---------------------------------------------------------
            // 8. Finalize
            // ---------------------------------------------------------
            
            $booking->update(['vitalsignstatus' => 'Seen']);
            $booking->update(['consultation_status' => 'Seen']);


            DB::commit();

            return redirect()->route('doctor0.index')
                ->with('success', 'Consultation data saved successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            
            // Log the actual error for debugging
            Log::error('OPD Consultation Save Error: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            return back()->withErrors(['error' => 'System Error: ' . $e->getMessage()]);
        }
    }

    /**
     * 4. Patient History (Optional: View past visits)
     */
    public function history(Patient $patient)
    {
        $patient->load([
            'opdBookings.history',
            'opdBookings.diagnosesConfirmed.diagnosis',
            'ipdAdmissions.wardRounds'
        ]);

        return Inertia::render('Hospital/Doctor/Shared/PatientHistory', [
            'patient' => $patient
        ]);
    }
}