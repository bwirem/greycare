<?php

namespace App\Http\Controllers\HumanResource\Employee;

use App\Http\Controllers\Controller;
use App\Models\HumanResource\HrmEmployee;
use App\Models\HumanResource\HrmDepartment;
use App\Models\HumanResource\HrmPosition;
use App\Models\HumanResource\HrmBank;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class HrmEmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = HrmEmployee::query()->with(['currentJob.department', 'currentJob.position']);

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('first_name', 'like', '%' . $request->search . '%')
                  ->orWhere('last_name', 'like', '%' . $request->search . '%')
                  ->orWhere('employee_code', 'like', '%' . $request->search . '%')
                  ->orWhere('national_id', 'like', '%' . $request->search . '%');
            });
        }

        $employees = $query->orderBy('first_name', 'asc')->paginate(10);

        return Inertia::render('HumanResource/Employee/Index', [
            'employees' => $employees,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('HumanResource/Employee/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'other_names' => 'nullable|string|max:100',
            'employee_code' => 'required|string|unique:hrm_employees,employee_code',
            'gender' => 'required|in:Male,Female,Other',
            'date_of_birth' => 'nullable|date',
            'national_id' => 'nullable|string|max:50',
            'phone_number' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:150',
            'address' => 'nullable|string',
            'marital_status' => 'nullable|string',
            'photo' => 'nullable|image|max:2048', // 2MB Max
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo_path'] = $request->file('photo')->store('employees', 'public');
        }

        $employee = HrmEmployee::create($validated);

        // Redirect to Edit page to fill Job/Bank details
        return redirect()->route('humanresurces0.edit', $employee->id)
            ->with('success', 'Employee created. Please add Job and Banking details.');
    }

    public function edit(HrmEmployee $employee)
    {
        // Load relationships for the tabs
        $employee->load(['jobs', 'banking', 'contacts']);

        return Inertia::render('HumanResource/Employee/Edit', [
            'employee' => $employee,
            // Pass lookup data for the dropdowns in child tabs
            'departments' => HrmDepartment::select('id', 'name')->get(),
            'positions' => HrmPosition::select('id', 'title')->get(),
            'banks' => HrmBank::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, HrmEmployee $employee)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'other_names' => 'nullable|string|max:100',
            'gender' => 'required|in:Male,Female,Other',
            'date_of_birth' => 'nullable|date',
            'national_id' => 'nullable|string|max:50',
            'phone_number' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:150',
            'address' => 'nullable|string',
            'marital_status' => 'nullable|string',
            'status' => 'required|in:Active,Terminated,Resigned,OnLeave',
        ]);

        // Handle Photo Update
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($employee->photo_path) {
                Storage::disk('public')->delete($employee->photo_path);
            }
            $validated['photo_path'] = $request->file('photo')->store('employees', 'public');
        }

        $employee->update($validated);

        return back()->with('success', 'Bio Data updated successfully.');
    }

    public function destroy(HrmEmployee $employee)
    {
        if ($employee->photo_path) {
            Storage::disk('public')->delete($employee->photo_path);
        }
        $employee->delete();
        return redirect()->route('humanresurces0.index')->with('success', 'Employee record deleted.');
    }
}