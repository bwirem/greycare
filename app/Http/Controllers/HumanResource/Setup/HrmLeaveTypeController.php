<?php

namespace App\Http\Controllers\HumanResource\Setup;

use App\Http\Controllers\Controller;
use App\Models\HumanResource\HrmLeaveType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HrmLeaveTypeController extends Controller
{
    /**
     * Display a listing of leave types.
     */
    public function index(Request $request)
    {
        $query = HrmLeaveType::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $types = $query->orderBy('name', 'asc')->paginate(10);

        return Inertia::render('SystemConfiguration/LeaveSetup/LeaveTypes/Index', [
            'types' => $types,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new leave type.
     */
    public function create()
    {
        return Inertia::render('SystemConfiguration/LeaveSetup/LeaveTypes/Create');
    }

    /**
     * Store a newly created leave type.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:hrm_leave_types',
            'days_per_year' => 'required|integer|min:0',
            'description' => 'nullable|string',
        ]);

        HrmLeaveType::create($validated);

        return redirect()->route('systemconfiguration13.leavetypes.index')
            ->with('success', 'Leave Type created successfully.');
    }

    /**
     * Show the form for editing the specified leave type.
     */
    public function edit(HrmLeaveType $leavetype)
    {
        return Inertia::render('SystemConfiguration/LeaveSetup/LeaveTypes/Edit', [
            'type' => $leavetype,
        ]);
    }

    /**
     * Update the specified leave type.
     */
    public function update(Request $request, HrmLeaveType $leavetype)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:hrm_leave_types,name,' . $leavetype->id,
            'days_per_year' => 'required|integer|min:0',
            'description' => 'nullable|string',
        ]);

        $leavetype->update($validated);

        return redirect()->route('systemconfiguration13.leavetypes.index')
            ->with('success', 'Leave Type updated successfully.');
    }

    /**
     * Remove the specified leave type.
     */
    public function destroy(HrmLeaveType $leavetype)
    {
        // Optional: Check if used in requests before deleting
        if($leavetype->requests()->exists()) { // Assuming relationship exists in model
             return back()->with('error', 'Cannot delete. This leave type is attached to existing requests.');
        }

        $leavetype->delete();

        return redirect()->route('systemconfiguration13.leavetypes.index')
            ->with('success', 'Leave Type deleted successfully.');
    }
}