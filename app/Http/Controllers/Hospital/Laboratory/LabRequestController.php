<?php

namespace App\Http\Controllers\Hospital\Laboratory;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

use Carbon\Carbon; // <--- Import this

// Models
use App\Models\Laboratory\LabPrescription;
use App\Models\Laboratory\LabSample;
use App\Models\Laboratory\LabNatureOfSample;
use App\Models\Laboratory\LabRejectionReason;
use App\Models\Laboratory\LabSampleRejectionLog;

class LabRequestController extends Controller
{
    /**
     * List Pending Requests
     */   
    public function index(Request $request)
    {
        $query = LabPrescription::with(['patient', 'requestedBy', 'panel', 'visit.billingGroup'])
            ->whereIn('status', ['Requested', 'sample_rejected']) 
            ->orderBy('created_at', 'asc');

        if ($request->search) {
            $query->whereHas('patient', function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                ->orWhere('code', 'like', "%{$request->search}%");
            });
        }

        // --- DATE FILTER LOGIC ---
        // 1. Get Date: Use provided date OR default to Today if parameter is strictly missing
        //    (If user explicitly clears the date, it sends "" which is not null, so it shows all)
        $filterDate = $request->input('date', Carbon::now()->format('Y-m-d'));

        // 2. Apply Filter if a date exists
        if ($filterDate) {
            $query->whereBetween('created_at', [
                Carbon::parse($filterDate)->startOfDay(), 
                Carbon::parse($filterDate)->endOfDay()
            ]);
        }

        return Inertia::render('Hospital/Laboratory/Requests/Index', [
            'requests' => $query->paginate(20)->withQueryString(),
            // 3. Return the calculated date to the Frontend so the Input shows "Today"
            'filters' => array_merge($request->only(['search']), ['date' => $filterDate])
        ]);
    }
    /**
     * Show Sample Collection Form
     */
    public function create(LabPrescription $prescription)
    {
        // // --- SECURITY CHECK: Prevent access if unpaid ---
        // if ($prescription->payment_status === 'unpaid') {
        //     return redirect()->route('laboratory0.index')
        //         ->with('error', 'Cannot collect sample. The request has not been paid for.');
        // }
        // ------------------------------------------------

        $prescription->load(['patient', 'panel.defaultSample']);

        return Inertia::render('Hospital/Laboratory/Requests/Collect', [
            'request' => $prescription,
            'patient' => $prescription->patient,
            'panel' => $prescription->panel,
            'sample_types' => LabNatureOfSample::orderBy('name')->get(),
            'rejection_reasons' => LabRejectionReason::orderBy('name')->get()
        ]);
    }

    /**
     * Store Sample Collection Data
     */
       
    public function store(Request $request, LabPrescription $prescription)
    {
    //    // --- DOUBLE CHECK: Prevent processing if unpaid ---
    //     if ($prescription->payment_status === 'unpaid') {
    //         return back()->withErrors(['error' => 'Payment required before collection.']);
    //     }

        $request->validate([
            'lab_nature_of_sample_id' => 'required|exists:lab_nature_of_samples,id',
            'collection_date' => 'required|date',
            'notes' => 'nullable|string'
        ]);

        DB::transaction(function () use ($request, $prescription) {

            $cleanDate = date('ymd'); // 250112
            $uniqueId  = str_pad($prescription->id, 4, '0', STR_PAD_LEFT); 
            $barcode   = $cleanDate . $uniqueId; // Result: 2501120055

            
            // 1. Create a NEW Sample Record (This keeps history of the old rejected one)
            LabSample::create([
                'lab_prescription_id' => $prescription->id,
                'lab_nature_of_sample_id' => $request->lab_nature_of_sample_id,
                'collected_by' => Auth::id(),
                'collected_at' => $request->collection_date,
                // Generate a new unique ID (e.g. append timestamp) to differentiate from the rejected one
                'sample_code' => $barcode, //'SMP-' . date('YmdHis') . '-' . $prescription->id, 
                'notes' => $request->notes,
                'status' => 'collected'
            ]);

            // 2. Reset Prescription Status
            // This moves it OUT of the Collection Queue and INTO the Results Queue
            $prescription->update(['status' => 'collected']);
        });

        return redirect()->route('laboratory0.index')
            ->with('success', 'New sample collected successfully.');
    }


    /**
     * Reject a Lab Request
     */
    public function reject(Request $request, LabPrescription $prescription)
    {
        $request->validate(['reason_id' => 'required|exists:lab_rejection_reasons,id']);

        DB::transaction(function () use ($request, $prescription) {
            
            // 1. Create Log Entry linked to the Prescription
            LabSampleRejectionLog::create([
                'lab_prescription_id'     => $prescription->id, // <--- Correct ID now
                'lab_rejection_reason_id' => $request->reason_id,
                'rejected_by'             => Auth::id(),
                // 'remarks'              => $request->remarks, // Add this if you have remarks in frontend
            ]);

            // 2. Update Status Only
            $prescription->update([
                'status' => 'rejected'
            ]);
        });

        return redirect()->back()->with('success', 'Request rejected.');
    }
}