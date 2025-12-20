<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

// Models
use App\Models\HumanResource\HrmEmployee;
use App\Models\HumanResource\PayPayrollPeriod;
use App\Models\HumanResource\HrmLeaveRequest;
use App\Models\HumanResource\HrmAttendance;
use App\Models\HumanResource\HrmDepartment;

class HumanResourceReportsController extends Controller
{
    /**
     * 1. Employee Master List
     */
    public function employeeList(Request $request)
    {
        $status = $request->input('status', 'Active');
        $deptId = $request->input('department_id');

        $query = HrmEmployee::with(['currentJob.department', 'currentJob.position']);

        if ($status !== 'All') {
            $query->where('status', $status);
        }

        if ($deptId) {
            $query->whereHas('currentJob', function($q) use ($deptId) {
                $q->where('department_id', $deptId);
            });
        }

        $employees = $query->orderBy('first_name')->get();

        return Inertia::render('Reports/HumanResource/EmployeeList', [
            'employees' => $employees,
            'departments' => HrmDepartment::select('id', 'name')->get(),
            'filters' => $request->only(['status', 'department_id']),
            'reportDate' => Carbon::now()->format('d M Y')
        ]);
    }

    /**
     * 2. Payroll Summary
     */
    public function payrollSummary(Request $request)
    {
        $periodId = $request->input('period_id');
        
        $periods = PayPayrollPeriod::orderBy('start_date', 'desc')->get();
        $selectedPeriod = $periodId ? PayPayrollPeriod::find($periodId) : $periods->first();

        $summary = null;
        if ($selectedPeriod) {
            $summary = DB::table('pay_slips')
                ->where('payroll_period_id', $selectedPeriod->id)
                ->select(
                    'department_snapshot',
                    DB::raw('COUNT(id) as emp_count'),
                    DB::raw('SUM(basic_salary) as total_basic'),
                    DB::raw('SUM(total_allowances) as total_allowances'),
                    DB::raw('SUM(gross_salary) as total_gross'),
                    DB::raw('SUM(tax_amount) as total_tax'),
                    DB::raw('SUM(total_deductions) as total_deductions'),
                    DB::raw('SUM(net_pay) as total_net')
                )
                ->groupBy('department_snapshot')
                ->get();
        }

        return Inertia::render('Reports/HumanResource/PayrollSummary', [
            'periods' => $periods,
            'summary' => $summary,
            'selectedPeriod' => $selectedPeriod,
            'filters' => ['period_id' => $selectedPeriod?->id]
        ]);
    }

    /**
     * 3. Leave Balances / History
     */
    public function leaveReport(Request $request)
    {
        $year = $request->input('year', Carbon::now()->year);

        // Fetch Approved Leaves grouped by Type
        $leaves = HrmLeaveRequest::with(['employee', 'leaveType'])
            ->whereYear('start_date', $year)
            ->where('status', 'Approved')
            ->orderBy('start_date', 'desc')
            ->get();

        return Inertia::render('Reports/HumanResource/LeaveReport', [
            'leaves' => $leaves,
            'filters' => ['year' => $year]
        ]);
    }

    /**
     * 4. Attendance Summary
     */
    public function attendanceSummary(Request $request)
    {
        $date = $request->input('date', Carbon::today()->toDateString());

        $attendance = HrmAttendance::with(['employee.currentJob.department'])
            ->whereDate('attendance_date', $date)
            ->get();

        $stats = [
            'present' => $attendance->whereIn('status', ['Present', 'Late'])->count(),
            'absent' => $attendance->where('status', 'Absent')->count(),
            'leave' => $attendance->where('status', 'Leave')->count(),
            'late' => $attendance->where('status', 'Late')->count(),
        ];

        return Inertia::render('Reports/HumanResource/AttendanceSummary', [
            'attendance' => $attendance,
            'stats' => $stats,
            'filters' => ['date' => $date]
        ]);
    }
}