<?php

namespace App\Http\Controllers\Hospital\Clinical;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Opd\OpdBooking;
use App\Models\Ipd\IpdAdmission;
use App\Models\Nursing\NursingMedicationAdministration;
use App\Models\Pharmacy\PharmacyFrequency;
use App\Models\Pharmacy\PharmacyDuration;            

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
            ->toBase() // <--- FIX: Convert to standard collection
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
            ->toBase() // <--- FIX: Convert to standard collection
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

        // 3. Merge (Now works because both are standard collections of arrays)
        $queue = $opdQueue->merge($ipdQueue);

        return Inertia::render('Hospital/Nursing/Medication/Index', [
            'queue' => $queue,            
        ]);
    }

    /**
     * 2. The Form: View Patient's Med Sheet (MAR)
     */
    public function create($id, $type)
    {
        $prescriptions = [];
        $patientInfo = null;

        if ($type === 'OPD') {
            $booking = OpdBooking::with(['patient', 'prescriptions.product.drugDetails', 'prescriptions.administrations.nurse'])->findOrFail($id);
            $patientInfo = $booking->patient;
            $prescriptions = $booking->prescriptions;
        } else {
            $admission = IpdAdmission::with(['patient', 'prescriptions.product.drugDetails', 'prescriptions.administrations.nurse'])->findOrFail($id);
            $patientInfo = $admission->patient;
            $prescriptions = $admission->prescriptions;
        }

        return Inertia::render('Hospital/Nursing/Medication/Create', [
            'patient' => $patientInfo,
            'prescriptions' => $prescriptions,
            'source_id' => $id,
            'source_type' => $type,
            
            // --- ADD THESE LINES ---
            'pharmacy_frequencies' => PharmacyFrequency::select('id', 'name', 'code', 'value')->get(),
            'pharmacy_durations' => PharmacyDuration::select('id', 'name', 'code', 'days')->where('is_active', true)->get(),
        ]);
    }

    /**
     * 3. Store: Record Administration
     */
    public function store(Request $request)
    {
        $request->validate([
            'prescription_id' => 'required|exists:pharmacy_prescriptions,id',
            'status' => 'required|in:Given,Missed,Refused,Held',
            'remarks' => 'nullable|string',
            'quantity' => 'required|numeric|min:0', // <--- Validation
            'source_type' => 'required|in:OPD,IPD',
            'source_id' => 'required'
        ]);

        NursingMedicationAdministration::create([
            'pharmacy_prescription_id' => $request->prescription_id,
            'nurse_user_id' => Auth::id(),
            'administered_at' => now(),
            'status' => $request->status,
            'quantity' => $request->quantity, // <--- Save Logic
            'remarks' => $request->remarks,
            'opd_booking_id' => ($request->source_type === 'OPD') ? $request->source_id : null,
            'ipd_admission_id' => ($request->source_type === 'IPD') ? $request->source_id : null,
        ]);

        return back()->with('success', 'Medication administration recorded.');
    }
}