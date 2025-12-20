<?php

namespace App\Http\Controllers\HumanResource\Attendance;

use App\Http\Controllers\Controller;
use App\Models\HumanResource\HrmAttendance;
use App\Models\HumanResource\HrmEmployee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class HrmAttendanceController extends Controller
{
    /**
     * Display daily attendance list.
     */
    public function index(Request $request)
    {
        // Default to today if no date provided
        $date = $request->input('date', Carbon::today()->toDateString());
        
        $query = HrmAttendance::with('employee')
            ->whereDate('attendance_date', $date);

        if ($request->filled('search')) {
            $query->whereHas('employee', function($q) use ($request) {
                $q->where('first_name', 'like', '%' . $request->search . '%')
                  ->orWhere('last_name', 'like', '%' . $request->search . '%')
                  ->orWhere('employee_code', 'like', '%' . $request->search . '%');
            });
        }

        $attendance = $query->orderBy('clock_in', 'desc')->paginate(15);

        // Calculate basic stats for the dashboard view
        $stats = [
            'present' => HrmAttendance::whereDate('attendance_date', $date)->where('status', 'Present')->count(),
            'late' => HrmAttendance::whereDate('attendance_date', $date)->where('status', 'Late')->count(),
            'absent' => HrmAttendance::whereDate('attendance_date', $date)->where('status', 'Absent')->count(),
        ];

        return Inertia::render('HumanResource/Attendance/Index', [
            'attendance' => $attendance,
            'filters' => array_merge($request->only(['search']), ['date' => $date]),
            'stats' => $stats
        ]);
    }

    /**
     * Show form to manually add attendance.
     */
    public function create()
    {
        return Inertia::render('HumanResource/Attendance/Create', [
            'employees' => HrmEmployee::select('id', 'first_name', 'last_name', 'employee_code')
                ->where('status', 'Active')
                ->get()
        ]);
    }

    /**
     * Store manual attendance record.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:hrm_employees,id',
            'attendance_date' => 'required|date',
            'clock_in' => 'nullable|date_format:H:i',
            'clock_out' => 'nullable|date_format:H:i|after:clock_in',
            'status' => 'required|in:Present,Absent,Late,Leave,Holiday',
            'remarks' => 'nullable|string'
        ]);

        // Merge date and time for DB storage
        $clockIn = $validated['clock_in'] ? $validated['attendance_date'] . ' ' . $validated['clock_in'] : null;
        $clockOut = $validated['clock_out'] ? $validated['attendance_date'] . ' ' . $validated['clock_out'] : null;

        // Calculate hours worked
        $hours = 0;
        if ($clockIn && $clockOut) {
            $start = Carbon::parse($clockIn);
            $end = Carbon::parse($clockOut);
            $hours = $end->diffInMinutes($start) / 60;
        }

        HrmAttendance::updateOrCreate(
            [
                'employee_id' => $validated['employee_id'],
                'attendance_date' => $validated['attendance_date']
            ],
            [
                'clock_in' => $clockIn,
                'clock_out' => $clockOut,
                'hours_worked' => round($hours, 2),
                'status' => $validated['status'],
                'remarks' => $validated['remarks']
            ]
        );

        return redirect()->route('humanresurces1.index')
            ->with('success', 'Attendance recorded successfully.');
    }

    /**
     * Quick Action: Clock In (e.g. from Kiosk/Admin panel).
     */
    public function clockIn(Request $request)
    {
        $request->validate(['employee_code' => 'required|exists:hrm_employees,employee_code']);

        $employee = HrmEmployee::where('employee_code', $request->employee_code)->first();
        $now = Carbon::now();

        // Check if already clocked in today
        $attendance = HrmAttendance::firstOrCreate(
            ['employee_id' => $employee->id, 'attendance_date' => $now->toDateString()],
            ['status' => 'Present'] // Default status
        );

        if ($attendance->clock_in) {
            return back()->with('error', 'Employee already clocked in today.');
        }

        // Determine if Late (e.g., after 8:00 AM) - Configurable logic
        $status = $now->format('H:i') > '08:15' ? 'Late' : 'Present';

        $attendance->update([
            'clock_in' => $now,
            'status' => $status
        ]);

        return back()->with('success', "Clocked IN: {$employee->first_name} at " . $now->format('H:i'));
    }

    /**
     * Quick Action: Clock Out.
     */
    public function clockOut(Request $request)
    {
        $request->validate(['employee_code' => 'required|exists:hrm_employees,employee_code']);

        $employee = HrmEmployee::where('employee_code', $request->employee_code)->first();
        $now = Carbon::now();

        $attendance = HrmAttendance::where('employee_id', $employee->id)
            ->where('attendance_date', $now->toDateString())
            ->first();

        if (!$attendance || !$attendance->clock_in) {
            return back()->with('error', 'Employee has not clocked in yet.');
        }

        // Calculate Hours
        $start = Carbon::parse($attendance->clock_in);
        $hours = $now->diffInMinutes($start) / 60;

        $attendance->update([
            'clock_out' => $now,
            'hours_worked' => round($hours, 2)
        ]);

        return back()->with('success', "Clocked OUT: {$employee->first_name}. Worked: " . round($hours, 2) . " hrs.");
    }

    // --- Import Functionality ---

    public function showImportForm()
    {
        return Inertia::render('HumanResource/Attendance/Import');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt,xlsx'
        ]);

        // Logic to parse CSV/Excel would go here using a library like maatwebsite/excel
        // For now, we return a simulated success message
        
        return redirect()->route('humanresurces1.index')
            ->with('success', 'Attendance data imported successfully (Simulation).');
    }
}