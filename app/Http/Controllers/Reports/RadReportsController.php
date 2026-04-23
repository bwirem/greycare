<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

// Models
use App\Models\Radiology\RadRequest;
use App\Models\Radiology\RadProcedure;
use App\Models\User;

class RadReportsController extends Controller
{
    /**
     * Radiology Reporting Dashboard.
     */
    public function index(): InertiaResponse
    {
        $today = Carbon::today();

        // 1. Total Requests Today
        $totalRequests = RadRequest::whereDate('created_at', $today)->count();

        // 2. Pending Imaging (Ordered but not yet taken)
        $pendingImaging = RadRequest::where('status', 'Ordered')->count();

        // 3. Pending Reporting (Image taken, waiting for Radiologist)
        $pendingReporting = RadRequest::where('status', 'Image Taken')->count();

        // 4. Completed Today
        $completedToday = RadRequest::whereDate('updated_at', $today)
            ->where('status', 'Reported')
            ->count();

        return Inertia::render('Reports/Radiology/Index', [
            'stats' => [
                'total_requests'    => $totalRequests,
                'pending_imaging'   => $pendingImaging,
                'pending_reporting' => $pendingReporting,
                'completed_today'   => $completedToday,
            ]
        ]);
    }

    /**
     * Report: Detailed Radiology Request Log
     */
    public function requests(Request $request): InertiaResponse
    {
        $validated = $request->validate([
            'start_date'   => 'nullable|date_format:Y-m-d',
            'end_date'     => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
            'status'       => 'nullable|string',
            'procedure_id' => 'nullable|exists:rad_procedures,id',
        ]);

        $startDate = Carbon::parse($validated['start_date'] ?? Carbon::today())->startOfDay();
        $endDate   = Carbon::parse($validated['end_date']   ?? Carbon::today())->endOfDay();
        $status    = $validated['status'] ?? null;
        $procId    = $validated['procedure_id'] ?? null;

        // Eager load relationships (including nested modality)
        $query = RadRequest::with(['patient', 'procedure.modality', 'doctor','report.radiologist'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($status) {
            $query->where('status', $status);
        }
        if ($procId) {
            $query->where('rad_procedure_id', $procId);
        }

        // Aggregate Summary
        $statusSummary = (clone $query)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get();

        $rows = $query->orderBy('created_at', 'desc')->paginate(20)->withQueryString()
            ->through(function ($row) {
                return [
                    'id'           => $row->id,
                    'date'         => $row->created_at->format('Y-m-d H:i'),
                    'accession'    => $row->accession_number,
                    'patient_name' => $row->patient
                                        ? $row->patient->first_name . ' ' . $row->patient->last_name
                                        : 'Unknown',
                    'file_number'  => $row->patientcode,
                    'exam_name'    => $row->procedure?->name ?? 'N/A',
                    
                    // --- FIX FOR REACT ERROR #31 ---
                    // Extract the string 'name' from the modality object
                    'modality'     => $row->procedure?->modality?->name ?? 'General', 
                    
                    'doctor'       => $row->doctor?->name ?? 'Unassigned',
                    'radiologist'  => $row->report?->radiologist?->name ?? 'Unassigned',
                    'status'       => $row->status,
                ];
            });

        return Inertia::render('Reports/Radiology/Requests', [
            'reportData' => [
                'start'   => $startDate->format('Y-m-d'),
                'end'     => $endDate->format('Y-m-d'),
                'summary' => $statusSummary,
                'rows'    => $rows
            ],
            'procedures' => RadProcedure::select('id', 'name')->orderBy('name')->get(),
            'filters'    => $request->only(['start_date', 'end_date', 'status', 'procedure_id'])
        ]);
    }

    /**
     * Report: Exam Volume Analysis (Top Scans)
     */
    public function analysis(Request $request): InertiaResponse
    {
        $startDate = Carbon::parse($request->start_date ?? Carbon::now()->startOfMonth())->startOfDay();
        $endDate   = Carbon::parse($request->end_date ?? Carbon::now()->endOfMonth())->endOfDay();

        // Top Procedures
        $volumes = RadRequest::query()
            ->join('rad_procedures', 'rad_requests.rad_procedure_id', '=', 'rad_procedures.id')
            // Fix: Specify table name for created_at to avoid ambiguity
            ->whereBetween('rad_requests.created_at', [$startDate, $endDate])
            ->select(
                'rad_procedures.name',
                // Note: We don't group by modality here to keep SQL simple. 
                // If needed, we would join rad_modalities table.
                DB::raw('count(*) as total'), 
                DB::raw("SUM(CASE WHEN rad_requests.status = 'Reported' THEN 1 ELSE 0 END) as completed")
            )
            ->groupBy('rad_procedures.id', 'rad_procedures.name')
            ->orderByDesc('total')
            ->limit(20)
            ->get();

        return Inertia::render('Reports/Radiology/Analysis', [
            'reportData' => [
                'start'   => $startDate->format('d M Y'),
                'end'     => $endDate->format('d M Y'),
                'volumes' => $volumes
            ],
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date'   => $endDate->format('Y-m-d')
            ]
        ]);
    }
}