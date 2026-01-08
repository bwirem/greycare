<?php

namespace App\Http\Controllers\HumanResource\Employee;

use App\Http\Controllers\Controller;
use App\Models\HumanResource\HrmEmployee;
use App\Models\HumanResource\HrmEmployeeJob;
use Illuminate\Http\Request;

class HrmEmployeeJobController extends Controller
{
    /**
     * Store a new job record for the employee.
     */
    public function store(Request $request, HrmEmployee $employee)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:hrm_departments,id',
            'position_id' => 'required|exists:hrm_positions,id',
            'hire_date' => 'required|date',
            'contract_end_date' => 'nullable|date|after:hire_date',
            'basic_salary' => 'required|numeric|min:0',
            'employment_type' => 'required|string', // e.g., Full-time, Contract
            'social_security_number' => 'nullable|string',
            'insurance_number' => 'nullable|string',
            'tax_identification_number' => 'nullable|string',
        ]);

        // Logic Note: In a complex system, you might want to set 
        // 'current_job' flags to false for previous records here.
        // For now, we simply create the new job entry.
        
        $employee->jobs()->create($validated);

        return back()->with('success', 'Job details saved successfully.');
    }

    /**
     * Update an existing job record.
     * 
     * IMPORTANT: The method signature must match the route parameters order.
     * Route: /humanresurces0/{employee}/jobs/{job}
     */
    public function update(Request $request, HrmEmployee $employee, HrmEmployeeJob $job)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:hrm_departments,id',
            'position_id' => 'required|exists:hrm_positions,id',
            'hire_date' => 'required|date',
            'contract_end_date' => 'nullable|date|after:hire_date',
            'basic_salary' => 'required|numeric|min:0',
            'employment_type' => 'required|string',
            'social_security_number' => 'nullable|string',
            'insurance_number' => 'nullable|string',
            'tax_identification_number' => 'nullable|string',
        ]);

        $job->update($validated);

        return back()->with('success', 'Job details updated.');
    }
}