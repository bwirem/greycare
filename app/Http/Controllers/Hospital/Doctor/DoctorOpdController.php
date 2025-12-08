<?php

namespace App\Http\Controllers\Hospital\Doctor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// Models
use App\Models\Opd\OpdBooking;
use App\Models\MedicalRecord\MrExamination;
use App\Models\Pharmacy\PharmacyPrescription;
use App\Models\MedicalRecord\MrPatientDiagnosisConfirmed;

class DoctorOpdController extends Controller
{
    public function index()
    {
        // 1. Fetch patients waiting for consultation
        $queue = OpdBooking::with(['patient', 'latestVitalSign'])
            ->whereDate('created_at', today())
            // ->where('status', 'waiting') // Uncomment in production
            ->orderBy('created_at', 'asc')
            ->paginate(20);

        return Inertia::render('Hospital/Doctor/Opd/Index', [
            'queue' => $queue
        ]);
    }

    public function create(OpdBooking $booking)
    {
        // 2. Load Clinical Data (History, Complaints, Exam)
        $booking->load([
            'patient',
            'latestVitalSign',
            'history.complains', // Nested relationship
            'examination',       // Polymorphic relationship
            'diagnosesConfirmed'
        ]);

        return Inertia::render('Hospital/Doctor/Opd/Consultation', [
            'booking' => $booking,
            'patient' => $booking->patient,
            'vital_signs' => $booking->latestVitalSign,
            // Pre-load existing data for the edit form
            'existing_history' => $booking->history,
            'existing_exam' => $booking->examination,
        ]);
    }

    public function store(Request $request, OpdBooking $booking)
    {
        // 3. Validation
        $request->validate([
            // History
            'history_presenting_illness' => 'nullable|string',
            'past_medical_history' => 'nullable|string',
            'complaints' => 'nullable|array', // The grid of Chief Complaints
            'complaints.*.chief_complaint' => 'required|string',
            
            // Examination
            'general_condition' => 'nullable|string',
            'pallor' => 'boolean',
            'jaundice' => 'boolean',
            'systemic_examination' => 'nullable|string',
            
            // Diagnoses & Rx
            'diagnoses' => 'nullable|array',
            'prescriptions' => 'nullable|array',
        ]);

        try {
            DB::transaction(function () use ($request, $booking) {

                // A. Save History Header (Update or Create)
                $history = $booking->history()->updateOrCreate(
                    ['opd_booking_id' => $booking->id],
                    [
                        'history_presenting_illness' => $request->history_presenting_illness,
                        'review_of_other_systems' => $request->review_of_other_systems,
                        'past_medical_history' => $request->past_medical_history,
                        'social_and_family_history' => $request->social_and_family_history,
                    ]
                );

                // B. Save History Complaints (Child Table)
                // Strategy: Delete existing for this history and re-create (Sync)
                $history->complains()->delete();
                if ($request->has('complaints')) {
                    $history->complains()->createMany($request->complaints);
                }

                // C. Save Polymorphic Examination
                // We map the request inputs to the standardized snake_case columns
                $booking->examination()->updateOrCreate(
                    [
                        'examinable_id' => $booking->id,
                        'examinable_type' => OpdBooking::class
                    ],
                    [
                        'general_condition' => $request->general_condition,
                        'glasgow_coma_score' => $request->glasgow_coma_score,
                        'pallor' => $request->pallor ?? 0,
                        'jaundice' => $request->jaundice ?? 0,
                        'rash' => $request->rash ?? 0,
                        'cvs_examination' => $request->cvs_examination,
                        'rs_examination' => $request->rs_examination,
                        'abdomen_examination' => $request->abdomen_examination,
                        'cns_examination' => $request->cns_examination,
                    ]
                );

                // D. Save Diagnoses
                // (Simplified logic: create new entries)
                if ($request->has('diagnoses')) {
                    foreach ($request->diagnoses as $diag) {
                        MrPatientDiagnosisConfirmed::create([
                            'opd_booking_id' => $booking->id,
                            'patientcode' => $booking->patientcode,
                            'user_id' => Auth::id(),
                            'diagnosis_name' => $diag['name'],
                            'icd_code' => $diag['code'] ?? null,
                        ]);
                    }
                }

                // E. Save Prescriptions (Triggers Pharmacy Module)
                if ($request->has('prescriptions')) {
                    foreach ($request->prescriptions as $rx) {
                        PharmacyPrescription::create([
                            'opd_booking_id' => $booking->id,
                            'patientcode' => $booking->patientcode,
                            'doctor_user_id' => Auth::id(),
                            'product_id' => $rx['product_id'],
                            'dosage' => $rx['dosage'],
                            'quantity_requested' => $rx['quantity'],
                            'duration' => $rx['duration'] ?? null,
                        ]);
                    }
                }

                // F. Update Status
                $booking->update(['status' => 'seen_by_doctor']);
            });

            return redirect()->route('doctor.opd.index')
                ->with('success', 'Consultation saved successfully.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to save: ' . $e->getMessage()]);
        }
    }
}