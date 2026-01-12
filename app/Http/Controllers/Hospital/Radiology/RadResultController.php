<?php

namespace App\Http\Controllers\Hospital\Radiology;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// Models
use App\Models\Radiology\RadRequest;
use App\Models\Radiology\RadReport;

class RadResultController extends Controller
{
    /**
     * List Studies Ready for Reporting
     */
    public function index(Request $request)
    {
        $query = RadRequest::with(['patient', 'procedure.modality'])
            ->whereIn('status', ['captured', 'reporting']) // Ready for reporting
            ->orderBy('performed_at', 'desc');

        if ($request->search) {
            $query->whereHas('patient', function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%");
            });
        }

        return Inertia::render('Hospital/Radiology/Results/Index', [
            'studies' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Show Reporting Form
     */
   
    public function create(RadRequest $request)
    {
        // Load relationships
        $request->load(['patient', 'procedure.modality', 'report']);

        $viewerUrl = null;

        // WRAP IN TRY-CATCH to prevent crashing if Orthanc is offline
        try {
            $orthanc = new \App\Services\OrthancService();
            
            // Query Orthanc for the Study ID using the Accession Number
            $studyId = $orthanc->findStudyByAccession($request->accession_number);
            
            if ($studyId) {
                // Generate link to Orthanc Web Viewer
                // Ensure no double slashes in URL
                $baseUrl = rtrim(env('ORTHANC_URL', 'http://127.0.0.1:8042'), '/');
                $viewerUrl = $baseUrl . "/web-viewer/app/viewer.html?study=" . $studyId;
            }
        } catch (\Exception $e) {
            // Log the error but allow the page to load so the doctor can still type a report
            \Log::warning("Orthanc Viewer Link generation failed: " . $e->getMessage());
        }

        return Inertia::render('Hospital/Radiology/Results/Report', [
            'request_data' => $request,
            'patient' => $request->patient,
            'procedure' => $request->procedure,
            'existing_report' => $request->report,
            'viewer_url' => $viewerUrl // <--- Null if offline/not found, URL if found
        ]);
    }
    
    /**
     * Store/Update Report
     */
    public function store(Request $request, RadRequest $radRequest)
    {
        $validated = $request->validate([
            'findings' => 'required|string',
            'impression' => 'nullable|string',
            'recommendation' => 'nullable|string',
            'is_final' => 'boolean'
        ]);

        DB::transaction(function () use ($validated, $radRequest) {
            
            // 1. Create or Update Report
            RadReport::updateOrCreate(
                ['rad_request_id' => $radRequest->id],
                [
                    'findings' => $validated['findings'],
                    'impression' => $validated['impression'],
                    'suggestion' => $validated['recommendation'],
                    'radiologist_id' => Auth::id(),
                    'reported_at' => now(), 
                    'status' => $validated['is_final'] ? 'final' : 'draft'
                ]
            );

            // 2. Update Request Status
            if ($validated['is_final']) {
                $radRequest->update(['status' => 'completed']);
            } else {
                $radRequest->update(['status' => 'reporting']);
            }
        });

        return redirect()->route('radiology1.index')
            ->with('success', $validated['is_final'] ? 'Report finalized.' : 'Draft saved.');
    }

    /**
     * Show Final Report (Read Only)
     */
    public function show(RadReport $report)
    {
        $report->load(['request.patient', 'request.procedure', 'radiologist']);
        
        return Inertia::render('Hospital/Radiology/Results/View', [
            'report' => $report
        ]);
    }
}