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
use App\Models\Ipd\IpdBed;
use App\Models\Ipd\IpdRoom;
use App\Models\Patient\Patient;

class IpdAdmissionController extends Controller
{
    /**
     * List Active and Pending Admissions
     */
    public function index(Request $request)
    {
        $query = IpdAdmission::with(['patient', 'ward', 'bed'])
            ->whereIn('status', ['Admitted', 'Pending'])
            ->orderByRaw("FIELD(status, 'Pending', 'Admitted')") // Show Pending first
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

    /**
     * Show Admission Form (New OR Finalize Pending)
     */
    public function create(Request $request)
    {
        $patient = null;
        $pendingAdmission = null;

        // Case 1: Finalizing a Pending Admission (Link clicked from Index)
        if ($request->admission_id) {
            $pendingAdmission = IpdAdmission::with(['patient', 'ward'])->find($request->admission_id);
            if ($pendingAdmission) {
                $patient = $pendingAdmission->patient;
            }
        } 
        // Case 2: New Direct Admission (Searching by Patient Code)
        else if ($request->patient_code) {
            $patient = Patient::where('code', $request->patient_code)->first();
        }

        // Fetch Wards with Rooms and Free Beds
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
        // For final admission, Room and Bed are now REQUIRED
        $request->validate([
            'patient_code' => 'required|exists:patients,code',
            'ward_id' => 'required|exists:ipd_wards,id',
            'room_id' => 'required|exists:ipd_rooms,id',
            'bed_id' => 'required|exists:ipd_beds,id',
            'admission_date' => 'required|date',
            'pending_admission_id' => 'nullable|exists:ipd_admissions,id'
        ]);

        // Check if bed is actually free
        $bed = IpdBed::find($request->bed_id);
        if ($bed->status !== 'Free') {
            return back()->withErrors(['bed_id' => 'Selected bed is already occupied.']);
        }

        DB::transaction(function () use ($request) {
            
            $admission = null;

            // Scenario A: Finalize Pending Admission
            if ($request->pending_admission_id) {
                $admission = IpdAdmission::find($request->pending_admission_id);
                $admission->update([
                    'ward_id' => $request->ward_id,
                    'room_id' => $request->room_id,
                    'bed_id'  => $request->bed_id,
                    'admission_date' => $request->admission_date,
                    'status' => 'Admitted', // Flip status to Active
                    // Keep original opd_booking_id and user_id (doctor)
                ]);
            } 
            // Scenario B: Create New Admission (Direct)
            else {
                // Ensure patient isn't already admitted
                $isActive = IpdAdmission::where('patientcode', $request->patient_code)
                    ->whereIn('status', ['Admitted', 'Pending'])->exists();
                
                if($isActive) {
                    throw new \Exception('Patient is already currently admitted.');
                }

                $admission = IpdAdmission::create([
                    'patientcode' => $request->patient_code,
                    'ward_id' => $request->ward_id,
                    'room_id' => $request->room_id,
                    'bed_id' => $request->bed_id,
                    'admission_date' => $request->admission_date,
                    'user_id' => Auth::id(),
                    'status' => 'Admitted'
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
                'status' => 'Admitted',
                'user_id' => Auth::id(),
            ]);

            // 3. Update Bed Status
            IpdBed::where('id', $request->bed_id)->update(['status' => 'Occupied']);

            // 4. Update Patient Master Flag
            Patient::where('code', $request->patient_code)->update(['is_admitted' => true]);
        });

        return redirect()->route('inpatient0.index')->with('success', 'Patient admission finalized.');
    }
}