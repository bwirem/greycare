<?php

namespace App\Http\Controllers\HumanResource\Employee;

use App\Http\Controllers\Controller;
use App\Models\HumanResource\HrmEmployee;
use App\Models\HumanResource\HrmEmployeeContact;
use Illuminate\Http\Request;

class HrmEmployeeContactController extends Controller
{
    /**
     * Store a new contact/next of kin for the employee.
     * Route: POST /humanresurces0/{employee}/contacts
     */
    public function store(Request $request, HrmEmployee $employee)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'relationship' => 'required|string|max:50',
            'phone_number' => 'required|string|max:20',
            'is_next_of_kin' => 'boolean',
        ]);

        $employee->contacts()->create($validated);

        return back()->with('success', 'Contact added successfully.');
    }

    /**
     * Delete a contact record.
     * 
     * IMPORTANT: The method signature accepts $employee first, then $contact.
     * Route: DELETE /humanresurces0/{employee}/contacts/{contact}
     */
    public function destroy(HrmEmployee $employee, HrmEmployeeContact $contact)
    {
        // Optional: Security check to ensure contact belongs to this employee
        if ($contact->employee_id !== $employee->id) {
            abort(403, 'Unauthorized action.');
        }

        $contact->delete();
        
        return back()->with('success', 'Contact removed successfully.');
    }
}