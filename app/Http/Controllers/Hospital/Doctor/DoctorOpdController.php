<?php

namespace App\Http\Controllers\Hospital\Doctor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;

// Core Models
use App\Models\Opd\OpdBooking;
use App\Models\MedicalRecord\MrPatientDiagnosisConfirmed;
use App\Models\MedicalRecord\MrPatientDiagnosisProvisional;

// Service Models
use App\Models\Diagnosis\DxtDiagnosesIcd;
use App\Models\Diagnosis\DxtDiagnosesOpd;
use App\Models\Laboratory\LabPrescription;
use App\Models\Laboratory\LabPanel;
use App\Models\Radiology\RadRequest;
use App\Models\Radiology\RadProcedure;

use App\Models\Pharmacy\PharmacyPrescription;
use App\Models\Pharmacy\PharmacyFrequency;
use App\Models\Pharmacy\PharmacyDuration;
use App\Models\SIV_Product;

use App\Models\Theatre\TheatreBooking;
use App\Models\Theatre\TheatreProcedure;
use App\Models\Ipd\IpdWard;

class DoctorOpdController extends Controller
{
    public function index()
    {
        $queue = OpdBooking::with(['patient', 'latestVitalSign'])
            ->whereDate('created_at', today())
            //->where('consultation_status', 'Pending') // Optional: Hide if seen
            ->orderBy('created_at', 'asc')
            ->paginate(20);

        return Inertia::render('Hospital/Doctor/Opd/Index', [
            'queue' => $queue
        ]);
    }

    public function create(OpdBooking $booking)
    {
        // LOAD RELATIONSHIPS WITH RESULTS
        $booking->load([
            'patient',
            'latestVitalSign',
            'history.complains',
            'examination',
            
            // Diagnoses
            'diagnosesConfirmed', 
            'diagnosesProvisional',

            // Lab: Load Panel AND Results (Nested)
            'labRequests.panel',
            'labRequests.sample.results.parameter', 

            // Radiology: Load Procedure AND Report
            'radiologyRequests.procedure',
            'radiologyRequests.report',

            // Pharmacy: Load Product
            'prescriptions.product' 
        ]);

        return Inertia::render('Hospital/Doctor/Opd/Consultation', [
            'booking' => $booking,
            'patient' => $booking->patient,
            'vital_signs' => $booking->latestVitalSign,
            
            // Data for "View/Edit" Mode
            'existing_history' => $booking->history,
            'existing_exam' => $booking->examination,
            
            // Existing Orders (For the "Previous Orders" UI)
            'ordered_labs' => $booking->labRequests,
            'ordered_rads' => $booking->radiologyRequests,
            'ordered_meds' => $booking->prescriptions,

            // Dropdown Data
            'icd_list' => DxtDiagnosesIcd::select('id', 'name', 'code')->limit(100)->get(), 
            'lab_panels' => LabPanel::select('id', 'name')->orderBy('name')->get(),
            'rad_procedures' => RadProcedure::select('id', 'name')->orderBy('name')->get(),
            'surgery_procedures' => TheatreProcedure::select('id', 'name')->orderBy('name')->get(),

            'pharmacy_frequencies' => PharmacyFrequency::select('id', 'name', 'code', 'value')->get(),
            'pharmacy_durations' => PharmacyDuration::select('id', 'name', 'code', 'days')->where('is_active', true)->get(),
            
            // Ensure drugs list includes info if needed (though usually calculated on basic units)           
            'drugs_list' => SIV_Product::with('drugDetails') 
            ->select('id', 'name', 'costprice') 
            ->orderBy('name')
            ->get(),

            'wards_list' => IpdWard::with(['rooms.beds' => function($q) {
                $q->where('status', 'Free'); // Only show free beds
            }])->get()

        ]);
    }

    public function store(Request $request, OpdBooking $booking)
    {
        $request->validate([
            'history_presenting_illness' => 'nullable|string',
            'past_medical_history' => 'nullable|string',         
            'social_and_family_history' => 'nullable|string', 
            'review_of_other_systems' => 'nullable|string',  
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
                ['history_presenting_illness' => $request->history_presenting_illness,
                'past_medical_history' => $request->past_medical_history,
                'social_and_family_history' => $request->social_and_family_history,
                'review_of_other_systems' => $request->review_of_other_systems
                ]
            );

            if ($request->has('complaints')) {
                $history->complains()->delete();
                foreach ($request->complaints as $idx => $comp) {
                    if(!empty($comp['chief_complaint'])) {
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
                    'pallor' => $request->boolean('pallor'),
                    'jaundice' => $request->boolean('jaundice'),
                    'cvs_examination' => $request->cvs_examination ?? null,
                    'rs_examination' => $request->rs_examination ?? null,
                    'abdomen_examination' => $request->abdomen_examination ?? null,
                ]
            );

            // 3. Diagnoses
            if ($request->has('diagnoses')) {
                foreach ($request->diagnoses as $diag) {
                    $modelType = ($diag['type'] === 'icd') ? DxtDiagnosesIcd::class : DxtDiagnosesOpd::class;
                    $data = [
                        'opd_booking_id' => $booking->id,
                        'patientcode' => $booking->patientcode,
                        'user_id' => Auth::id(),
                        'diagnosis_id' => $diag['id'],
                        'diagnosis_type' => $modelType,
                    ];

                    if ($diag['status'] === 'confirmed') {
                        MrPatientDiagnosisConfirmed::firstOrCreate($data);
                    } else {
                        MrPatientDiagnosisProvisional::firstOrCreate($data);
                    }
                }
            }

            // 4. Lab Orders (Only create NEW ones)
            if ($request->has('lab_requests')) {
                foreach ($request->lab_requests as $lab) {
                    // Check if already ordered to prevent duplicates on multi-save
                    // This simple check assumes panel_id + booking_id uniqueness for a session
                    $exists = LabPrescription::where('opd_booking_id', $booking->id)
                        ->where('lab_panel_id', $lab['panel_id'])->exists();
                    
                    if(!$exists) {
                        LabPrescription::create([
                            'opd_booking_id' => $booking->id,
                            'patientcode' => $booking->patientcode,
                            'doctor_user_id' => Auth::id(),
                            'lab_panel_id' => $lab['panel_id'],
                            'status' => 'ordered'
                        ]);
                    }
                }
            }

            // 5. Radiology Orders
            if ($request->has('rad_requests')) {
                foreach ($request->rad_requests as $rad) {
                    $exists = RadRequest::where('opd_booking_id', $booking->id)
                        ->where('rad_procedure_id', $rad['procedure_id'])->exists();

                    if(!$exists) {
                        RadRequest::create([
                            'opd_booking_id' => $booking->id,
                            'patientcode' => $booking->patientcode,
                            'requested_by' => Auth::id(),
                            'rad_procedure_id' => $rad['procedure_id'],
                            'status' => 'ordered',
                            'accession_number' => 'RAD-' . date('YmdHis') . '-' . rand(100,999)
                        ]);
                    }
                }
            }

            // 6. Pharmacy
            if ($request->has('prescriptions')) {
                foreach ($request->prescriptions as $rx) {
                    // Simple check based on product_id
                    $exists = PharmacyPrescription::where('opd_booking_id', $booking->id)
                        ->where('product_id', $rx['product_id'])
                        ->where('status', 'Prescribed')->exists();

                    if(!$exists) {
                        PharmacyPrescription::create([
                            'opd_booking_id' => $booking->id,
                            'patientcode' => $booking->patientcode,
                            'doctor_user_id' => Auth::id(),
                            'product_id' => $rx['product_id'],
                            'dosage' => $rx['dosage'],
                            'frequency' => $rx['frequency'],
                            'duration' => $rx['duration'] ?? '5 days',
                            'quantity_prescribed' => $rx['quantity'], 
                            'status' => 'Prescribed'
                        ]);
                    }
                }
            }

            // 7. Surgery
            if (!empty($request->surgery_request['procedure_id']) && !empty($request->surgery_request['date'])) {
                $surgDate = Carbon::parse($request->surgery_request['date']);
                TheatreBooking::firstOrCreate([
                    'opd_booking_id' => $booking->id,
                    'theatre_procedure_id' => $request->surgery_request['procedure_id']
                ], [
                    'patientcode' => $booking->patientcode,
                    'doctor_user_id' => Auth::id(),
                    'scheduled_at' => $surgDate,
                    'status' => 'Scheduled'
                ]);
            }

            // 8. Update Status
            $booking->update(['consultation_status' => 'Seen']);

            DB::commit();
            return redirect()->back()->with('success', 'Consultation saved successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('OPD Save Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Error: ' . $e->getMessage()]);
        }
    }
}