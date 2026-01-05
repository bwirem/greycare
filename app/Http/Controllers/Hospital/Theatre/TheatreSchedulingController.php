<?php

namespace App\Http\Controllers\Hospital\Theatre;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Theatre\TheatreBooking;
use App\Models\Theatre\TheatreProcedure;
use App\Models\Theatre\Theatre;
use App\Models\User;
use Carbon\Carbon; // Import Carbon for date comparison

class TheatreSchedulingController extends Controller
{
    public function index()
    {
        $bookings = TheatreBooking::with(['patient', 'procedure', 'doctor', 'theatre'])
            ->where('status', 'Scheduled')
            ->orderBy('scheduled_at', 'asc')
            ->paginate(15);

        return Inertia::render('Hospital/Theatre/Scheduling/Index', [
            'bookings' => $bookings
        ]);
    }

    public function create()
    {
        return Inertia::render('Hospital/Theatre/Scheduling/Create', [
            // Pass server time for default date
            'default_date' => now()->format('Y-m-d\TH:i'),
            
            'procedures' => TheatreProcedure::with('group:id,name,is_major')
                                ->select('id', 'name', 'theatre_procedure_group_id')
                                ->orderBy('name')
                                ->get(),
            
            'theatres'   => Theatre::where('is_active', true)
                                ->select('id', 'name', 'type')
                                ->orderBy('name')
                                ->get(),

            'doctors'    => User::select('id', 'name')->whereNotNull('specialization_id')->get(),
            'anesthetists' => User::select('id', 'name')->whereNotNull('specialization_id')->get(), 
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_code'   => 'required|exists:patients,code',
            'procedure_id'   => 'required|exists:theatre_procedures,id',
            'doctor_id'      => 'required|exists:users,id',
            'anesthetist_id' => 'nullable|exists:users,id',
            'theatre_id'     => 'required|exists:theatres,id',
            'scheduled_at'   => 'required|date',
            'send_to_theatre'=> 'boolean'
        ]);

        // 1. Determine Status
        $status = $request->boolean('send_to_theatre') ? 'In Progress' : 'Scheduled';
        $startedAt = $status === 'In Progress' ? now() : null;
        
        // 2. Handle Date Logic
        // Parse the input date
        $scheduledAt = Carbon::parse($validated['scheduled_at']);

        // IF sending to theatre AND the date is in the past -> Update to NOW
        if ($status === 'In Progress' && $scheduledAt->isPast()) {
            $scheduledAt = now();
        }

        TheatreBooking::create([
            'patientcode'          => $validated['patient_code'],
            'theatre_procedure_id' => $validated['procedure_id'],
            'doctor_user_id'       => $validated['doctor_id'],
            'anesthetist_user_id'  => $validated['anesthetist_id'],
            'theatre_id'           => $validated['theatre_id'],
            'scheduled_at'         => $scheduledAt, // Use calculated date
            'status'               => $status,
            'started_at'           => $startedAt,
            'booked_by'            => Auth::id()
        ]);

        $msg = $status === 'In Progress' 
            ? 'Surgery started immediately. Patient moved to Intra-operative list.' 
            : 'Surgery Scheduled Successfully.';

        return redirect()->route('theatre1.index')->with('success', $msg);
    }

    public function edit(TheatreBooking $booking)
    {
        $booking->load('patient');
        
        // Format for HTML input
        $booking->scheduled_at_formatted = $booking->scheduled_at->format('Y-m-d\TH:i');

        return Inertia::render('Hospital/Theatre/Scheduling/Create', [
            'default_date' => now()->format('Y-m-d\TH:i'),
            'procedures' => TheatreProcedure::with('group:id,name,is_major')->get(),
            'theatres'   => Theatre::where('is_active', true)->get(),
            'doctors'    => User::select('id', 'name')->whereNotNull('specialization_id')->get(), 
            'anesthetists' => User::select('id', 'name')->whereNotNull('specialization_id')->get(), 
            'booking' => $booking 
        ]);
    }

    public function update(Request $request, TheatreBooking $booking)
    {
        $validated = $request->validate([
            'patient_code'   => 'required|exists:patients,code',
            'procedure_id'   => 'required|exists:theatre_procedures,id',
            'doctor_id'      => 'required|exists:users,id',
            'anesthetist_id' => 'nullable|exists:users,id',
            'theatre_id'     => 'required|exists:theatres,id',
            'scheduled_at'   => 'required|date',
            'send_to_theatre'=> 'boolean'
        ]);

        $status = $booking->status;
        $startedAt = $booking->started_at;
        
        // Parse input date
        $scheduledAt = Carbon::parse($validated['scheduled_at']);

        // Check if user clicked "Send to Theatre"
        if ($request->boolean('send_to_theatre')) {
            $status = 'In Progress';
            
            // Set Start Time if not set
            if (!$startedAt) {
                $startedAt = now();
            }

            // DATE LOGIC: If sending to theatre & date is past -> Update to NOW
            if ($scheduledAt->isPast()) {
                $scheduledAt = now();
            }
        }

        $booking->update([
            'patientcode'          => $validated['patient_code'],
            'theatre_procedure_id' => $validated['procedure_id'],
            'doctor_user_id'       => $validated['doctor_id'],
            'anesthetist_user_id'  => $validated['anesthetist_id'],
            'theatre_id'           => $validated['theatre_id'],
            'scheduled_at'         => $scheduledAt, // Update date
            'status'               => $status,
            'started_at'           => $startedAt
        ]);

        $msg = $status === 'In Progress' 
            ? 'Patient moved to Theatre (Intra-operative).' 
            : 'Surgery Rescheduled Successfully.';

        return redirect()->route('theatre1.index')->with('success', $msg);
    }

    public function cancel(TheatreBooking $booking)
    {
        $booking->update(['status' => 'Cancelled']);
        return back()->with('success', 'Booking Cancelled.');
    }
}