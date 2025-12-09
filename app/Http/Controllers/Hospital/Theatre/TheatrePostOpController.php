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
    public function index()
    {
        // Patients in Recovery Status
        $bookings = TheatreBooking::with(['patient', 'procedure'])
            ->where('status', 'Recovery')
            ->paginate(15);

        return Inertia::render('Hospital/Theatre/PostOp/Index', [
            'bookings' => $bookings
        ]);
    }

    public function create(TheatreBooking $booking)
    {
        return Inertia::render('Hospital/Theatre/PostOp/Care', [
            'booking' => $booking->load('patient')
        ]);
    }

    public function store(Request $request, TheatreBooking $booking)
    {
        // Validate huge form
        $request->validate(['bp' => 'required', 'spo2' => 'required|numeric']);

        DB::transaction(function () use ($request, $booking) {
            // Log Arrival Vitals
            TheatrePostOpArrival::create(array_merge($request->all(), [
                'theatre_booking_id' => $booking->id,
                'nurse_user_id' => Auth::id()
            ]));
            
            // Log Treatments (Simplified)
            TheatrePostOpTreatment::create([
                'theatre_booking_id' => $booking->id,
                'nurse_user_id' => Auth::id(),
                'iv_fluids' => $request->iv_fluids,
                'analgesia' => $request->analgesia
            ]);
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
                'condition' => 'Stable'
            ]);

            $booking->update(['status' => 'Completed']);
        });

        return redirect()->route('theatre.postop.index')->with('success', 'Patient discharged from recovery.');
    }
}