<?php

namespace App\Http\Controllers\Hospital\Laboratory;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// Models
use App\Models\Laboratory\LabSample;
use App\Models\Laboratory\LabResult;

class LabResultController extends Controller
{
    /**
     * List Samples waiting for Results
     */
    public function index(Request $request)
    {
        $query = LabSample::with(['prescription.patient', 'prescription.panel', 'sampleType'])
            ->where('status', 'collected') // Ready for processing
            ->orderBy('collected_at', 'asc');

        if ($request->search) {
            $query->whereHas('prescription.patient', function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%");
            });
        }

        return Inertia::render('Hospital/Laboratory/Results/Index', [
            'samples' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Show Result Entry Form
     */
    public function create(LabSample $sample)
    {
        // Load the panel and its parameters (ranges, dropdowns)
        $sample->load([
            'prescription.patient', 
            'prescription.panel.parameters.ranges', 
            'prescription.panel.parameters.dropdowns',
            'results' // Load existing saved results if editing
        ]);

        return Inertia::render('Hospital/Laboratory/Results/Enter', [
            'sample' => $sample,
            'patient' => $sample->prescription->patient,
            'panel' => $sample->prescription->panel,
            'parameters' => $sample->prescription->panel->parameters,
            'existing_results' => $sample->results->keyBy('lab_test_parameter_id')
        ]);
    }

    /**
     * Store Results
     */
    public function store(Request $request, LabSample $sample)
    {
        $request->validate([
            'results' => 'required|array',
            'results.*.parameter_id' => 'required|exists:lab_test_parameters,id',
            'results.*.result_value' => 'required', // Can be string or number
            'is_final' => 'boolean'
        ]);

        DB::transaction(function () use ($request, $sample) {
            
            foreach ($request->results as $res) {
                LabResult::updateOrCreate(
                    [
                        'lab_sample_id' => $sample->id,
                        'lab_test_parameter_id' => $res['parameter_id']
                    ],
                    [
                        'result_value' => $res['result_value'],
                        'technician_user_id' => Auth::id(),
                        'remarks' => $res['remarks'] ?? null,
                        // Add logic here to check if result is out of range based on patient age/gender
                        // 'is_abnormal' => ...
                    ]
                );
            }

            // If technician marks as final, update status
            if ($request->is_final) {
                $sample->update(['status' => 'completed']);
                $sample->prescription->update(['status' => 'completed']);
            } else {
                $sample->update(['status' => 'processing']);
            }
        });

        return redirect()->route('laboratory1.index')
            ->with('success', 'Results saved successfully.');
    }
    
    /**
     * Verify Results (Optional workflow step for Senior Lab Tech)
     */
    public function verify(LabSample $sample)
    {
        $sample->update(['verified_at' => now(), 'verified_by' => Auth::id()]);
        return back()->with('success', 'Results verified.');
    }
}