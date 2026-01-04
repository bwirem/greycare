<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

// Models
use App\Models\Theatre\TheatreBooking;
use App\Models\Theatre\TheatreProcedure;
use App\Models\User; // Surgeons

class TheatreReportsController extends Controller
{
    /**
     * Theatre Reporting Dashboard.
     */
    public function index(): InertiaResponse
    {
        $today = Carbon::today();

        // 1. Surgeries Scheduled Today
        $scheduledToday = TheatreBooking::whereDate('scheduled_at', $today)
            ->where('status', 'Scheduled')
            ->count();

        // 2. Surgeries Completed Today
        $completedToday = TheatreBooking::whereDate('updated_at', $today)
            ->where('status', 'Completed')
            ->count();

        // 3. Pending/Post-Op (In Recovery)
        $inRecovery = TheatreBooking::where('status', 'Recovery')->count();

        // 4. Cancelled Today
        $cancelledToday = TheatreBooking::whereDate('updated_at', $today)
            ->where('status', 'Cancelled')
            ->count();

        return Inertia::render('Reports/Theatre/Index', [
            'stats' => [
                'scheduled_today' => $scheduledToday,
                'completed_today' => $completedToday,
                'in_recovery'     => $inRecovery,
                'cancelled_today' => $cancelledToday,
            ]
        ]);
    }

    /**
     * Report: Detailed Surgery Activity Log
     */
    public function activity(Request $request): InertiaResponse
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date'   => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
            'status'     => 'nullable|string',
            'doctor_id'  => 'nullable|exists:users,id',
        ]);

        $startDate = Carbon::parse($validated['start_date'] ?? Carbon::today())->startOfDay();
        $endDate   = Carbon::parse($validated['end_date']   ?? Carbon::today())->endOfDay();
        $status    = $validated['status'] ?? null;
        $doctorId  = $validated['doctor_id'] ?? null;

        $query = TheatreBooking::with(['patient', 'procedure', 'doctor'])
            ->whereBetween('scheduled_at', [$startDate, $endDate]);

        if ($status) {
            $query->where('status', $status);
        }
        if ($doctorId) {
            $query->where('doctor_user_id', $doctorId);
        }

        // Summary Stats
        $summary = (clone $query)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get();

        $rows = $query->orderBy('scheduled_at', 'desc')->paginate(20)->withQueryString()
            ->through(function ($row) {
                return [
                    'id'           => $row->id,
                    'date'         => $row->scheduled_at ? Carbon::parse($row->scheduled_at)->format('Y-m-d H:i') : 'Pending',
                    'patient_name' => $row->patient
                                    ? $row->patient->first_name . ' ' . $row->patient->last_name
                                    : 'Unknown',
                    'file_number'  => $row->patientcode,
                    'procedure'    => $row->procedure?->name ?? 'N/A',
                    'surgeon'      => $row->doctor?->name ?? 'Unassigned',
                    'status'       => $row->status,
                    'remarks'      => $row->remarks ?? '-',
                ];
            });

        return Inertia::render('Reports/Theatre/Activity', [
            'reportData' => [
                'start'   => $startDate->format('Y-m-d'),
                'end'     => $endDate->format('Y-m-d'),
                'summary' => $summary,
                'rows'    => $rows
            ],
            // Get doctors who are surgeons (assuming specialization_id or role exists, generic fetch for now)
            'surgeons' => User::whereNotNull('specialization_id')->select('id', 'name')->orderBy('name')->get(),
            'filters'  => $request->only(['start_date', 'end_date', 'status', 'doctor_id'])
        ]);
    }

    /**
     * Report: Procedure Analysis (Top Surgeries)
     */
    public function analysis(Request $request): InertiaResponse
    {
        $startDate = Carbon::parse($request->start_date ?? Carbon::now()->startOfMonth())->startOfDay();
        $endDate   = Carbon::parse($request->end_date ?? Carbon::now()->endOfMonth())->endOfDay();

        // Top Procedures
        $volumes = TheatreBooking::query()
            ->join('theatre_procedures', 'theatre_bookings.theatre_procedure_id', '=', 'theatre_procedures.id')
            ->whereBetween('theatre_bookings.scheduled_at', [$startDate, $endDate])
            ->select(
                'theatre_procedures.name',
                'theatre_procedures.category', // Assuming category column exists
                DB::raw('count(*) as total'), 
                DB::raw("SUM(CASE WHEN theatre_bookings.status = 'Completed' THEN 1 ELSE 0 END) as completed")
            )
            ->groupBy('theatre_procedures.id', 'theatre_procedures.name', 'theatre_procedures.category')
            ->orderByDesc('total')
            ->limit(20)
            ->get();

        return Inertia::render('Reports/Theatre/Analysis', [
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