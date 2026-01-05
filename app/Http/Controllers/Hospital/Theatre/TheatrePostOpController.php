<?php

namespace App\Http\Controllers\Hospital\Theatre;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Theatre\TheatreBooking;
use App\Models\Theatre\TheatrePostOpArrival;
use App\Models\Theatre\TheatrePostOpTreatment;
use App\Models\Theatre\TheatrePostOpDischarge;
use App\Models\Ipd\IpdWard; // <--- 1. Import IpdWard Model


class TheatrePostOpController extends Controller
{
    public function index(Request $request)
    {
        // 1. Start Query
        $query = TheatreBooking::with(['patient', 'procedure', 'theatre'])
            ->where('status', 'Recovery');

        // 2. Handle Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('patientcode', 'like', "%{$search}%")
                  ->orWhereHas('patient', function($subQ) use ($search) {
                      $subQ->where('first_name', 'like', "%{$search}%")
                           ->orWhere('last_name', 'like', "%{$search}%");
                  });
            });
        }

        // 3. Paginate
        $records = $query->orderBy('updated_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Hospital/Theatre/PostOp/Index', [
            'records' => $records, 
            'filters' => $request->only(['search'])
        ]);
    }

    public function create(TheatreBooking $booking)
    {
        // Load existing vitals history
        $booking->load(['patient', 'procedure', 'postOpArrivals' => function($q) {
            $q->latest();
        }]);

        // --- 2. Fetch Wards from Database ---
        $wards = IpdWard::select('id', 'name')
            // ->where('is_active', true) // Uncomment if you have an active flag
            ->orderBy('name')
            ->get();

        return Inertia::render('Hospital/Theatre/PostOp/Care', [
            'booking' => $booking,
            'wards'   => $wards // <--- 3. Pass to Frontend
        ]);
    }

    public function store(Request $request, TheatreBooking $booking)
    {
        $request->validate([
            'bp' => 'required|string', 
            'spo2' => 'required|numeric',
        ]);

        DB::transaction(function () use ($request, $booking) {
            
            // 1. Log Vitals
            TheatrePostOpArrival::create([
                'theatre_booking_id' => $booking->id,
                'nurse_user_id' => Auth::id(),
                'bp' => $request->bp,
                'spo2' => $request->spo2,
                'heart_rate' => $request->heart_rate ?? $request->hr ?? 0,
                'resp_rate' => $request->resp_rate ?? $request->rr ?? 0,
                'temperature' => $request->temperature ?? $request->temp ?? 0,
                'is_awake' => ($request->consciousness_level === 'Alert'),
                'is_rousable' => ($request->consciousness_level === 'Drowsy'),
                'is_unconscious' => ($request->consciousness_level === 'Unconscious'),
            ]);
            
            // 2. Log Treatments
            if ($request->iv_fluids || $request->analgesia) {
                TheatrePostOpTreatment::create([
                    'theatre_booking_id' => $booking->id,
                    'nurse_user_id' => Auth::id(),
                    'iv_fluids' => $request->iv_fluids,
                    'analgesia' => $request->analgesia,
                    // 'notes' => $request->notes ?? null // Ensure column exists if uncommenting
                ]);
            }
        });

        return back()->with('success', 'Post-Op Data Recorded.');
    }

    public function discharge(Request $request, TheatreBooking $booking)
    {
        $request->validate(['discharge_to' => 'required']);

        DB::transaction(function () use ($request, $booking) {
            
            // Logic: If discharge_to is a number, it's likely a Ward ID. 
            // If it's text (Home/Mortuary), it's external.
            
            TheatrePostOpDischarge::create([
                'theatre_booking_id' => $booking->id,
                'nurse_user_id' => Auth::id(),
                'discharge_to' => $request->discharge_to, 
                'condition' => 'Stable',
               // 'instructions' => $request->instructions ?? null
            ]);

            // Mark as completed in Theatre
            $booking->update(['status' => 'Completed']);
            
            // TODO: If discharge_to is a Ward ID, you might want to auto-create an Admission Record here.
        });

        return redirect()->route('theatre3.index')->with('success', 'Patient discharged from recovery.');
    }
}