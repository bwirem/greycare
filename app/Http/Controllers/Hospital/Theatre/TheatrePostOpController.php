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

class TheatrePostOpController extends Controller
{
    public function index(Request $request)
    {
        // 1. Start Query
        $query = TheatreBooking::with(['patient', 'procedure', 'theatre'])
            ->where('status', 'Recovery');

        // 2. Handle Search (Matches your frontend filter)
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
        $records = $query->orderBy('updated_at', 'desc') // Show newest arrivals first
            ->paginate(15)
            ->withQueryString();

        // 4. Return with 'records' key (Fixes the error)
        return Inertia::render('Hospital/Theatre/PostOp/Index', [
            'records' => $records, 
            'filters' => $request->only(['search'])
        ]);
    }

    public function create(TheatreBooking $booking)
    {
        return Inertia::render('Hospital/Theatre/PostOp/Care', [
            'booking' => $booking->load('patient', 'procedure')
        ]);
    }

    public function store(Request $request, TheatreBooking $booking)
    {
        // Validate inputs
        $request->validate([
            'bp' => 'required|string', 
            'spo2' => 'required|numeric',
        ]);

        DB::transaction(function () use ($request, $booking) {
            
            TheatrePostOpArrival::create([
                'theatre_booking_id' => $booking->id,
                'nurse_user_id' => Auth::id(),
                
                // Mappings with Fallback to 0 (Fixes the crash)
                'bp' => $request->bp,
                'spo2' => $request->spo2,
                'heart_rate' => $request->heart_rate ?? $request->hr ?? 0,
                'resp_rate' => $request->resp_rate ?? $request->rr ?? 0,     // <--- FIX
                'temperature' => $request->temperature ?? $request->temp ?? 0, // <--- FIX
                
                // Logic for booleans (defaults to false if input missing)
                'is_awake' => ($request->consciousness_level === 'Alert'),
                'is_rousable' => ($request->consciousness_level === 'Drowsy'),
                'is_unconscious' => ($request->consciousness_level === 'Unconscious'),
            ]);
            
            // Treatments...
            if ($request->iv_fluids || $request->analgesia) {
                TheatrePostOpTreatment::create([
                    'theatre_booking_id' => $booking->id,
                    'nurse_user_id' => Auth::id(),
                    'iv_fluids' => $request->iv_fluids,
                    'analgesia' => $request->analgesia,
                    //'notes' => $request->notes ?? null
                ]);
            }
        });

        return back()->with('success', 'Post-Op Data Recorded.');
    }

    public function discharge(Request $request, TheatreBooking $booking)
    {
        $request->validate(['discharge_to' => 'required']);

        DB::transaction(function () use ($request, $booking) {
            TheatrePostOpDischarge::create([
                'theatre_booking_id' => $booking->id,
                'nurse_user_id' => Auth::id(),
                'discharge_to' => $request->discharge_to,
                'condition' => 'Stable',
                'instructions' => $request->instructions ?? null
            ]);

            $booking->update(['status' => 'Completed']);
        });

        return redirect()->route('theatre.postop.index')->with('success', 'Patient discharged from recovery.');
    }
}