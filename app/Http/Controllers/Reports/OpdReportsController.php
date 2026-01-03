<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

// Models
use App\Models\Opd\OpdBooking;
use App\Models\Opd\OpdTreatmentPoint;
use App\Models\Patient\PatientBillingGroup;
use App\Models\User; // For Doctors

class OpdReportsController extends Controller
{
    /**
     * Display the OPD Reporting Dashboard.
     */
    public function index(): InertiaResponse
    {
        // Calculate some quick stats for the dashboard cards
        $today = Carbon::today();
        
        $todayStats = OpdBooking::whereDate('opd_bookings.created_at', $today)
            ->selectRaw('count(*) as total')
            ->selectRaw("count(case when visit_classification = 'New Case' then 1 end) as new_cases")
            ->selectRaw("count(case when visit_classification != 'New Case' then 1 end) as revisits")
            ->first();

        return Inertia::render('Reports/Opd/Index', [
            'stats' => [
                'today_total' => $todayStats->total,
                'today_new'   => $todayStats->new_cases,
                'today_revisit'=> $todayStats->revisits,
            ]
        ]);
    }

    /**
     * Generate a detailed OPD Registration report for a single day.
     */
    public function daily(Request $request): InertiaResponse
    {
        $validated = $request->validate([
            'report_date' => 'nullable|date_format:Y-m-d',
            'clinic_id'   => 'nullable|exists:opd_treatmentpoints,id',
            'doctor_id'   => 'nullable|exists:users,id',
        ]);

        $reportDate = Carbon::parse($validated['report_date'] ?? Carbon::today())->startOfDay();
        $clinicId   = $validated['clinic_id'] ?? null;
        $doctorId   = $validated['doctor_id'] ?? null;

        // Base Query - Explicitly specify table name for created_at
        $query = OpdBooking::with(['patient', 'treatmentPoint', 'billingGroup', 'user'])
            ->whereDate('opd_bookings.created_at', $reportDate);

        // Filters
        if ($clinicId) {
            $query->where('opd_bookings.treatmentpoint_id', $clinicId);
        }
        if ($doctorId) {
            $query->where('opd_bookings.doctor_user_id', $doctorId);
        }

        // 1. High Level Summaries
        $summary = (clone $query)->select(
            DB::raw('COUNT(*) as total_visits'),
            DB::raw("SUM(CASE WHEN visit_classification = 'New Case' THEN 1 ELSE 0 END) as new_cases"),
            DB::raw("SUM(CASE WHEN visit_classification != 'New Case' THEN 1 ELSE 0 END) as revisits")
        )->first();

        // 2. Breakdown by Payment Category (Cash vs Insurance)
        // This Join causes ambiguity if 'created_at' isn't qualified in the base query
        $paymentSummary = (clone $query)
            ->join('patient_billing_groups', 'opd_bookings.billinggroup_id', '=', 'patient_billing_groups.id')
            ->select(
                'patient_billing_groups.name as payer_name',
                DB::raw('COUNT(opd_bookings.id) as count')
            )
            ->groupBy('patient_billing_groups.name')
            ->get();

        // 3. Detailed List
        $details = (clone $query)
            ->orderBy('opd_bookings.created_at', 'asc') // Qualified sort order
            ->get()
            ->map(function ($booking) {
                return [
                    'id'           => $booking->id,
                    'visit_number' => $booking->visit_number ?? $booking->id,
                    'time'         => $booking->created_at->format('H:i'),
                    'file_number'  => $booking->patientcode,
                    'patient_name' => $booking->patient ? $booking->patient->full_name : 'Unknown',
                    'age'          => $booking->patient ? $booking->patient->age : '-',
                    'gender'       => $booking->patient ? $booking->patient->gender : '-',
                    'payer'        => $booking->billingGroup ? $booking->billingGroup->name : 'N/A',
                    'clinic'       => $booking->treatmentPoint ? $booking->treatmentPoint->name : 'N/A',
                    'doctor'       => $booking->DoctorName ?? 'Unassigned',
                    'type'         => $booking->visit_classification,
                ];
            });

        return Inertia::render('Reports/Opd/Daily', [
            'reportData' => [
                'report_date_formatted' => $reportDate->format('F d, Y'),
                'total_visits' => $summary->total_visits ?? 0,
                'new_cases'    => $summary->new_cases ?? 0,
                'revisits'     => $summary->revisits ?? 0,
                'payment_breakdown' => $paymentSummary,
                'detailed_visits' => $details,
            ],
            'clinics' => OpdTreatmentPoint::select('id', 'name')->orderBy('name')->get(),
            'doctors' => User::whereNotNull('specialization_id')->select('id', 'name')->orderBy('name')->get(),
            'filters' => [
                'report_date' => $reportDate->format('Y-m-d'),
                'clinic_id' => $clinicId,
                'doctor_id' => $doctorId
            ]
        ]);
    }

    /**
     * Generate a summary report over a date range (Trends).
     */
    public function summary(Request $request): InertiaResponse
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date'   => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
            'group_by'   => 'nullable|string|in:day,month,clinic',
        ]);

        $startDate = Carbon::parse($validated['start_date'] ?? Carbon::now()->startOfMonth())->startOfDay();
        $endDate   = Carbon::parse($validated['end_date']   ?? Carbon::now()->endOfMonth())->endOfDay();
        $groupBy   = $validated['group_by'] ?? 'day';

        // Fix: Explicitly use opd_bookings.created_at
        $baseQuery = OpdBooking::whereBetween('opd_bookings.created_at', [$startDate, $endDate]);

        // Total Counts
        $overallTotal = (clone $baseQuery)->count();

        $chartLabels = [];
        $chartData = [];
        $tableData = [];

        if ($groupBy === 'clinic') {
            $data = (clone $baseQuery)
                ->join('opd_treatmentpoints', 'opd_bookings.treatmentpoint_id', '=', 'opd_treatmentpoints.id')
                ->select(
                    'opd_treatmentpoints.name as label',
                    DB::raw('COUNT(opd_bookings.id) as total')
                )
                ->groupBy('opd_treatmentpoints.name')
                ->orderBy('total', 'desc')
                ->get();
            
            foreach($data as $row) {
                $chartLabels[] = $row->label;
                $chartData[] = $row->total;
                $tableData[] = ['label' => $row->label, 'total' => $row->total];
            }

        } else {
            // Time based grouping
            $dateFormat = $groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d';
            $phpFormat  = $groupBy === 'month' ? 'Y-m' : 'Y-m-d';
            
            // Fix: Explicitly use opd_bookings.created_at in raw SQL
            $dbRaw = config('database.default') === 'sqlite' 
                ? "strftime('{$dateFormat}', opd_bookings.created_at) as date_group"
                : "DATE_FORMAT(opd_bookings.created_at, '{$dateFormat}') as date_group";

            $data = (clone $baseQuery)
                ->select(DB::raw($dbRaw), DB::raw('COUNT(*) as total'))
                ->groupBy('date_group')
                ->orderBy('date_group')
                ->get()
                ->pluck('total', 'date_group');

            // Fill gaps in dates
            $period = CarbonPeriod::create($startDate, $groupBy === 'month' ? '1 month' : '1 day', $endDate);
            
            foreach ($period as $dt) {
                $key = $dt->format($phpFormat);
                $count = $data[$key] ?? 0;
                $chartLabels[] = $dt->format($groupBy === 'month' ? 'M Y' : 'M d');
                $chartData[] = $count;
                $tableData[] = ['label' => $dt->format($groupBy === 'month' ? 'F Y' : 'D, M d, Y'), 'total' => $count];
            }
        }

        return Inertia::render('Reports/Opd/Summary', [
            'reportData' => [
                'title' => "OPD Registration Summary",
                'start' => $startDate->format('Y-m-d'),
                'end'   => $endDate->format('Y-m-d'),
                'overall_total' => $overallTotal,
                'chart_labels' => $chartLabels,
                'chart_data' => $chartData,
                'table_data' => $tableData,
            ],
            'filters' => $request->all()
        ]);
    }

    /**
     * Generate the Attendance Summary (New vs Revisit by Gender).
     * Mimics the DevExpress "Attendance Count" report.
     */
    public function attendance(Request $request): InertiaResponse
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date'   => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
            'group_by'   => 'nullable|string|in:clinic,payer', // Clinic = Treatment Point, Payer = Customer Group
        ]);

        $startDate = Carbon::parse($validated['start_date'] ?? Carbon::now()->startOfMonth())->startOfDay();
        $endDate   = Carbon::parse($validated['end_date']   ?? Carbon::now()->endOfMonth())->endOfDay();
        $groupBy   = $validated['group_by'] ?? 'clinic';

        // 1. Build Base Query with Joins
        $query = OpdBooking::query()
            ->join('patients', 'opd_bookings.patientcode', '=', 'patients.code')
            ->whereBetween('opd_bookings.created_at', [$startDate, $endDate]);

        // 2. Determine Grouping
        if ($groupBy === 'payer') {
            $query->join('patient_billing_groups', 'opd_bookings.billinggroup_id', '=', 'patient_billing_groups.id')
                  ->groupBy('patient_billing_groups.id', 'patient_billing_groups.name')
                  ->select('patient_billing_groups.name as group_name');
        } else {
            // Default to Clinic (Treatment Point)
            $query->join('opd_treatmentpoints', 'opd_bookings.treatmentpoint_id', '=', 'opd_treatmentpoints.id')
                  ->groupBy('opd_treatmentpoints.id', 'opd_treatmentpoints.name')
                  ->select('opd_treatmentpoints.name as group_name');
        }

        // 3. Add Conditional Aggregates (The Matrix Calculation)
        $query->addSelect([
            // New Cases
            DB::raw("SUM(CASE WHEN visit_classification = 'New Case' AND patients.gender = 'Male' THEN 1 ELSE 0 END) as new_male"),
            DB::raw("SUM(CASE WHEN visit_classification = 'New Case' AND patients.gender = 'Female' THEN 1 ELSE 0 END) as new_female"),
            
            // Re-Attendance
            DB::raw("SUM(CASE WHEN visit_classification != 'New Case' AND patients.gender = 'Male' THEN 1 ELSE 0 END) as revisit_male"),
            DB::raw("SUM(CASE WHEN visit_classification != 'New Case' AND patients.gender = 'Female' THEN 1 ELSE 0 END) as revisit_female"),
        ]);

        $results = $query->orderBy('group_name')->get();

        // 4. Post-process to calculate totals (Doing row sums in PHP is often cleaner than SQL for simple addition)
        $processedData = $results->map(function ($row) {
            $newTotal = $row->new_male + $row->new_female;
            $revisitTotal = $row->revisit_male + $row->revisit_female;
            
            return [
                'group_name'     => $row->group_name,
                // New
                'new_male'       => (int)$row->new_male,
                'new_female'     => (int)$row->new_female,
                'new_total'      => $newTotal,
                // Revisit
                'revisit_male'   => (int)$row->revisit_male,
                'revisit_female' => (int)$row->revisit_female,
                'revisit_total'  => $revisitTotal,
                // Grand Totals
                'total_male'     => (int)$row->new_male + (int)$row->revisit_male,
                'total_female'   => (int)$row->new_female + (int)$row->revisit_female,
                'grand_total'    => $newTotal + $revisitTotal,
            ];
        });

        // 5. Calculate Column Footer Totals
        $totals = [
            'new_male' => $processedData->sum('new_male'),
            'new_female' => $processedData->sum('new_female'),
            'new_total' => $processedData->sum('new_total'),
            'revisit_male' => $processedData->sum('revisit_male'),
            'revisit_female' => $processedData->sum('revisit_female'),
            'revisit_total' => $processedData->sum('revisit_total'),
            'total_male' => $processedData->sum('total_male'),
            'total_female' => $processedData->sum('total_female'),
            'grand_total' => $processedData->sum('grand_total'),
        ];

        return Inertia::render('Reports/Opd/Attendance', [
            'reportData' => [
                'title'   => $groupBy === 'payer' ? 'Attendance Count by Customer Group' : 'Attendance Count by Treatment Point',
                'start'   => $startDate->format('d M Y'),
                'end'     => $endDate->format('d M Y'),
                'rows'    => $processedData,
                'totals'  => $totals,
            ],
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date'   => $endDate->format('Y-m-d'),
                'group_by'   => $groupBy,
            ]
        ]);
    }
}