<?php

namespace App\Http\Controllers\Rch;

use App\Http\Controllers\Controller;
use App\Models\Rch\RchChildAssessment;
use App\Models\Patient\Patient;
use App\Models\Opd\OpdBooking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class RchChildHealthController extends Controller
{
    /**
     * Display Growth Monitoring Register.
     */
    public function index(Request $request)
    {
        $query = RchChildAssessment::query()
            ->with(['patient:code,first_name,last_name,date_of_birth', 'vitals']) // Eager load vitals to show actual weight
            ->latest('created_at');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('patient', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        return Inertia::render('Hospital/Rch/ChildHealth/Index', [
            'assessments' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Show form to add a new assessment.
     */
    public function create()
    {
        return Inertia::render('Hospital/Rch/ChildHealth/Create');
    }

    /**
     * Store the assessment.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_code' => 'required|exists:patients,code',
            'age_months' => 'required|integer|min:0',
            'weight_for_age_status' => 'required|string|in:Green,Grey,Red',
            'height_for_age_status' => 'nullable|string',
            'feeding_practice' => 'nullable|string',
            'development_milestones' => 'nullable|string',
            'vitamin_a_given' => 'boolean',
            'deworming_given' => 'boolean',
        ]);

        // Link to today's booking
        $booking = OpdBooking::where('patientcode', $request->patient_code)
            ->whereDate('created_at', Carbon::today())
            ->latest()
            ->first();

        // Note: The actual weight/height should have been entered in Vitals (Nursing Station).
        // If no booking exists, we permit entry but link will be null (or force creation depending on policy).
        
        $validated['opd_booking_id'] = $booking ? $booking->id : null;
        $validated['created_by'] = Auth::id();

        RchChildAssessment::create($validated);

        return redirect()->route('rch3.index')->with('success', 'Growth record saved successfully.');
    }

    /**
     * Edit assessment.
     */
    public function edit($id)
    {
        $assessment = RchChildAssessment::with('patient')->findOrFail($id);

        return Inertia::render('Hospital/Rch/ChildHealth/Edit', [
            'assessment' => $assessment
        ]);
    }

    /**
     * Update assessment.
     */
    public function update(Request $request, $id)
    {
        $assessment = RchChildAssessment::findOrFail($id);

        $validated = $request->validate([
            'age_months' => 'required|integer',
            'weight_for_age_status' => 'required|string',
            'feeding_practice' => 'nullable|string',
            'development_milestones' => 'nullable|string',
            'vitamin_a_given' => 'boolean',
            'deworming_given' => 'boolean',
        ]);

        $assessment->update($validated);

        return redirect()->route('rch3.index')->with('success', 'Growth record updated.');
    }

    /**
     * Display a simple Growth Chart / History for a specific child.
     */
    public function viewChart($patientCode)
    {
        $patient = Patient::where('code', $patientCode)->firstOrFail();
        
        // Get all assessments ordered by age
        $history = RchChildAssessment::with('vitals')
            ->where('patient_code', $patientCode)
            ->orderBy('age_months', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'age' => $item->age_months,
                    'weight' => $item->vitals ? $item->vitals->weight : 0, // From MrVitalSigns
                    'status' => $item->weight_for_age_status,
                    'date' => $item->created_at->format('Y-m-d')
                ];
            });

        return Inertia::render('Hospital/Rch/ChildHealth/Chart', [
            'patient' => $patient,
            'history' => $history
        ]);
    }
}