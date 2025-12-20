<?php

namespace App\Http\Controllers\HumanResource\Employee;

use App\Http\Controllers\Controller;
use App\Models\HumanResource\HrmEmployee;
use App\Models\HumanResource\HrmEmployeeContact;
use Illuminate\Http\Request;

class HrmEmployeeContactController extends Controller
{
    public function store(Request $request, HrmEmployee $employee)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'relationship' => 'required|string',
            'phone_number' => 'required|string',
            'is_next_of_kin' => 'boolean',
        ]);

        $employee->contacts()->create($validated);

        return back()->with('success', 'Contact added.');
    }

    public function destroy(HrmEmployeeContact $contact)
    {
        $contact->delete();
        return back()->with('success', 'Contact removed.');
    }
}