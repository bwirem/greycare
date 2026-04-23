<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

// Models
use App\Models\Laboratory\LabPrescription;
use App\Models\Laboratory\LabPanel;
use App\Models\User;

class LabReportsController extends Controller
{
    /**
     * Laboratory Reporting Dashboard.
     */
    public function index(): InertiaResponse
    {
        $today = Carbon::today();

        // 1. Total Requests Today
        $totalRequests = LabPrescription::whereDate('created_at', $today)->count();

        // 2. Pending Samples (Not yet collected)
        $pendingCollection = LabPrescription::where('status', 'Requested')->count();

        // 3. Completed/completed Today
        $completedToday = LabPrescription::whereDate('updated_at', $today)
            ->where('status', 'completed')
            ->count();

        // 4. Critical/Abnormal (Placeholder logic - assumes 'is_abnormal' flag exists or calculated)
        // For now, we count Rejected samples as a KPI
        $rejectedCount = LabPrescription::whereDate('updated_at', $today)
            ->where('status', 'Rejected')
            ->count();

        return Inertia::render('Reports/Laboratory/Index', [
            'stats' => [
                'total_requests' => $totalRequests,
                'pending_collection' => $pendingCollection,
                'completed_today' => $completedToday,
                'rejected_today' => $rejectedCount,
            ]
        ]);
    }

    /**
     * Report: Detailed Lab Request Log
     */ 
    public function requests(Request $request): InertiaResponse
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date'   => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
            'status'     => 'nullable|string',
            'panel_id'   => 'nullable|exists:lab_panels,id',
        ]);

        $startDate = Carbon::parse($validated['start_date'] ?? Carbon::today())->startOfDay();
        $endDate   = Carbon::parse($validated['end_date']   ?? Carbon::today())->endOfDay();
        $status    = $validated['status'] ?? null;
        $panelId   = $validated['panel_id'] ?? null;

        $query = LabPrescription::with(['patient', 'panel', 'doctor',
                                       'sample.collectedBy',                                   
                                       'sample.results.technician'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($status) {
            $query->where('status', $status);
        }
        if ($panelId) {
            $query->where('lab_panel_id', $panelId);
        }

        // Aggregate Summary
        $statusSummary = (clone $query)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get();

        $rows = $query->orderBy('created_at', 'desc')->paginate(20)->withQueryString()
            ->through(function ($row) {
                // Determine Time Out (Verification Time)
                // Assuming if status is completed, updated_at is the time. 
                // Alternatively, if you have a specific 'verified_at' column on the prescription, use that.
                $iscompleted = $row->status === 'completed';
                $timeOut = $iscompleted ? $row->updated_at : null;

                return [
                    'id'           => $row->id,
                    'time_in'      => $row->created_at->format('Y-m-d H:i'), // Request Time
                    'time_out'     => $timeOut ? $timeOut->format('Y-m-d H:i') : '-',
                    'patient_name' => $row->patient
                                    ? $row->patient->first_name . ' ' . $row->patient->last_name
                                    : 'Unknown',
                    'file_number'  => $row->patientcode,
                    'test_name'    => $row->panel?->name ?? 'N/A',
                    'doctor'       => $row->doctor?->name ?? 'Unassigned',
                    'technician' => $row->sample && $row->sample->results->count()
                                    ? $row->sample->results
                                        ->pluck('technician.name')
                                        ->filter()
                                        ->unique()
                                        ->implode(', ')
                                    : 'Unassigned',
                    'collectedby' =>$row->sample?->collectedBy?->name ?? 'Unassigned',
                    'status'       => $row->status,
                    // TAT: Difference between Created (Time In) and completed (Time Out)
                    'tat'          => $timeOut 
                                      ? $row->created_at->diffForHumans($timeOut, ['syntax' => \Carbon\CarbonInterface::DIFF_ABSOLUTE, 'parts' => 2]) 
                                      : '-'
                ];
            });

        return Inertia::render('Reports/Laboratory/Requests', [
            'reportData' => [
                'start' => $startDate->format('Y-m-d'),
                'end'   => $endDate->format('Y-m-d'),
                'summary' => $statusSummary,
                'rows' => $rows
            ],
            'panels' => LabPanel::select('id', 'name')->orderBy('name')->get(),
            'filters' => $request->only(['start_date', 'end_date', 'status', 'panel_id'])
        ]);
    }

    /**
     * Report: Test Volume Analysis (Most performed tests)
     */
    /**
     * Report: Test Volume Analysis (Most performed tests)
     */
    public function analysis(Request $request): InertiaResponse
    {
        $startDate = Carbon::parse($request->start_date ?? Carbon::now()->startOfMonth())->startOfDay();
        $endDate   = Carbon::parse($request->end_date ?? Carbon::now()->endOfMonth())->endOfDay();

        // Top Tests
        $testVolumes = LabPrescription::query() // Start query
            ->join('lab_panels', 'lab_prescriptions.lab_panel_id', '=', 'lab_panels.id')
            // FIX: Qualify 'created_at' with the table name 'lab_prescriptions'
            ->whereBetween('lab_prescriptions.created_at', [$startDate, $endDate])
            ->select(
                'lab_panels.name', 
                DB::raw('count(*) as total'), 
                // Fix: Qualify 'status' just in case, though usually unique to prescriptions
                DB::raw("SUM(CASE WHEN lab_prescriptions.status = 'completed' THEN 1 ELSE 0 END) as completed")
            )
            ->groupBy('lab_panels.id', 'lab_panels.name')
            ->orderByDesc('total')
            ->limit(20)
            ->get();

        return Inertia::render('Reports/Laboratory/Analysis', [
            'reportData' => [
                'start' => $startDate->format('d M Y'),
                'end'   => $endDate->format('d M Y'),
                'volumes' => $testVolumes
            ],
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date'   => $endDate->format('Y-m-d')
            ]
        ]);
    }
}