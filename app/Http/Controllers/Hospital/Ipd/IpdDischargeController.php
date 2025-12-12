<?php

namespace App\Http\Controllers\Hospital\Ipd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Ipd\IpdAdmission;
use App\Models\Ipd\IpdDischargeLog;
use App\Models\Ipd\IpdDischargeStatus;
use App\Models\Ipd\IpdBed;
use App\Models\Patient\Patient;

class IpdDischargeController extends Controller
{
    public function index(Request $request)
    {
       // Show Admitted AND Discharge Pending patients
        // 'Discharge Pending' means doctor has cleared them
        $query = IpdAdmission::with(['patient', 'ward', 'bed'])
            ->whereIn('status', ['Admitted', 'Discharge Pending'])
            ->orderByRaw("FIELD(status, 'Discharge Pending', 'Admitted')"); // Pending ones first

        if ($request->search) {
            $query->whereHas('patient', function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('last_name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%");
                  //->orWhere('phone_number', 'like', "%{$request->search}%");
            });
        }

        return Inertia::render('Hospital/Ipd/Discharges/Index', [
            'admissions' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }

    public function create(IpdAdmission $admission)
    {
        $admission->load(['patient', 'ward', 'bed','dischargeSummary']);
        
        return Inertia::render('Hospital/Ipd/Discharges/Create', [
            'admission' => $admission,
            'statuses' => IpdDischargeStatus::all() // e.g. Recovered, Deceased, Referred
        ]);
    }

    public function store(Request $request, IpdAdmission $admission)
    {
        $request->validate([
            'discharge_status_id' => 'required|exists:ipd_discharge_statuses,id',
            'remarks' => 'nullable|string',
            'discharge_date' => 'required|date'
        ]);

        DB::transaction(function () use ($request, $admission) {
            
            // 1. Create Discharge Log
            IpdDischargeLog::create([
                'patientcode' => $admission->patientcode,
                'transdate' => $request->discharge_date,
                // Location at time of discharge
                'ward_id' => $admission->ward_id,
                'room_id' => $admission->room_id,
                'bed_id' => $admission->bed_id,
                
                'discharge_status_id' => $request->discharge_status_id,
                'dischargeremarks' => $request->remarks,
                'user_id' => Auth::id()
            ]);

            // 2. Free up the Bed
            IpdBed::where('id', $admission->bed_id)->update(['status' => 'Free']);

            // 3. Update Master Admission to Discharged
            $admission->update([
                'status' => 'Discharged',
                // 'discharged_at' => $request->discharge_date // If you add this column
            ]);

            // 4. Update Patient Master
            Patient::where('code', $admission->patientcode)->update(['is_admitted' => false]);
        });

        return redirect()->route('inpatient1.index')->with('success', 'Patient discharged.');
    }
}