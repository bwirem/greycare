<?php

namespace App\Http\Controllers\HumanResource\Employee;

use App\Http\Controllers\Controller;
use App\Models\HumanResource\HrmEmployee;
use App\Models\HumanResource\HrmEmployeeBanking;
use Illuminate\Http\Request;

class HrmEmployeeBankingController extends Controller
{
    public function store(Request $request, HrmEmployee $employee)
    {
        $validated = $request->validate([
            'bank_id' => 'required|exists:hrm_banks,id',
            'branch_name' => 'nullable|string',
            'account_number' => 'required|string',
            'account_name' => 'required|string',
        ]);

        $employee->banking()->create($validated);

        return back()->with('success', 'Bank details added.');
    }

    public function update(Request $request, HrmEmployeeBanking $banking)
    {
        $validated = $request->validate([
            'bank_id' => 'required|exists:hrm_banks,id',
            'branch_name' => 'nullable|string',
            'account_number' => 'required|string',
            'account_name' => 'required|string',
        ]);

        $banking->update($validated);

        return back()->with('success', 'Bank details updated.');
    }
}