<?php

namespace App\Http\Controllers\Hospital\Laboratory;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// Models
use App\Models\Laboratory\LabPrescription;
use App\Models\Laboratory\LabSample;
use App\Models\Laboratory\LabNatureOfSample;
use App\Models\Laboratory\LabRejectionReason;

class LabRequestController extends Controller
{
    /**
     * List Pending Requests (Ordered but no Sample Collected yet)
     */
    public function index(Request $request)
    {
        $query = LabPrescription::with(['patient', 'requestedBy', 'panel', 'visit'])
            ->where('status', 'ordered') // Status: ordered, collected, processing, completed
            ->orderBy('created_at', 'asc');

        if ($request->search) {
            $query->whereHas('patient', function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%");
            });
        }

        return Inertia::render('Hospital/Laboratory/Requests/Index', [
            'requests' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Show Sample Collection Form
     */
    public function create(LabPrescription $prescription)
    {
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
        $request->validate([
            'lab_nature_of_sample_id' => 'required|exists:lab_nature_of_samples,id',
            'collection_date' => 'required|date',
            'notes' => 'nullable|string'
        ]);

        DB::transaction(function () use ($request, $prescription) {
            
            // 1. Create the Sample Record
            LabSample::create([
                'lab_prescription_id' => $prescription->id,
                'lab_nature_of_sample_id' => $request->lab_nature_of_sample_id,
                'collected_by' => Auth::id(),
                'collected_at' => $request->collection_date,
                'sample_code' => 'SMP-' . date('Ymd') . '-' . $prescription->id, // Auto-gen ID
                'notes' => $request->notes,
                'status' => 'collected'
            ]);

            // 2. Update Prescription Status
            $prescription->update(['status' => 'collected']);
        });

        return redirect()->route('laboratory0.index')
            ->with('success', 'Sample collected successfully. Sent to processing.');
    }

    /**
     * Reject a Request
     */
    public function reject(Request $request, LabPrescription $prescription)
    {
        $request->validate(['reason_id' => 'required|exists:lab_rejection_reasons,id']);

        $prescription->update([
            'status' => 'rejected',
            'rejection_reason_id' => $request->reason_id, // Ensure migration has this
            'rejected_by' => Auth::id()
        ]);

        return redirect()->back()->with('success', 'Request rejected.');
    }
}