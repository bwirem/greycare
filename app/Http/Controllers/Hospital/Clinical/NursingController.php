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
    public function index()
    {
        // Fetch bookings pending or sent (so they can be edited)
        $bookings = OpdBooking::with(['patient', 'treatmentPoint', 'user'])
            ->whereDate('created_at', now()) 
            ->whereIn('vitalsignstatus', ['Pending', 'Sent']) 
            ->orderBy('created_at', 'asc')
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
                'time_in'      => $booking->created_at->diffForHumans(),
                'status'       => $booking->vitalsignstatus, // Pass status to frontend
            ];
        });

        return Inertia::render('Hospital/Nursing/Vitals/Index', [
            'queue' => $queue
        ]);
    }

    public function create($id)
    {
        $booking = OpdBooking::with('patient')->findOrFail($id);
        
        // Check if vitals already exist for this booking
        $existingVitals = MrVitalSign::where('opd_booking_id', $id)->first();

        return Inertia::render('Hospital/Nursing/Vitals/Create', [
            'booking' => [
                'id' => $booking->id,
                'visit_number' => $booking->visit_number,
                'patient_name' => $booking->patient->first_name . ' ' . $booking->patient->last_name,
                'file_number'  => $booking->patient->code,
                'age'          => Carbon::parse($booking->patient->date_of_birth)->age,
                'gender'       => $booking->patient->gender,
            ],
            // Pass existing vitals (or null)
            'existingVitals' => $existingVitals 
        ]);
    }

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

        // Combine BP
        $bpString = null;
        if ($request->filled('systolic') && $request->filled('diastolic')) {
            $bpString = $request->systolic . '/' . $request->diastolic;
        }

        DB::transaction(function () use ($validated, $booking, $bpString) {
            
            // 1. Update or Create Vital Sign Record
            MrVitalSign::updateOrCreate(
                ['opd_booking_id' => $booking->id], // Search criteria
                [
                    'patientcode'      => $booking->patientcode ?? $booking->patient->code, // Ensure patientcode exists
                    'user_id'          => auth()->id(),
                    'vitaldatetime'    => now(),
                    'weight'           => $validated['weight'] ?? 0,
                    'height'           => $validated['height'] ?? 0,
                    'temperature'      => $validated['temperature'] ?? 0,
                    'pulse'            => $validated['pulse'] ?? 0,
                    'respirationrate'  => $validated['respirationrate'] ?? 0,
                    'blood_pressure'   => $bpString,
                    'oxygensaturation' => $validated['oxygensaturation'] ?? 0,
                    'muac'             => $validated['muac'] ?? 0,
                    'bmi'              => $validated['bmi'] ?? 0,
                ]
            );

            // 2. Ensure Workflow Status is 'Sent'
            if ($booking->vitalsignstatus !== 'Sent') {
                $booking->update(['vitalsignstatus' => 'Sent']);
            }
        });

        return redirect()->route('nursing0.index')->with('success', 'Vitals saved successfully.');
    }
}