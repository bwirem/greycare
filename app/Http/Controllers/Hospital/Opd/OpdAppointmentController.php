<?php

namespace App\Http\Controllers\Hospital\Opd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

// Models
use App\Models\Opd\Appointment;
use App\Models\Opd\OpdBooking;
use App\Models\Opd\OpdTreatmentPoint;
use App\Models\User;
use App\Models\Patient\PatientBillingGroup;

class OpdAppointmentController extends Controller
{
    /**
     * Display the Calendar.
     */
    public function index()
    {
        // Fetch Appointments
        $appointments = Appointment::with(['patient', 'doctor', 'clinic'])
            ->whereDate('appointment_date', '>=', now()->subMonths(1)) 
            ->get()
            ->map(function ($apt) {
                return [
                    'id'        => $apt->id,
                    'title'     => $apt->patient 
                                    ? $apt->patient->firstname . ' ' . $apt->patient->surname 
                                    : 'Unknown Patient',
                    'start'     => Carbon::parse($apt->appointment_date->format('Y-m-d') . ' ' . $apt->start_time),
                    'end'       => Carbon::parse($apt->appointment_date->format('Y-m-d') . ' ' . ($apt->end_time ?? '23:59')),
                    'status'    => $apt->status,
                    'doctor'    => $apt->doctor?->name,
                    'clinic'    => $apt->clinic?->name,
                    'resource'  => $apt, 
                ];
            });

        return Inertia::render('Hospital/Opd/Appointments/Index', [
            'events' => $appointments,
            'clinics' => OpdTreatmentPoint::select('id', 'name')->get(),
            'doctors' => User::select('id', 'name')->get(), 
        ]);
    }

    /**
     * Store a new Appointment.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_code' => 'required|exists:patients,code',
            'doctor_user_id' => 'nullable|exists:users,id',
            'clinic_id' => 'required|exists:opd_treatmentpoints,id',
            'appointment_date' => 'required|date',
            'start_time' => 'required',
            'reason' => 'nullable|string|max:255',
        ]);

        Appointment::create([
            'patientcode' => $validated['patient_code'],
            'doctor_user_id' => $validated['doctor_user_id'],
            'clinic_id' => $validated['clinic_id'],
            'appointment_date' => $validated['appointment_date'],
            'start_time' => $validated['start_time'],
            'status' => 'Pending',
            'created_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Appointment scheduled.');
    }

    /**
     * Check-In: Convert Appointment to OPD Booking (Visit).
     */
    public function checkIn(Request $request, $id)
    {
        $appointment = Appointment::with(['patient', 'doctor', 'clinic'])->findOrFail($id);

        if ($appointment->status === 'Completed') {
            return back()->withErrors(['error' => 'Patient already checked in.']);
        }

        // Default Billing (Cash) - ideally ask user, but defaulting for now
        $defaultBilling = PatientBillingGroup::where('name', 'Cash')->first()?->id ?? 1;

        DB::transaction(function () use ($appointment, $defaultBilling) {
            
            // 1. Create the Visit
            $booking = OpdBooking::create([
                'bookdate'           => now(),
                'patientcode'        => $appointment->patientcode,
                'treatmentpoint_id'  => $appointment->clinic_id,
                'billinggroup_id'    => $defaultBilling,
                'doctor_user_id'     => $appointment->doctor_user_id,
                
                // Snapshots
                'DoctorName'         => $appointment->doctor?->name, 
                'wheretaken'         => $appointment->clinic?->name, 
                
                'vitalsignstatus'    => 'Pending', // Send to Triage
                'user_id'            => auth()->id(),
            ]);

            // 2. Update Appointment
            $appointment->update([
                'status' => 'Completed',
                'opd_booking_id' => $booking->id,
            ]);
        });

        // Redirect to Registrations list to see the new active visit
        return redirect()->route('outpatient0.index')
            ->with('success', 'Check-In Successful. Patient sent to Triage.');
    }
}