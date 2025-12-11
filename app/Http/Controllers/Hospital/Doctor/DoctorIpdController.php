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

// Models - Services
use App\Models\Pharmacy\PharmacyPrescription;
use App\Models\Pharmacy\PharmacyFrequency;
use App\Models\Pharmacy\PharmacyDuration;
use App\Models\SIV_Product;

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
            
            // Load Active Orders linked to this Admission (Cumulative view)
            'labRequests.panel', 
            'labRequests.sample.results.parameter', // Nested results
            
            'radiologyRequests.procedure',
            'radiologyRequests.report', // Nested report
            
            'prescriptions.product'
        ]);

        return Inertia::render('Hospital/Doctor/Ipd/WardRound', [
            'admission' => $admission,
            'patient' => $admission->patient,
            'previous_rounds' => $admission->wardRounds,
            
            // Existing Orders for Dashboard
            'ordered_labs' => $admission->labRequests,
            'ordered_rads' => $admission->radiologyRequests,
            'ordered_meds' => $admission->prescriptions,

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

            DB::commit();
            return redirect()->route('doctor1.index')->with('success', 'Ward round completed.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("IPD Round Error: " . $e->getMessage());
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}