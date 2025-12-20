<?php

namespace App\Http\Controllers\HumanResource\Employee;

use App\Http\Controllers\Controller;
use App\Models\HumanResource\HrmEmployee;
use App\Models\HumanResource\HrmEmployeeJob;
use Illuminate\Http\Request;

class HrmEmployeeJobController extends Controller
{
    public function store(Request $request, HrmEmployee $employee)
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

        // If creating a new job, mark others as not current (History tracking)
        // For simplicity in this version, we assume one active job, but you can expand logic here.
        
        $employee->jobs()->create($validated);

        return back()->with('success', 'Job details saved successfully.');
    }

    public function update(Request $request, HrmEmployeeJob $job)
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