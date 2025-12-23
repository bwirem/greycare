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
use App\Models\Opd\OpdBooking;
use App\Models\Ipd\IpdWard;
use App\Models\Ipd\IpdBed;
use App\Models\Patient\Patient;

class IpdAdmissionController extends Controller
{
    // ... index and create methods remain the same ...

    public function index(Request $request)
    {
        $query = IpdAdmission::with(['patient', 'ward', 'bed'])
            ->whereIn('status', ['Admitted', 'Pending'])
            ->orderByRaw("FIELD(status, 'Pending', 'Admitted')")
            ->orderBy('created_at', 'desc');

        if ($request->search) {
            $query->whereHas('patient', function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('last_name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%");
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return Inertia::render('Hospital/Ipd/Admissions/Index', [
            'admissions' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function create(Request $request)
    {
        $patient = null;
        $pendingAdmission = null;

        if ($request->admission_id) {
            $pendingAdmission = IpdAdmission::with(['patient', 'ward'])->find($request->admission_id);
            if ($pendingAdmission) {
                $patient = $pendingAdmission->patient;
            }
        } else if ($request->patient_code) {
            $patient = Patient::where('code', $request->patient_code)->first();
        }

        $wards = IpdWard::with(['rooms.beds' => function($q) {
            $q->where('status', 'Free'); 
        }])->orderBy('name')->get();

        return Inertia::render('Hospital/Ipd/Admissions/Create', [
            'patient' => $patient,
            'pendingAdmission' => $pendingAdmission,
            'wards' => $wards
        ]);
    }

    /**
     * Store (Create New or Update Pending)
     */
    public function store(Request $request)
    {
        // 1. Validation: Make Room and Bed NULLABLE
        $request->validate([
            'patient_code' => 'required|exists:patients,code',
            'ward_id' => 'required|exists:ipd_wards,id',
            'admission_date' => 'required|date',
            
            // FIX: Allow these to be empty for Doctor's Request
            'room_id' => 'nullable|exists:ipd_rooms,id',
            'bed_id' => 'nullable|exists:ipd_beds,id',
            
            'pending_admission_id' => 'nullable|exists:ipd_admissions,id'
        ]);

        // If a bed IS selected, verify it is free
        if ($request->filled('bed_id')) {
            $bed = IpdBed::find($request->bed_id);
            if ($bed->status !== 'Free') {
                return back()->withErrors(['bed_id' => 'Selected bed is already occupied.']);
            }
        }

        DB::transaction(function () use ($request) {
            
            // Determine Status: If Bed is selected -> Admitted, Else -> Pending
            $status = $request->filled('bed_id') ? 'Admitted' : 'Pending';

            $admission = null;

            // Scenario A: Finalize Pending Admission (Assigning Bed)
            if ($request->pending_admission_id) {
                $admission = IpdAdmission::find($request->pending_admission_id);
                $admission->update([
                    'ward_id' => $request->ward_id,
                    'room_id' => $request->room_id,
                    'bed_id'  => $request->bed_id,
                    'admission_date' => $request->admission_date,
                    'status' => $status, 
                ]);
            } 
            // Scenario B: Create New Admission (Doctor Request or Direct Admit)
            else {
                // Ensure patient isn't already ACTIVE
                $isActive = IpdAdmission::where('patientcode', $request->patient_code)
                    ->whereIn('status', ['Admitted', 'Pending'])->exists();
                
                if($isActive) {
                    throw new \Exception('Patient is already currently admitted or has a pending request.');
                }

                $admission = IpdAdmission::create([
                    'patientcode' => $request->patient_code,
                    'opd_booking_id' => $request->opd_booking_id ?? null,
                    'ward_id' => $request->ward_id,
                    'room_id' => $request->room_id,
                    'bed_id' => $request->bed_id,
                    'admission_date' => $request->admission_date,
                    'user_id' => Auth::id(),
                    'status' => $status
                ]);
            }

            // 2. Create Audit Log
            IpdAdmissionLog::create([
                'patientcode' => $admission->patientcode,
                'opd_booking_id' => $admission->opd_booking_id,
                'transdate' => now(),
                'ward_id' => $admission->ward_id,
                'room_id' => $admission->room_id,
                'bed_id' => $admission->bed_id,
                'status' => $status,
                'user_id' => Auth::id(),
                'registrystatus' => $request->urgency ?? 'Routine'
            ]);

            // 3. Update Bed Status (Only if bed assigned)
            if ($request->filled('bed_id')) {
                IpdBed::where('id', $request->bed_id)->update(['status' => 'Occupied']);
                Patient::where('code', $request->patient_code)->update(['is_admitted' => true]);
            }

            // --- 4. NEW: UPDATE OPD BOOKING STATUS ---
            // This removes them from the Doctor's OPD Queue
            if ($request->opd_booking_id) {
                OpdBooking::where('id', $request->opd_booking_id)
                    ->update([
                        'consultation_status' => 'Admitted', // Mark as Admitted
                        'ipdstart' => now(),                 // Log start time
                    ]);
            }

            // 5. Update Patient Master Flag
            Patient::where('code', $request->patient_code)->update(['is_admitted' => true]);
        });

        return redirect()->back()->with('success', 'Admission request processed successfully.');
    }
}