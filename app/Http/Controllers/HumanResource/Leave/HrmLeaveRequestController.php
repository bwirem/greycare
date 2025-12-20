<?php

namespace App\Http\Controllers\HumanResource\Leave;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

// Models
use App\Models\HumanResource\HrmLeaveRequest;
use App\Models\HumanResource\HrmLeaveType;
use App\Models\HumanResource\HrmEmployee;

class HrmLeaveRequestController extends Controller
{
    /**
     * List Leave Requests
     */
    public function index(Request $request)
    {
        $query = HrmLeaveRequest::with(['employee', 'leaveType']);

        if ($request->filled('search')) {
            $query->whereHas('employee', function($q) use ($request) {
                $q->where('first_name', 'like', '%' . $request->search . '%')
                  ->orWhere('last_name', 'like', '%' . $request->search . '%')
                  ->orWhere('employee_code', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $requests = $query->orderBy('created_at', 'desc')->paginate(10);

        // Stats for Dashboard
        $stats = [
            'pending' => HrmLeaveRequest::where('status', 'Pending')->count(),
            'approved' => HrmLeaveRequest::where('status', 'Approved')->count(),
            'on_leave' => HrmLeaveRequest::where('status', 'Approved')
                ->whereDate('start_date', '<=', Carbon::today())
                ->whereDate('end_date', '>=', Carbon::today())
                ->count(),
        ];

        return Inertia::render('HumanResource/Leave/Index', [
            'requests' => $requests,
            'filters' => $request->only(['search', 'status']),
            'stats' => $stats
        ]);
    }

    /**
     * Show Create Form
     */
    public function create()
    {
        return Inertia::render('HumanResource/Leave/Create', [
            'employees' => HrmEmployee::select('id', 'first_name', 'last_name', 'employee_code')
                ->where('status', 'Active')->get(),
            'leaveTypes' => HrmLeaveType::all(),
        ]);
    }

    /**
     * Store Request
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:hrm_employees,id',
            'leave_type_id' => 'required|exists:hrm_leave_types,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string',
        ]);

        // Calculate Days (Simple calculation, ideally should exclude weekends/holidays)
        $start = Carbon::parse($validated['start_date']);
        $end = Carbon::parse($validated['end_date']);
        $days = $start->diffInDays($end) + 1; 

        HrmLeaveRequest::create([
            'employee_id' => $validated['employee_id'],
            'leave_type_id' => $validated['leave_type_id'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'days_requested' => $days,
            'reason' => $validated['reason'],
            'status' => 'Pending'
        ]);

        return redirect()->route('humanresurces5.index')
            ->with('success', 'Leave request submitted successfully.');
    }

    /**
     * Edit Request
     */
    public function edit(HrmLeaveRequest $leave)
    {
        if ($leave->status !== 'Pending') {
            return back()->with('error', 'Cannot edit a request that has already been processed.');
        }

        return Inertia::render('HumanResource/Leave/Edit', [
            'leave' => $leave,
            'leaveTypes' => HrmLeaveType::all(),
        ]);
    }

    /**
     * Update Request
     */
    public function update(Request $request, HrmLeaveRequest $leave)
    {
        $validated = $request->validate([
            'leave_type_id' => 'required|exists:hrm_leave_types,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string',
        ]);

        $start = Carbon::parse($validated['start_date']);
        $end = Carbon::parse($validated['end_date']);
        $days = $start->diffInDays($end) + 1;

        $leave->update(array_merge($validated, ['days_requested' => $days]));

        return redirect()->route('humanresurces5.index')
            ->with('success', 'Leave request updated.');
    }

    /**
     * Admin Action: Approve
     */
    public function approve(Request $request, HrmLeaveRequest $leave)
    {
        $leave->update([
            'status' => 'Approved',
            'admin_remarks' => $request->input('remarks', 'Approved'),
            'approved_by' => Auth::id() // Assuming User ID
        ]);

        // Optional: Update Employee Status to 'OnLeave'
        // $leave->employee->update(['status' => 'OnLeave']);

        return back()->with('success', 'Leave Approved.');
    }

    /**
     * Admin Action: Reject
     */
    public function reject(Request $request, HrmLeaveRequest $leave)
    {
        $leave->update([
            'status' => 'Rejected',
            'admin_remarks' => $request->input('remarks', 'Rejected'),
            'approved_by' => Auth::id()
        ]);

        return back()->with('success', 'Leave Rejected.');
    }

    /**
     * Delete
     */
    public function destroy(HrmLeaveRequest $leave)
    {
        $leave->delete();
        return back()->with('success', 'Request deleted.');
    }
}