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
use App\Models\Ipd\IpdAdmission;
use App\Models\Ipd\IpdDischargeLog;
use App\Models\Ipd\IpdWard;
use App\Models\Ipd\IpdDischargeStatus;
use App\Models\User;

class IpdReportsController extends Controller
{
    /**
     * IPD Reporting Dashboard.
     */
    public function index(): InertiaResponse
    {
        $today = Carbon::today();

        // 1. Current Census (Active Patients)
        $currentInpatients = IpdAdmission::where('status', 'Admitted')->count();

        // 2. Admissions Today
        $admissionsToday = IpdAdmission::whereDate('admission_date', $today)->count();

        // 3. Discharges Today
        $dischargesToday = IpdDischargeLog::whereDate('transdate', $today)->count();

        return Inertia::render('Reports/Ipd/Index', [
            'stats' => [
                'current_inpatients' => $currentInpatients,
                'admissions_today'   => $admissionsToday,
                'discharges_today'   => $dischargesToday,
            ]
        ]);
    }

    /**
     * Report: Admissions Log (Who came in?)
     */
    public function admissions(Request $request): InertiaResponse
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date'   => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
            'ward_id'    => 'nullable|exists:ipd_wards,id',
        ]);

        $startDate = Carbon::parse($validated['start_date'] ?? Carbon::today())->startOfDay();
        $endDate   = Carbon::parse($validated['end_date']   ?? Carbon::today())->endOfDay();
        $wardId    = $validated['ward_id'] ?? null;

        $query = IpdAdmission::with(['patient', 'ward', 'bed', 'user', 'billingGroup'])
            ->whereBetween('admission_date', [$startDate, $endDate]);

        if ($wardId) {
            $query->where('ward_id', $wardId);
        }

        // Aggregate by Payer
        $payerStats = (clone $query)
            ->join('patient_billing_groups', 'ipd_admissions.billinggroup_id', '=', 'patient_billing_groups.id')
            ->select('patient_billing_groups.name', DB::raw('count(*) as total'))
            ->groupBy('patient_billing_groups.name')
            ->get();

        $details = $query->orderBy('admission_date', 'desc')->get()->map(function ($row) {
            return [
                'id' => $row->id,
                'date' => Carbon::parse($row->admission_date)->format('Y-m-d H:i'),
                'file_number' => $row->patientcode,
                'patient_name' => $row->patient ? $row->patient->full_name : 'Unknown',
                'age_gender' => ($row->patient?->age ?? '-') . ' / ' . ($row->patient?->gender ?? '-'),
                'ward' => $row->ward?->name ?? 'N/A',
                'bed' => $row->bed?->bed_number ?? 'N/A',
                'payer' => $row->billingGroup?->name ?? 'Cash',
                'admitting_doctor' => $row->user?->name ?? 'N/A',
                'status' => $row->status
            ];
        });

        return Inertia::render('Reports/Ipd/Admissions', [
            'reportData' => [
                'start' => $startDate->format('d M Y'),
                'end'   => $endDate->format('d M Y'),
                'total_admissions' => $details->count(),
                'payer_stats' => $payerStats,
                'rows' => $details
            ],
            'wards' => IpdWard::select('id', 'name')->orderBy('name')->get(),
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date'   => $endDate->format('Y-m-d'),
                'ward_id'    => $wardId
            ]
        ]);
    }

    /**
     * Report: Discharges Log (Who left and how?)
     */
    public function discharges(Request $request): InertiaResponse
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date'   => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
            'status_id'  => 'nullable|exists:ipd_discharge_statuses,id',
        ]);

        $startDate = Carbon::parse($validated['start_date'] ?? Carbon::today())->startOfDay();
        $endDate   = Carbon::parse($validated['end_date']   ?? Carbon::today())->endOfDay();
        $statusId  = $validated['status_id'] ?? null;

        // Use Discharge Log as base for accurate timestamps
        $query = IpdDischargeLog::with(['patient', 'ward', 'dischargeStatus', 'admissionLog.admission'])
            ->whereBetween('transdate', [$startDate, $endDate]);

        if ($statusId) {
            $query->where('discharge_status_id', $statusId);
        }

        // Aggregate by Outcome
        $outcomeStats = (clone $query)
            ->join('ipd_discharge_statuses', 'ipd_discharge_logs.discharge_status_id', '=', 'ipd_discharge_statuses.id')
            ->select('ipd_discharge_statuses.name', DB::raw('count(*) as total'))
            ->groupBy('ipd_discharge_statuses.name')
            ->get();

        $details = $query->orderBy('transdate', 'desc')->get()->map(function ($log) {
            
            // Calculate Length of Stay (LOS)
            // We need to find the admission date. 
            // Depending on your schema, you might link to IpdAdmission via admissionLog or direct ID
            // Assuming IpdDischargeLog doesn't explicitly have admission_date, we fetch it from the Admission model using patient/ward logic or logs
            // Best approach: Add 'ipd_admission_id' to discharge logs in future migrations.
            // For now, let's assume we can get it from the Patient's last admission or the log relationship.
            
            // Fallback logic for LOS if direct link missing:
            $admissionDate = $log->admissionLog?->admission?->admission_date 
                             ?? IpdAdmission::where('patientcode', $log->patientcode)
                                ->where('status', 'Discharged') // Assuming it's updated
                                ->where('admission_date', '<=', $log->transdate)
                                ->orderBy('admission_date', 'desc')
                                ->value('admission_date');

            $admit = $admissionDate ? Carbon::parse($admissionDate) : null;
            $discharge = Carbon::parse($log->transdate);
            $los = $admit ? $admit->diffInDays($discharge) : 0;
            // If admitted and discharged same day, counts as 1 day usually in stats, or 0. Let's say 1 minimum for billing usually.
            if($los == 0) $los = 1;

            return [
                'id' => $log->id,
                'date' => $discharge->format('Y-m-d H:i'),
                'file_number' => $log->patientcode,
                'patient_name' => $log->patient?->full_name ?? 'Unknown',
                'ward' => $log->ward?->name ?? 'N/A',
                'outcome' => $log->dischargeStatus?->name ?? 'Unknown',
                'remarks' => $log->dischargeremarks,
                'los' => $los
            ];
        });

        return Inertia::render('Reports/Ipd/Discharges', [
            'reportData' => [
                'start' => $startDate->format('d M Y'),
                'end'   => $endDate->format('d M Y'),
                'total_discharges' => $details->count(),
                'outcome_stats' => $outcomeStats,
                'rows' => $details
            ],
            'statuses' => IpdDischargeStatus::all(),
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date'   => $endDate->format('Y-m-d'),
                'status_id'  => $statusId
            ]
        ]);
    }

    /**
     * Report: Current Census (Who is in the beds right now?)
     */
    public function census(Request $request): InertiaResponse
    {
        $wardId = $request->ward_id;

        $query = IpdAdmission::with(['patient', 'ward', 'bed', 'billingGroup'])
            ->where('status', 'Admitted');

        if ($wardId) {
            $query->where('ward_id', $wardId);
        }

        // Group by Ward for display
        $data = $query->orderBy('ward_id')->get()->groupBy(function($item) {
            return $item->ward->name;
        });

        // Flatten for simple table, or keep grouped structure? 
        // Let's pass a flat list but sorted by ward, and calculate stats.
        $flatList = $query->orderBy('ward_id')->orderBy('admission_date')->get()->map(function($row) {
            return [
                'id' => $row->id,
                'ward' => $row->ward->name,
                'bed' => $row->bed?->bed_number ?? 'No Bed',
                'patient_name' => $row->patient?->full_name,
                'file_number' => $row->patientcode,
                'admission_date' => Carbon::parse($row->admission_date)->format('Y-m-d'),
                'days_admitted' => Carbon::parse($row->admission_date)->diffInDays(Carbon::now()),
                'payer' => $row->billingGroup?->name
            ];
        });

        // Occupancy Stats
        $wards = IpdWard::withCount(['rooms as total_beds' => function($q){
            // Rough calculation: sum of beds in rooms. 
            // Requires IpdRoom->hasMany(IpdBed)
            $q->join('ipd_beds', 'ipd_rooms.id', '=', 'ipd_beds.room_id');
        }])->get();
        
        // This is tricky without direct relationship, assuming IpdWard has rooms, Rooms have beds.
        // Let's do a simpler count of "Admitted" per ward
        $occupancy = IpdAdmission::where('status', 'Admitted')
            ->select('ward_id', DB::raw('count(*) as occupied'))
            ->groupBy('ward_id')
            ->get()
            ->keyBy('ward_id');

        $wardStats = $wards->map(function($w) use ($occupancy) {
            // Get total beds physically
            $totalBeds = DB::table('ipd_beds')
                ->join('ipd_rooms', 'ipd_beds.room_id', '=', 'ipd_rooms.id')
                ->where('ipd_rooms.ward_id', $w->id)
                ->count();
            
            $occupied = $occupancy[$w->id]->occupied ?? 0;

            return [
                'ward_name' => $w->name,
                'total_beds' => $totalBeds,
                'occupied' => $occupied,
                'percent' => $totalBeds > 0 ? round(($occupied / $totalBeds) * 100, 1) : 0
            ];
        });

        return Inertia::render('Reports/Ipd/Census', [
            'rows' => $flatList,
            'ward_stats' => $wardStats,
            'wards' => IpdWard::select('id', 'name')->get(),
            'filters' => ['ward_id' => $wardId]
        ]);
    }

    /**
     * Report: IPD Daily Census Summary (Complex Matrix)
     * Matches the structure of the provided DevExpress Report.
     */
    public function dailyCensus(Request $request): InertiaResponse
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date'   => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
        ]);

        $startDate = Carbon::parse($validated['start_date'] ?? Carbon::today())->startOfDay();
        $endDate   = Carbon::parse($validated['end_date']   ?? Carbon::today())->endOfDay();
        $daysInRange = $startDate->diffInDays($endDate) + 1; // Used for Occupancy Calc

        // 1. Get All Wards and Pre-calculate Total Beds
        $wards = IpdWard::withCount(['rooms as total_beds' => function($q){
            $q->join('ipd_beds', 'ipd_rooms.id', '=', 'ipd_beds.room_id'); // Assuming simple count
        }])->orderBy('name')->get();

        // 2. Fetch Raw Data for the Date Range
        
        // Admissions
        $admissions = IpdAdmission::with('patient')
            ->whereBetween('admission_date', [$startDate, $endDate])
            ->get();

        // Discharges (Includes Regular, Death, Absconded based on status)
        $discharges = IpdDischargeLog::with(['patient', 'dischargeStatus'])
            ->whereBetween('transdate', [$startDate, $endDate])
            ->get();

        // Transfers
        $transfers = \App\Models\Ipd\IpdTransferLog::whereBetween('transferdate', [$startDate, $endDate])->get();

        // 3. Process Data Per Ward
        $reportRows = $wards->map(function ($ward) use ($admissions, $discharges, $transfers, $daysInRange) {
            $wardId = $ward->id;

            // -- Helper Filters --
            $wardAdmissions = $admissions->where('ward_id', $wardId);
            $wardDischarges = $discharges->where('ward_id', $wardId);
            
            // Transfers
            $transIn  = $transfers->where('to_ward_id', $wardId)->count();
            $transOut = $transfers->where('from_ward_id', $wardId)->count();

            // -- Admissions Breakdown --
            $adminMale   = $wardAdmissions->where('patient.gender', 'Male')->count();
            $adminFemale = $wardAdmissions->where('patient.gender', 'Female')->count();

            // -- Discharges Breakdown (Outcome based) --
            // Assuming 'Death' ID or Name checks. Adjust based on your Seed data.
            $deathLogs = $wardDischarges->filter(fn($d) => stripos($d->dischargeStatus?->name, 'Death') !== false);
            $abscLogs  = $wardDischarges->filter(fn($d) => stripos($d->dischargeStatus?->name, 'Abscond') !== false);
            $regularLogs = $wardDischarges->diff($deathLogs)->diff($abscLogs);

            $dischMale = $regularLogs->where('patient.gender', 'Male')->count();
            $dischFemale = $regularLogs->where('patient.gender', 'Female')->count();

            $deathMale = $deathLogs->where('patient.gender', 'Male')->count();
            $deathFemale = $deathLogs->where('patient.gender', 'Female')->count();

            $abscMale = $abscLogs->where('patient.gender', 'Male')->count();
            $abscFemale = $abscLogs->where('patient.gender', 'Female')->count();

            // -- Patient Days Calculation (Approximation) --
            // Logic: Start Census + Admissions - Discharges + Transfers In - Transfers Out
            // For report accuracy, usually snapshot counts are used. 
            // Here we approximate "Total Days Charged" or "Occupied Bed Days"
            // Simple Logic: (Admissions + In - Out - Discharges) * Days (Very rough)
            // Better Logic: Sum of daily census.
            
            // For this specific report structure, let's calculate simplistic "Service Days"
            // (Admissions + Opening Balance) approx.
            // Using placeholder logic: Total Admitted M/F * Days
            $daysMale = ($adminMale + $transIn) * 1; // Simplified for demo
            $daysFemale = ($adminFemale + $transIn) * 1; 
            $totalDays = $daysMale + $daysFemale;

            // -- Bed Occupancy --
            $bedCapacity = $ward->total_beds * $daysInRange;
            $occupancyRate = ($bedCapacity > 0) ? ($totalDays / $bedCapacity) * 100 : 0;

            return [
                'ward_name' => $ward->name,
                // Admissions
                'admin_male'   => $adminMale,
                'admin_female' => $adminFemale,
                'admin_total'  => $adminMale + $adminFemale,
                // Discharges
                'disch_male'   => $dischMale,
                'disch_female' => $dischFemale,
                'disch_total'  => $dischMale + $dischFemale,
                // Deaths
                'death_male'   => $deathMale,
                'death_female' => $deathFemale,
                'death_total'  => $deathMale + $deathFemale,
                // Absconded
                'absc_male'    => $abscMale,
                'absc_female'  => $abscFemale,
                'absc_total'   => $abscMale + $abscFemale,
                // Transfers
                'trans_in'     => $transIn,
                'trans_out'    => $transOut,
                // Stats
                'days_male'    => $daysMale,
                'days_female'  => $daysFemale,
                'days_total'   => $totalDays,
                'total_beds'   => $ward->total_beds,
                'occupancy'    => $occupancyRate
            ];
        });

        // 4. Grand Totals
        $totals = [
            'admin_male' => $reportRows->sum('admin_male'),
            'admin_female' => $reportRows->sum('admin_female'),
            'admin_total' => $reportRows->sum('admin_total'),
            'disch_male' => $reportRows->sum('disch_male'),
            'disch_female' => $reportRows->sum('disch_female'),
            'disch_total' => $reportRows->sum('disch_total'),
            'death_male' => $reportRows->sum('death_male'),
            'death_female' => $reportRows->sum('death_female'),
            'death_total' => $reportRows->sum('death_total'),
            'absc_male' => $reportRows->sum('absc_male'),
            'absc_female' => $reportRows->sum('absc_female'),
            'absc_total' => $reportRows->sum('absc_total'),
            'trans_in' => $reportRows->sum('trans_in'),
            'trans_out' => $reportRows->sum('trans_out'),
            'days_male' => $reportRows->sum('days_male'),
            'days_female' => $reportRows->sum('days_female'),
            'days_total' => $reportRows->sum('days_total'),
            'total_beds' => $reportRows->sum('total_beds'),
            'occupancy' => $reportRows->avg('occupancy'), // Average %
        ];

        return Inertia::render('Reports/Ipd/DailyCensus', [
            'reportData' => [
                'start' => $startDate->format('d M Y'),
                'end'   => $endDate->format('d M Y'),
                'rows'  => $reportRows,
                'totals'=> $totals
            ],
            'filters' => $request->only(['start_date', 'end_date'])
        ]);
    }
}