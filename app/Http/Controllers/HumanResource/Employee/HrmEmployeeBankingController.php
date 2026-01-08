<?php

namespace App\Http\Controllers\HumanResource\Employee;

use App\Http\Controllers\Controller;
use App\Models\HumanResource\HrmEmployee;
use App\Models\HumanResource\HrmEmployeeBanking;
use Illuminate\Http\Request;

class HrmEmployeeBankingController extends Controller
{
    /**
     * Store new banking details for an employee.
     */
    public function store(Request $request, HrmEmployee $employee)
    {
        $validated = $request->validate([
            'bank_id' => 'required|exists:hrm_banks,id',
            'branch_name' => 'nullable|string|max:100',
            'account_number' => 'required|string|max:50',
            'account_name' => 'required|string|max:100',
        ]);

        $employee->banking()->create($validated);

        return back()->with('success', 'Bank details added successfully.');
    }

    /**
     * Update existing banking details.
     * 
     * IMPORTANT: The method signature accepts $employee first, then $banking.
     * This matches the route: /humanresurces0/{employee}/banking/{banking}
     */
    public function update(Request $request, HrmEmployee $employee, HrmEmployeeBanking $banking)
    {
        $validated = $request->validate([
            'bank_id' => 'required|exists:hrm_banks,id',
            'branch_name' => 'nullable|string|max:100',
            'account_number' => 'required|string|max:50',
            'account_name' => 'required|string|max:100',
        ]);

        $banking->update($validated);

        return back()->with('success', 'Bank details updated successfully.');
    }
}