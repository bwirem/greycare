<?php

namespace App\Http\Controllers\Physiotherapy;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

// Models
use App\Models\Physiotherapy\PhySession;
use App\Models\Physiotherapy\PhyTreatmentType;
use App\Models\Physiotherapy\PhySessionItem;
use App\Models\Patient\Patient;
use App\Models\Opd\OpdBooking;

class PhysiotherapyController extends Controller
{
    public function index(Request $request)
    {
        $query = PhySession::query()
            ->with(['patient:code,first_name,last_name', 'treatments.type']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('patient', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        return Inertia::render('Hospital/Physiotherapy/Sessions/Index', [
            'sessions' => $query->latest('session_start')->paginate(10)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Hospital/Physiotherapy/Sessions/Create', [
            'treatmentTypes' => PhyTreatmentType::where('is_active', true)->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_code' => 'required|exists:patients,code',
            'session_start' => 'required|date',
            'aims_of_therapy' => 'nullable|string',
            'treatments' => 'array', // Array of treatment IDs selected
            'treatments.*' => 'exists:phy_treatment_types,id'
        ]);

        // Link to Booking
        $booking = OpdBooking::where('patientcode', $request->patient_code)
            ->whereDate('created_at', Carbon::today())
            ->latest()
            ->first();

        $session = PhySession::create([
            'patient_code' => $request->patient_code,
            'opd_booking_id' => $booking ? $booking->id : null, // Handle null gracefully or enforce
            'session_start' => $request->session_start,
            'aims_of_therapy' => $request->aims_of_therapy,
            'created_by' => Auth::id(),
        ]);

        // Save Treatments (Pivot)
        if ($request->has('treatments')) {
            foreach ($request->treatments as $typeId) {
                PhySessionItem::create([
                    'phy_session_id' => $session->id,
                    'treatment_type_id' => $typeId
                ]);
            }
        }

        return redirect()->route('physiotherapy0.index')->with('success', 'Session started.');
    }

    public function edit($id)
    {
        $session = PhySession::with(['patient', 'treatments'])->findOrFail($id);
        
        return Inertia::render('Hospital/Physiotherapy/Sessions/Edit', [
            'session' => $session,
            'treatmentTypes' => PhyTreatmentType::where('is_active', true)->get()
        ]);
    }

    public function update(Request $request, $id)
    {
        $session = PhySession::findOrFail($id);

        $validated = $request->validate([
            'therapist_feedback' => 'nullable|string',
            'session_end' => 'nullable|date',
            // Add other fields updates here
        ]);

        $session->update($validated);

        // Update items logic would go here if you allow changing treatments mid-session

        return redirect()->route('physiotherapy0.index')->with('success', 'Session updated.');
    }

    public function searchPatient(Request $request)
    {
        $search = $request->query('query');
        return Patient::where('first_name', 'like', "%{$search}%")
            ->orWhere('last_name', 'like', "%{$search}%")
            ->orWhere('code', 'like', "%{$search}%")
            ->limit(10)
            ->get(['code', 'first_name', 'last_name']);
    }
}