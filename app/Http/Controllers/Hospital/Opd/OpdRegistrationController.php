<?php

namespace App\Http\Controllers\Hospital\Opd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

// Models
use App\Models\Patient\Patient;
use App\Models\Opd\OpdBooking;
use App\Models\Opd\OpdTreatmentPoint;
use App\Models\Patient\PatientBillingGroup;
use App\Models\MedicalRecord\MrVitalSign;
use App\Models\User;

class OpdRegistrationController extends Controller
{
    /**
     * Display a listing of OPD Registrations.
     */   
    public function index()
    {
        $bookings = OpdBooking::with(['patient', 'billingGroup', 'treatmentPoint', 'latestVitalSign'])
            ->whereDate('created_at', now()) 
            ->latest() 
            ->get();

        $registrations = $bookings->map(function ($booking) {
            return [
                'id'           => $booking->id,
                'visit_number' => $booking->visit_number,
                
                'file_number'  => $booking->patient?->code ?? 'N/A',
                'patient_name' => $booking->patient 
                                    ? $booking->patient->first_name . ' ' . $booking->patient->last_name 
                                    : 'Unknown',
                
                'age'          => $booking->patient?->date_of_birth 
                                    ? \Carbon\Carbon::parse($booking->patient->date_of_birth)->age 
                                    : 0,
                
                'gender'       => $booking->patient?->gender ?? '-',
                
                'payment_mode' => $booking->billingGroup?->name ?? 'Cash',
                
                // *** UPDATED HERE: Send separate fields ***
                'doctor_name'  => $booking->DoctorName ?? 'Unassigned',
                'clinic'       => $booking->treatmentPoint?->name ?? 'General OPD', 
                // ******************************************

                'status'       => $booking->vitalsignstatus === 'Closed' ? 'Triaged' : 'Waiting',
                'time'         => $booking->created_at->format('h:i A'),
            ];
        });

        return Inertia::render('Hospital/Opd/Registrations/Index', [
            'registrations' => $registrations,
        ]);
    }
    /**
     * Show the form for creating a new registration.
     */
    public function create()
    {
        return Inertia::render('Hospital/Opd/Registrations/Create', [
            'treatmentPoints' => OpdTreatmentPoint::select('id', 'name')->get(),
            'billingGroups'   => PatientBillingGroup::select('id', 'name')->get(),
            // Assuming you have a 'role' column or similar to filter doctors
            'doctors'         => User::select('id', 'name')->get(), 
        ]);
    }

    /**
     * AJAX Search for Patients
     */
    public function searchPatient(Request $request)
    {
        $query = $request->input('query');

        if (!$query || strlen($query) < 2) {
            return response()->json([]);
        }

        $patients = Patient::where('code', 'like', "%{$query}%")
            ->orWhere('first_name', 'like', "%{$query}%")
            ->orWhere('last_name', 'like', "%{$query}%")
            ->orWhere('national_id', 'like', "%{$query}%")
            // Assuming you have a phone column, otherwise remove this
            // ->orWhere('phone', 'like', "%{$query}%") 
            ->limit(10)
            ->get(['code', 'first_name', 'last_name', 'middle_name', 'gender', 'date_of_birth', 'national_id']);

        return response()->json($patients);
    }

    /**
     * Store a newly created registration (New OR Revisit).
     */
    public function store(Request $request)
    {
        // 1. Determine Validation Rules
        $isRevisit = $request->filled('existing_patient_code');

        $rules = [
            // Visit Info
            'treatmentpoint_id' => 'required|exists:opd_treatmentpoints,id',
            'doctor_user_id'    => 'nullable|exists:users,id', 
            'billinggroup_id'   => 'required|exists:patient_billing_groups,id',
            'schemeid'          => 'nullable|string|max:50',
            'weight'            => 'nullable|numeric',
            'temp'              => 'nullable|numeric',
        ];

        // Only validate patient details if it is a NEW patient
        if (!$isRevisit) {
            $rules = array_merge($rules, [
                'first_name'     => 'required|string|max:255',
                'last_name'       => 'required|string|max:255',
                'gender'        => 'required|string|in:Male,Female',
                'date_of_birth'     => 'required|date',
                'national_id'    => 'nullable|string|max:50|unique:patients,national_id',
            ]);
        }

        $validated = $request->validate($rules);

        try {
            DB::beginTransaction();

            // ---------------------------------------------------
            // 2. Handle Patient (Find or Create)
            // ---------------------------------------------------
            if ($isRevisit) {
                // REVISIT: Use existing code
                $patientCode = $request->existing_patient_code;
                
                // Optional: Update patient details if provided (e.g. phone number changed)
                // $patient = Patient::find($patientCode);
                // $patient->update([...]);
            } else {
                // NEW: Generate code and create
                $patientCode = 'PF-' . date('y') . '-' . strtoupper(Str::random(6)); 

                Patient::create([
                    'code'          => $patientCode,
                    'first_name'     => $validated['first_name'],
                    'last_name'       => $validated['last_name'],
                    'middle_name'    => $request->middle_name,
                    'gender'        => $validated['gender'],
                    'date_of_birth'     => $validated['date_of_birth'],
                    'national_id'    => $validated['national_id'],
                    'regdate'       => now(),
                ]);
            }

            // ---------------------------------------------------
            // 3. Prepare Snapshots
            // ---------------------------------------------------
            $clinicName = OpdTreatmentPoint::find($validated['treatmentpoint_id'])->name;
            
            $doctorName = null;
            if ($request->filled('doctor_user_id')) {
                $doctorName = User::find($request->doctor_user_id)?->name;
            }

            $hasVitals = !empty($validated['weight']) || !empty($validated['temp']);
            $vitalsStatus = $hasVitals ? 'Closed' : 'Pending';

            // ---------------------------------------------------
            // 4. Create OPD Booking
            // ---------------------------------------------------
            $booking = OpdBooking::create([
                'bookdate'           => now(),
                'patientcode'        => $patientCode, // Use the determined code
                'treatmentpoint_id'  => $validated['treatmentpoint_id'],
                'billinggroup_id'    => $validated['billinggroup_id'],
                'doctor_user_id'     => $validated['doctor_user_id'],
                'user_id'            => auth()->id(),
                'wheretaken'         => $clinicName,
                'DoctorName'         => $doctorName,
                'schemeid'           => $validated['schemeid'],
                'vitalsignstatus'    => $vitalsStatus,
            ]);

            // ---------------------------------------------------
            // 5. Create Vital Sign Record
            // ---------------------------------------------------
            if ($hasVitals) {
                MrVitalSign::create([
                    'opd_booking_id' => $booking->id,
                    'patientcode'    => $patientCode,
                    'user_id'        => auth()->id(),
                    'vitaldatetime'  => now(),
                    'weight'         => $validated['weight'] ?? 0,
                    'temperature'    => $validated['temp'] ?? 0,
                ]);
            }

            DB::commit();

            return redirect()->route('outpatient0.index')
                ->with('success', 'Registration Successful. File No: ' . $patientCode);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Registration failed: ' . $e->getMessage()]);
        }

        
    }

    // ... existing index, create, store methods ...

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        // Fetch booking with all details
        $booking = OpdBooking::with(['patient', 'billingGroup', 'treatmentPoint', 'user', 'latestVitalSign'])
            ->findOrFail($id);

        return Inertia::render('Hospital/Opd/Registrations/Show', [
            'booking' => $booking
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $booking = OpdBooking::with(['patient'])->findOrFail($id);

        return Inertia::render('Hospital/Opd/Registrations/Edit', [
            'booking' => $booking,
            // Re-use the dropdowns from Create
            'treatmentPoints' => OpdTreatmentPoint::select('id', 'name')->get(),
            'billingGroups'   => PatientBillingGroup::select('id', 'name')->get(),
            'doctors'         => User::select('id', 'name')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $booking = OpdBooking::findOrFail($id);
        $patient = Patient::where('code', $booking->patientcode)->first();

        // Validate
        $validated = $request->validate([
            // Allow basic patient edits
            'first_name'     => 'required|string|max:255',
            'last_name'       => 'required|string|max:255',
            'contact'       => 'nullable|string|max:50',
            
            // Allow booking edits
            'treatmentpoint_id' => 'required|exists:opd_treatmentpoints,id',
            'doctor_user_id'    => 'nullable|exists:users,id', 
            'billinggroup_id'   => 'required|exists:patient_billing_groups,id',
        ]);

        DB::transaction(function () use ($validated, $booking, $patient) {
            // 1. Update Patient
            $patient->update([
                'first_name' => $validated['first_name'],
                'last_name'   => $validated['last_name'],
                // Update contact if column exists
            ]);

            // 2. Prepare Doctor Snapshot
            $doctorName = $booking->DoctorName; // Default to old name
            if (isset($validated['doctor_user_id']) && $validated['doctor_user_id'] != $booking->doctor_user_id) {
                $doctorName = User::find($validated['doctor_user_id'])?->name;
            }

            // 3. Update Booking
            $booking->update([
                'treatmentpoint_id' => $validated['treatmentpoint_id'],
                'billinggroup_id'   => $validated['billinggroup_id'],
                'doctor_user_id'    => $validated['doctor_user_id'],
                'DoctorName'        => $doctorName,
                // Update snapshot of clinic location
                'wheretaken'        => OpdTreatmentPoint::find($validated['treatmentpoint_id'])->name,
            ]);
        });

        return redirect()->route('outpatient0.index')->with('success', 'Registration updated successfully.');
    }

    /**
     * Print the OPD Ticket/Slip.
     * This acts as the "Send to Triage" confirmation.
     */
    public function printSlip($id)
    {
        $booking = OpdBooking::with(['patient', 'treatmentPoint'])->findOrFail($id);
        
        // In a real app, generate a PDF using DomPDF or similar.
        // For now, we allow the browser to handle the print view or return a simple view.
        return view('prints.opd_slip', compact('booking'));
    }
}