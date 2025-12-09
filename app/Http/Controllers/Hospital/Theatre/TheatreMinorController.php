<?php

namespace App\Http\Controllers\Hospital\Theatre;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// Models
use App\Models\Theatre\TheatreBooking;
use App\Models\Theatre\TheatreProcedure;
use App\Models\Patient\Patient;

class TheatreMinorController extends Controller
{
    public function index(Request $request)
    {
        $query = TheatreBooking::with(['patient', 'procedure'])
            ->whereHas('procedure.group', function ($q) {
                $q->where('is_minor', true);
            })
            ->whereDate('scheduled_at', today())
            ->orderBy('scheduled_at');

        return Inertia::render('Hospital/Theatre/Minor/Index', [
            'bookings' => $query->paginate(15),
        ]);
    }

    public function create()
    {
        return Inertia::render('Hospital/Theatre/Minor/Create', [
            'procedures' => TheatreProcedure::whereHas('group', fn($q) => $q->where('is_minor', true))->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'patient_code' => 'required|exists:patients,code',
            'procedure_id' => 'required|exists:theatre_procedures,id',
            'scheduled_at' => 'required|date',
            'remarks' => 'nullable|string'
        ]);

        TheatreBooking::create([
            'patientcode' => $request->patient_code,
            'theatre_procedure_id' => $request->procedure_id,
            'scheduled_at' => $request->scheduled_at,
            'status' => 'Scheduled',
            'doctor_user_id' => Auth::id(), // Assigning current user as surgeon/doctor
            'remarks' => $request->remarks
        ]);

        return redirect()->route('theatre.minor.index')->with('success', 'Minor procedure booked.');
    }

    public function complete(TheatreBooking $booking)
    {
        $booking->update([
            'status' => 'Completed',
            'ended_at' => now()
        ]);
        return back()->with('success', 'Procedure marked completed.');
    }
}