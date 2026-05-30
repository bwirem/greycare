<?php

namespace App\Http\Controllers\SpecializeClinic\Eye;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// Models
use App\Models\Theatre\TheatreBooking;
use App\Models\Theatre\TheatreProcedure;
use App\Models\Theatre\Theatre;
use App\Models\Patient\Patient;

class EyeExaminationController extends Controller
{
    public function index(Request $request)
    {
        // Start the query with relationships (Make sure to include 'theatre' so we can show it in the table)
        $query = TheatreBooking::with(['patient', 'procedure', 'theatre'])
            ->whereHas('procedure.group', function ($q) {
                $q->where('is_minor', true);
            })
            ->whereDate('scheduled_at', today());

        // --- APPLY SEARCH FILTER ---
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('patient', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%");
            });
        }

        // --- APPLY THEATRE FILTER ---
        if ($request->filled('theatre_id')) {
            $query->where('theatre_id', $request->input('theatre_id'));
        }

        $query->orderBy('scheduled_at');

        return Inertia::render('SpecializeClinic/Eye/Examination/Index', [
            // withQueryString() ensures pagination works even while filtered
            'bookings' => $query->paginate(15)->withQueryString(), 
            'theatres' => Theatre::where('is_active', true)->get(), 
            
            // Pass current filters back so React retains the values on page reload
            'filters'  => $request->only(['search', 'theatre_id']), 
        ]);
    }

    public function create()
    {
        return Inertia::render('SpecializeClinic/Eye/Examination/Create', [
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

        return redirect()->route('eye.examination.index')->with('success', 'Eye examination booked.');
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