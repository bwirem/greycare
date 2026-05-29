<?php

namespace App\Http\Controllers\Hospital\Ipd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Ipd\IpdAdmission;
use App\Models\Ipd\IpdTransferLog;
use App\Models\Ipd\IpdWard;
use App\Models\Ipd\IpdBed;

class IpdTransferController extends Controller
{
    public function index(Request $request)
    {
        // Start the query
        $query = IpdAdmission::with(['patient', 'ward', 'bed'])
            ->where('status', 'Admitted');

        // --- APPLY SEARCH FILTER ---
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('patient', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%");
            });
        }

        // Paginate and preserve query string (so pagination works during search)
        $admissions = $query->paginate(15)->withQueryString();

        return Inertia::render('Hospital/Ipd/Transfers/Index', [
            'admissions' => $admissions,
            'filters'    => $request->only(['search']) // Pass current search back to React
        ]);
    }

    public function create(IpdAdmission $admission)
    {
        $admission->load(['patient', 'ward', 'room', 'bed']);
        
        return Inertia::render('Hospital/Ipd/Transfers/Create', [
            'admission' => $admission,
            'wards' => IpdWard::with(['rooms.beds' => fn($q) => $q->where('status', 'Free')])->get()
        ]);
    }

    public function store(Request $request, IpdAdmission $admission)
    {
        $request->validate([
            'to_ward_id' => 'required|exists:ipd_wards,id',
            'to_room_id' => 'required|exists:ipd_rooms,id',
            'to_bed_id' => 'required|exists:ipd_beds,id',
            'reason' => 'nullable|string'
        ]);

        DB::transaction(function () use ($request, $admission) {
            // 1. Log Previous Bed as Free
            IpdBed::where('id', $admission->bed_id)->update(['status' => 'Free']);

            // 2. Create Transfer Log
            IpdTransferLog::create([
                'patientcode' => $admission->patientcode,
                'transferdate' => now(),
                // From
                'from_ward_id' => $admission->ward_id,
                'from_room_id' => $admission->room_id,
                'from_bed_id' => $admission->bed_id,
                // To
                'to_ward_id' => $request->to_ward_id,
                'to_room_id' => $request->to_room_id,
                'to_bed_id' => $request->to_bed_id,
                // Meta
                'patientcondition' => $request->reason,
                'user_id' => Auth::id()
            ]);

            // 3. Update Master Admission Record
            $admission->update([
                'ward_id' => $request->to_ward_id,
                'room_id' => $request->to_room_id,
                'bed_id' => $request->to_bed_id,
            ]);

            // 4. Mark New Bed as Occupied
            IpdBed::where('id', $request->to_bed_id)->update(['status' => 'Occupied']);
        });

        return redirect()->route('inpatient2.index')->with('success', 'Patient transferred successfully.');
    }
}