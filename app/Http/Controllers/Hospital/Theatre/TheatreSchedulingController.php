<?php

namespace App\Http\Controllers\Hospital\Theatre;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Theatre\TheatreBooking;
use App\Models\Theatre\TheatreProcedure;
use App\Models\User;

class TheatreSchedulingController extends Controller
{
    public function index()
    {
        $bookings = TheatreBooking::with(['patient', 'procedure', 'doctor'])
            ->where('status', 'Scheduled')
            ->orderBy('scheduled_at')
            ->paginate(15);

        return Inertia::render('Hospital/Theatre/Scheduling/Index', [
            'bookings' => $bookings
        ]);
    }

    public function create()
    {
        return Inertia::render('Hospital/Theatre/Scheduling/Create', [
            'procedures' => TheatreProcedure::whereHas('group', fn($q) => $q->where('is_major', true))->get(),
            'doctors' => User::where('usergroup_id', 4)->get(), // Assuming Group 4 is Doctors
            'anesthetists' => User::where('usergroup_id', 5)->get(), // Assuming Group 5
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_code' => 'required|exists:patients,code',
            'procedure_id' => 'required',
            'doctor_id' => 'required',
            'anesthetist_id' => 'nullable',
            'room' => 'required',
            'scheduled_at' => 'required|date'
        ]);

        TheatreBooking::create([
            'patientcode' => $validated['patient_code'],
            'theatre_procedure_id' => $validated['procedure_id'],
            'doctor_user_id' => $validated['doctor_id'],
            'anesthetist_user_id' => $validated['anesthetist_id'],
            'theatre_room' => $validated['room'],
            'scheduled_at' => $validated['scheduled_at'],
            'status' => 'Scheduled'
        ]);

        return redirect()->route('theatre.scheduling.index')->with('success', 'Surgery Scheduled.');
    }

    public function cancel(TheatreBooking $booking)
    {
        $booking->update(['status' => 'Cancelled']);
        return back()->with('success', 'Booking Cancelled.');
    }
}