<?php

namespace App\Http\Controllers\Hospital\Opd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Opd\Config\DoctorSpecialization;
use Illuminate\Support\Facades\Log;

class DoctorAssignmentController extends Controller
{
    /**
     * List users (doctors) and their current specialization.
     */
    public function index(Request $request)
    {
        // 1. Fetch Users (Ideally filter by Role 'Doctor' if you have roles implemented)
        // For now, we fetch all users or filter by those who might be doctors.
        $query = User::with('specialization');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
        }

        // 2. Fetch Specializations for the dropdown
        $specializations = DoctorSpecialization::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('SystemConfiguration/FacilitySetup/DoctorAssignment/Index', [
            'users' => $query->latest()->paginate(15),
            'specializations' => $specializations,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Update the user's specialization.
     */
    public function update(Request $request, User $user)
    {       

        $validated = $request->validate([
            'specialization_id' => 'nullable|exists:doctor_specializations,id',
        ]);       

        $user->update([
            'specialization_id' => $validated['specialization_id']
        ]);

        return redirect()->back()->with('success', 'Doctor assigned successfully.');
    }
}