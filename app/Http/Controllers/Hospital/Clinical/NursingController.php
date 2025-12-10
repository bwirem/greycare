<?php

namespace App\Http\Controllers\Hospital\Clinical;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

// Models
use App\Models\Opd\OpdBooking;
use App\Models\MedicalRecord\MrVitalSign;

class NursingController extends Controller
{
    /**
     * Display the Nursing Queue (Patients waiting for vitals).
     */
    public function index()
    {
        // Fetch only bookings pending vitals
        $bookings = OpdBooking::with(['patient', 'treatmentPoint', 'user'])
            ->whereDate('created_at', now()) // Today only
            ->where('vitalsignstatus', 'Pending') // Only waiting patients
            ->orderBy('created_at', 'asc') // FIFO (First In First Out)
            ->get();

        $queue = $bookings->map(function ($booking) {
            return [
                'id'           => $booking->id,
                'visit_number' => $booking->visit_number,
                'file_number'  => $booking->patient?->code ?? 'N/A',
                'patient_name' => $booking->patient 
                                    ? $booking->patient->first_name . ' ' . $booking->patient->last_name 
                                    : 'Unknown',
                'age'          => $booking->patient?->date_of_birth 
                                    ? Carbon::parse($booking->patient->date_of_birth)->age 
                                    : 0,
                'gender'       => $booking->patient?->gender ?? '-',
                'clinic'       => $booking->treatmentPoint?->name ?? 'General',
                'doctor'       => $booking->DoctorName ?? 'Unassigned',
                'time_in'      => $booking->created_at->diffForHumans(), // e.g. "10 mins ago"
            ];
        });

        return Inertia::render('Hospital/Nursing/Vitals/Index', [
            'queue' => $queue
        ]);
    }

    /**
     * Show the Vitals Entry Form.
     */
    public function create($id)
    {
        $booking = OpdBooking::with('patient')->findOrFail($id);

        return Inertia::render('Hospital/Nursing/Vitals/Create', [
            'booking' => [
                'id' => $booking->id,
                'visit_number' => $booking->visit_number,
                'patient_name' => $booking->patient->first_name . ' ' . $booking->patient->last_name,
                'file_number'  => $booking->patient->code,
                'age'          => Carbon::parse($booking->patient->date_of_birth)->age,
                'gender'       => $booking->patient->gender,
            ]
        ]);
    }

    /**
     * Store Vitals and Update Workflow Status.
     */
    public function store(Request $request, $id)
    {
        $booking = OpdBooking::findOrFail($id);

        $validated = $request->validate([
            'weight'            => 'nullable|numeric|min:0|max:500',
            'height'            => 'nullable|numeric|min:0|max:300',
            'temperature'       => 'nullable|numeric|min:30|max:45',
            'pulse'             => 'nullable|numeric|min:0',
            'respirationrate'   => 'nullable|numeric|min:0',
            'systolic'          => 'nullable|numeric',
            'diastolic'         => 'nullable|numeric',
            'oxygensaturation'  => 'nullable|numeric|min:0|max:100',
            'muac'              => 'nullable|numeric',
            'bmi'               => 'nullable|numeric',
        ]);

        // Combine BP (e.g., 120/80)
        $bpString = null;
        if ($request->filled('systolic') && $request->filled('diastolic')) {
            $bpString = $request->systolic . '/' . $request->diastolic;
        }

        DB::transaction(function () use ($validated, $booking, $bpString) {
            
            // 1. Create Vital Sign Record
            MrVitalSign::create([
                'opd_booking_id'   => $booking->id,
                'patientcode'      => $booking->patientcode,
                'user_id'          => auth()->id(),
                'vitaldatetime'    => now(),
                
                // Fields
                'weight'           => $validated['weight'] ?? 0,
                'height'           => $validated['height'] ?? 0,
                'temperature'      => $validated['temperature'] ?? 0,
                'pulse'            => $validated['pulse'] ?? 0,
                'respirationrate'  => $validated['respirationrate'] ?? 0,
                'blood_pressure'    => $bpString,
                'oxygensaturation' => $validated['oxygensaturation'] ?? 0,
                'muac'             => $validated['muac'] ?? 0,
                'bmi'              => $validated['bmi'] ?? 0,
            ]);

            // 2. Update Workflow Status -> Send to Doctor
            $booking->update([
                'vitalsignstatus' => 'Closed' // This removes it from the queue
            ]);
        });

        return redirect()->route('nursing0.index')->with('success', 'Vitals recorded. Patient sent to Doctor.');
    }
}