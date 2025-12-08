<?php

namespace App\Http\Controllers\Hospital\Doctor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// Models
use App\Models\Ipd\IpdAdmission;
use App\Models\Ipd\IpdWardRound;
use App\Models\Pharmacy\PharmacyPrescription;

class DoctorIpdController extends Controller
{
    public function index()
    {
        // 1. List Admitted Patients
        $admissions = IpdAdmission::with(['patient', 'ward', 'bed'])
            ->where('status', 'Admitted')
            ->orderBy('ward_id')
            ->paginate(20);

        return Inertia::render('Hospital/Doctor/Ipd/Index', [
            'admissions' => $admissions
        ]);
    }

    public function create(IpdAdmission $admission)
    {
        // 2. Load History of previous rounds
        $admission->load([
            'patient',
            'wardRounds.doctor', 
            'wardRounds.assessment', // Load previous assessments
            'wardRounds.examination' // Load previous exams
        ]);

        return Inertia::render('Hospital/Doctor/Ipd/WardRound', [
            'admission' => $admission,
            'patient' => $admission->patient,
            'previous_rounds' => $admission->wardRounds,
        ]);
    }

    public function store(Request $request, IpdAdmission $admission)
    {
        // 3. Validation
        $request->validate([
            // Round Details
            'clinical_notes' => 'required|string', // Progress Notes
            'treatment_plan' => 'nullable|string',
            
            // Assessment (New Complaints since last round)
            'systematic_examination' => 'nullable|string',
            'has_new_complaint' => 'boolean',
            'new_complaints' => 'nullable|array', // Grid data
            
            // Physical Exam (Current Status)
            'general_condition' => 'nullable|string',
            'pallor' => 'boolean',
            
            // Orders
            'new_prescriptions' => 'nullable|array',
        ]);

        try {
            DB::transaction(function () use ($request, $admission) {

                // A. Create the Ward Round Event (Parent)
                $round = IpdWardRound::create([
                    'ipd_admission_id' => $admission->id,
                    'user_id' => Auth::id(), // The Doctor
                    'patientcode' => $admission->patientcode,
                    'round_date' => now(),
                    'clinical_notes' => $request->clinical_notes,
                    'treatment_plan' => $request->treatment_plan,
                    'general_condition' => $request->general_condition, // Quick snapshot
                ]);

                // B. Save Assessment (The detailed progress notes/complaints)
                $assessment = $round->assessment()->create([
                    // Linked automatically via relationship method
                    'systematic_examination' => $request->systematic_examination,
                    'has_new_complaint' => $request->has_new_complaint ?? 0,
                ]);

                // Save Assessment Complaints (Children)
                if ($request->has('new_complaints')) {
                    $assessment->complains()->createMany($request->new_complaints);
                }

                // C. Save Physical Examination (Polymorphic linked to Round)
                $round->examination()->create([
                    // 'examinable_type' and 'id' set automatically by Laravel relationship
                    'general_condition' => $request->general_condition,
                    'glasgow_coma_score' => $request->glasgow_coma_score,
                    'pallor' => $request->pallor ?? 0,
                    'jaundice' => $request->jaundice ?? 0,
                    'oedema' => $request->oedema,
                    'cvs_examination' => $request->cvs_examination,
                    'rs_examination' => $request->rs_examination,
                    'abdomen_examination' => $request->abdomen_examination,
                    // ... map other fields
                ]);

                // D. Save New Prescriptions (Linked to Admission)
                if ($request->has('new_prescriptions')) {
                    foreach ($request->new_prescriptions as $rx) {
                        PharmacyPrescription::create([
                            'ipd_admission_id' => $admission->id, // Linked to admission
                            'patientcode' => $admission->patientcode,
                            'doctor_user_id' => Auth::id(),
                            'product_id' => $rx['product_id'],
                            'dosage' => $rx['dosage'],
                            'quantity_requested' => $rx['quantity'],
                            'notes' => 'Ordered during ward round',
                        ]);
                    }
                }
            });

            return redirect()->route('doctor.ipd.index')
                ->with('success', 'Ward round details saved.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to save round: ' . $e->getMessage()]);
        }
    }

    public function discharge(Request $request, IpdAdmission $admission)
    {
        // Logic to mark patient as Ready for Discharge
        $admission->update([
            'status' => 'Discharge Pending',
            // 'discharge_ordered_by' => Auth::id(),
            // 'discharge_ordered_at' => now()
        ]);
        
        // Optionally create an ipd_discharge_log entry here via Service

        return redirect()->back()->with('success', 'Patient marked for discharge.');
    }
}