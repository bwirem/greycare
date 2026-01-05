<?php

namespace App\Http\Controllers\Hospital\Clinical;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

// Core Models
use App\Models\Opd\OpdBooking;
use App\Models\Ipd\IpdAdmission;
use App\Models\Nursing\NursingMedicationAdministration;
use App\Models\MedicalRecord\MrVitalSign;

// Pharmacy Models
use App\Models\Pharmacy\PharmacyFrequency;
use App\Models\Pharmacy\PharmacyDuration;

// Medical Record Models (For Diagnosis History)
use App\Models\MedicalRecord\MrPatientDiagnosisConfirmed;
use App\Models\MedicalRecord\MrPatientDiagnosisProvisional;
use App\Models\MedicalRecord\MrPatientDiagnosisIcdConfirmed;
use App\Models\MedicalRecord\MrPatientDiagnosisIcdProvisional;

class NursingMedicationController extends Controller
{
    /**
     * 1. The Queue: List patients with active prescriptions
     */
    public function index(Request $request)
    {
        // 1. Fetch OPD Patients -> Convert to Base Collection -> Map to Array
        $opdQueue = OpdBooking::whereHas('prescriptions')
            ->with(['patient', 'prescriptions'])
            ->whereDate('created_at', today()) 
            ->get()
            ->toBase()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'type' => 'OPD',
                    'patient_name' => $booking->patient->first_name . ' ' . $booking->patient->last_name,
                    'patient_code' => $booking->patientcode,
                    'location' => 'OPD Clinic',
                    'med_count' => $booking->prescriptions->count(),
                ];
            });

        // 2. Fetch IPD Patients -> Convert to Base Collection -> Map to Array
        $ipdQueue = IpdAdmission::where('status', 'Admitted')
            ->with(['patient', 'ward', 'bed', 'prescriptions'])
            ->get()
            ->toBase()
            ->map(function ($adm) {
                return [
                    'id' => $adm->id,
                    'type' => 'IPD',
                    'patient_name' => $adm->patient->first_name . ' ' . $adm->patient->last_name,
                    'patient_code' => $adm->patientcode,
                    'location' => ($adm->ward->name ?? '-') . ' / ' . ($adm->bed->name ?? '-'),
                    'med_count' => $adm->prescriptions->count(),
                ];
            });

        // 3. Merge Lists
        $queue = $opdQueue->merge($ipdQueue);

        return Inertia::render('Hospital/Nursing/Medication/Index', [
            'queue' => $queue,            
        ]);
    }

    /**
     * 2. The Form: View MAR + Vitals + History
     */
    public function create($id, $type)
    {
        $patientInfo = null;
        $prescriptions = [];
        
        // History Variables
        $previousRounds = [];
        $opdConsultation = null;
        $diagnosisHistory = [];
        $vitalsHistory = []; 

        if ($type === 'OPD') {
            $booking = OpdBooking::with([
                'patient', 
                'prescriptions.product.drugDetails', 
                'prescriptions.administrations.nurse',
                // Load Vitals linked to this booking
                'vitalSigns' => function($q) { 
                    $q->orderBy('vitaldatetime', 'desc')->with('user'); 
                },
                // Load History details
                'history', 
                'labRequests', 
                'diagnosesConfirmed', 
                'icdDiagnosesConfirmed'
            ])->findOrFail($id);
            
            $patientInfo = $booking->patient;
            $prescriptions = $booking->prescriptions;
            $opdConsultation = $booking; // For OPD, the record itself is the consultation
            $vitalsHistory = $booking->vitalSigns; 

            // Basic Diagnosis extraction for OPD (Simplified compared to IPD)
            // You can implement the full deep dive logic here if needed, 
            // but usually, OPD just shows the current visit's diagnosis.

        } else {
            // --- IPD Logic (Deep Load) ---
            $admission = IpdAdmission::with([
                'patient', 
                'prescriptions.product.drugDetails', 
                'prescriptions.administrations.nurse',
                // Load Ward Rounds
                'wardRounds' => function($q) {
                    $q->orderBy('round_date', 'desc')->with(['doctor', 'examination']);
                },
                // Load Linked OPD Data
                'booking.history',
                'booking.prescriptions.product',
                'booking.labRequests.panel',
                'booking.user',
                // Load Vitals linked to this admission
                'vitalSigns' => function($q) { 
                    $q->orderBy('vitaldatetime', 'desc')->with('user'); 
                }
            ])->findOrFail($id);

            $patientInfo = $admission->patient;
            $prescriptions = $admission->prescriptions;
            $previousRounds = $admission->wardRounds;
            $opdConsultation = $admission->booking;
            $vitalsHistory = $admission->vitalSigns;

            // --- Process IPD Diagnosis History ---
            $diagCollection = collect();
            $coveredIcdCodes = [];

            $genConf = MrPatientDiagnosisConfirmed::where('ipd_admission_id', $admission->id)->with(['diagnosis.icdMap', 'user'])->get();
            $genProv = MrPatientDiagnosisProvisional::where('ipd_admission_id', $admission->id)->with(['diagnosis.icdMap', 'user'])->get();
            $icdConf = MrPatientDiagnosisIcdConfirmed::where('ipd_admission_id', $admission->id)->with(['icdDiagnosis', 'user'])->get();
            $icdProv = MrPatientDiagnosisIcdProvisional::where('ipd_admission_id', $admission->id)->with(['icdDiagnosis', 'user'])->get();

            $processRecords = function($records, $status, $source) use (&$diagCollection, &$coveredIcdCodes) {
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

                    $diagCollection->push([
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

            $diagnosisHistory = $diagCollection->sortByDesc('created_at')->values();
        }

        return Inertia::render('Hospital/Nursing/Medication/Create', [
            'patient' => $patientInfo,
            'prescriptions' => $prescriptions,
            'source_id' => $id,
            'source_type' => $type,
            
            // History Data
            'previous_rounds' => $previousRounds,
            'opd_consultation' => $opdConsultation,
            'diagnosis_history' => $diagnosisHistory,
            'vitals_history' => $vitalsHistory,

            // Dropdowns
            'pharmacy_frequencies' => PharmacyFrequency::select('id', 'name', 'code', 'value')->get(),
            'pharmacy_durations' => PharmacyDuration::select('id', 'name', 'code', 'days')->where('is_active', true)->get(),
        ]);
    }

    /**
     * 3. Store: Record Medication Administration
     */
    public function store(Request $request)
    {
        $request->validate([
            'prescription_id' => 'required|exists:pharmacy_prescriptions,id',
            'status' => 'required|in:Given,Missed,Refused,Held',
            'remarks' => 'nullable|string',
            'quantity' => 'required|numeric|min:0', 
            'source_type' => 'required|in:OPD,IPD',
            'source_id' => 'required'
        ]);

        NursingMedicationAdministration::create([
            'pharmacy_prescription_id' => $request->prescription_id,
            'nurse_user_id' => Auth::id(),
            'administered_at' => now(),
            'status' => $request->status,
            'quantity' => $request->quantity,
            'remarks' => $request->remarks,
            'opd_booking_id' => ($request->source_type === 'OPD') ? $request->source_id : null,
            'ipd_admission_id' => ($request->source_type === 'IPD') ? $request->source_id : null,
        ]);

        return back()->with('success', 'Medication administration recorded.');
    }

    /**
     * 4. Store: Record Vital Signs
     */
    public function storeVitals(Request $request)
    {
        $request->validate([
            'source_id' => 'required',
            'source_type' => 'required|in:OPD,IPD',
            'bp' => 'nullable|string',
            'temperature' => 'nullable|numeric',
            'pulse' => 'nullable|numeric',
            'spo2' => 'nullable|numeric',
        ]);

        MrVitalSign::create([
            'patientcode' => $request->patient_code, 
            'user_id' => Auth::id(),
            'vitaldatetime' => now(),
            
            // Link dynamically based on type
            'opd_booking_id' => ($request->source_type === 'OPD') ? $request->source_id : null,
            'ipd_admission_id' => ($request->source_type === 'IPD') ? $request->source_id : null,

            'blood_pressure' => $request->bp,
            'temperature' => $request->temperature ?? 0,
            'pulse' => $request->pulse ?? 0,
            'respirationrate' => $request->resp_rate ?? 0,
            'oxygensaturation' => $request->spo2 ?? 0,
            'weight' => $request->weight ?? 0,
            'height' => $request->height ?? 0,
            'bmi' => $request->bmi ?? 0,
        ]);

        return back()->with('success', 'Vitals recorded successfully.');
    }
}