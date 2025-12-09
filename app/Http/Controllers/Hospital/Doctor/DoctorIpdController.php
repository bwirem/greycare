<?php

namespace App\Http\Controllers\Hospital\Doctor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// Models - IPD
use App\Models\Ipd\IpdAdmission;
use App\Models\Ipd\IpdWardRound;

// Models - Services
use App\Models\Pharmacy\PharmacyPrescription;
use App\Models\Laboratory\LabPrescription;
use App\Models\Radiology\RadRequest;
use App\Models\BloodBank\BbIssueRequest;
use App\Models\BloodBank\BbComponentType; // For dropdown

class DoctorIpdController extends Controller
{
    public function index()
    {
        $admissions = IpdAdmission::with(['patient', 'ward', 'bed'])
            ->where('status', 'Admitted')
            ->paginate(20);

        return Inertia::render('Hospital/Doctor/Ipd/Index', [
            'admissions' => $admissions
        ]);
    }

    public function create(IpdAdmission $admission)
    {
        $admission->load([
            'patient',
            'wardRounds.doctor', 
            'wardRounds.assessment'
        ]);

        return Inertia::render('Hospital/Doctor/Ipd/WardRound', [
            'admission' => $admission,
            'patient' => $admission->patient,
            'previous_rounds' => $admission->wardRounds,
            'bb_components' => BbComponentType::select('id', 'name')->get(),
            // Pass other dropdowns as needed
        ]);
    }

    public function store(Request $request, IpdAdmission $admission)
    {
        $request->validate([
            'clinical_notes' => 'required|string',
            'treatment_plan' => 'nullable|string',
            'general_condition' => 'nullable|string',
            
            // Orders
            'lab_requests' => 'nullable|array',
            'rad_requests' => 'nullable|array',
            'blood_requests' => 'nullable|array', // { component_id, units }
            'new_prescriptions' => 'nullable|array',
        ]);

        DB::transaction(function () use ($request, $admission) {
            
            // 1. Create Ward Round
            $round = IpdWardRound::create([
                'ipd_admission_id' => $admission->id,
                'user_id' => Auth::id(),
                'patientcode' => $admission->patientcode,
                'round_date' => now(),
                'clinical_notes' => $request->clinical_notes,
                'treatment_plan' => $request->treatment_plan,
                'general_condition' => $request->general_condition,
            ]);

            // 2. Save Physical Exam (Polymorphic linked to Round)
            $round->examination()->create([
                'general_condition' => $request->general_condition,
                'pallor' => $request->pallor ?? 0,
                // ... map vitals
            ]);

            // 3. Save Lab Orders (Linked to Admission)
            if ($request->has('lab_requests')) {
                foreach ($request->lab_requests as $lab) {
                    LabPrescription::create([
                        'ipd_admission_id' => $admission->id, // Important: Link to admission
                        'patientcode' => $admission->patientcode,
                        'doctor_user_id' => Auth::id(),
                        'lab_panel_id' => $lab['panel_id'],
                        'status' => 'ordered'
                    ]);
                }
            }

            // 4. Save Radiology Orders
            if ($request->has('rad_requests')) {
                foreach ($request->rad_requests as $rad) {
                    RadRequest::create([
                        // 'ipd_admission_id' => $admission->id, // Ensure migration has this or link via patientcode/date
                        'opd_booking_id' => $admission->opd_booking_id, // Fallback if no IPD column
                        'patientcode' => $admission->patientcode,
                        'requested_by' => Auth::id(),
                        'rad_procedure_id' => $rad['procedure_id'],
                        'status' => 'ordered'
                    ]);
                }
            }

            // 5. Save Blood Bank Requests
            if ($request->has('blood_requests')) {
                foreach ($request->blood_requests as $bb) {
                    BbIssueRequest::create([
                        'ipd_admission_id' => $admission->id,
                        'patientcode' => $admission->patientcode,
                        'requested_by' => Auth::id(),
                        'bb_component_type_id' => $bb['component_id'],
                        // FIX: Add this line. Use Patient's group or fallback to 'Unknown' if not set
                        'blood_group_required' => $admission->patient->blood_group ?? 'Unknown', 
                        'units_required' => $bb['units'],
                        'urgency' => 'Routine', // or from form
                        'status' => 'Requested'
                    ]);
                }
            }

            // 6. Save Pharmacy
            if ($request->has('new_prescriptions')) {
                foreach ($request->new_prescriptions as $rx) {
                    PharmacyPrescription::create([
                        'ipd_admission_id' => $admission->id,
                        'patientcode' => $admission->patientcode,
                        'doctor_user_id' => Auth::id(),
                        'product_id' => $rx['product_id'],
                        'dosage' => $rx['dosage'],
                        'quantity_prescribed' => $rx['quantity'],
                    ]);
                }
            }
        });

        return redirect()->route('doctor1.index')->with('success', 'Round saved.');
    }
}