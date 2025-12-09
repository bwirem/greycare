<?php

namespace App\Http\Controllers\Hospital\Ipd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// Models
use App\Models\Ipd\IpdAdmission;
use App\Models\Ipd\IpdAdmissionLog;
use App\Models\Ipd\IpdWard;
use App\Models\Ipd\IpdRoom; 
use App\Models\Ipd\IpdBed;

use App\Models\Patient\Patient;
use App\Models\Opd\OpdBooking;

class IpdAdmissionController extends Controller
{
    // List Active Admissions
    public function index(Request $request)
    {
        $query = IpdAdmission::with(['patient', 'ward', 'bed'])
            ->where('status', 'Admitted');

        if ($request->search) {
            $query->whereHas('patient', function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%");
            });
        }

        return Inertia::render('Hospital/Ipd/Admissions/Index', [
            'admissions' => $query->latest()->paginate(15),
            'filters' => $request->only(['search'])
        ]);
    }

    // Show Admission Form (Select Patient & Bed)
    public function create(Request $request)
    {
        $patient = null;
        if ($request->patient_code) {
            $patient = Patient::where('code', $request->patient_code)->first();
        }

        return Inertia::render('Hospital/Ipd/Admissions/Create', [
            'patient' => $patient,
            'wards' => IpdWard::with(['rooms.beds' => function($q) {
                $q->where('status', 'Free'); // Only show free beds
            }])->get()
        ]);
    }

    // Execute Admission
    public function store(Request $request)
    {
        $request->validate([
            'patient_code' => 'required|exists:patients,code',
            'ward_id' => 'required|exists:ipd_wards,id',
            'room_id' => 'required|exists:ipd_rooms,id',
            'bed_id' => 'required|exists:ipd_beds,id',
            'admission_date' => 'required|date',
        ]);

        DB::transaction(function () use ($request) {
            // 1. Create Master Admission Record
            $admission = IpdAdmission::create([
                'patientcode' => $request->patient_code,
                'ward_id' => $request->ward_id,
                'room_id' => $request->room_id,
                'bed_id' => $request->bed_id,
                'admission_date' => $request->admission_date,
                'user_id' => Auth::id(),
                'status' => 'Admitted'
            ]);

            // 2. Create Audit Log (Admission Log)
            IpdAdmissionLog::create([
                'patientcode' => $request->patient_code,
                'transdate' => now(),
                'ward_id' => $request->ward_id,
                'room_id' => $request->room_id,
                'bed_id' => $request->bed_id,
                'status' => 'open',
                'user_id' => Auth::id(),
            ]);

            // 3. Mark Bed as Occupied
            IpdBed::where('id', $request->bed_id)->update(['status' => 'Occupied']);
            
            // 4. Update Patient Status
            Patient::where('code', $request->patient_code)->update(['is_admitted' => true]);
        });

        return redirect()->route('inpatient0.index')->with('success', 'Patient admitted successfully.');
    }
}