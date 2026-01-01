<?php

namespace App\Http\Controllers\Hospital\Opd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\UserGroup; // Import UserGroup Model
use App\Models\Opd\Config\DoctorSpecialization;
use Illuminate\Support\Facades\Log;

class DoctorAssignmentController extends Controller
{
    /**
     * List users (doctors) and their current specialization.
     */
    public function index(Request $request)
    {
        // 1. Fetch Users with relationships
        $query = User::with(['specialization', 'userGroup']);

        // 2. Text Search
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        // 3. User Group Filter (NEW)
        if ($request->usergroup_id) {
            $query->where('usergroup_id', $request->usergroup_id);
        }

        // 4. Fetch Dropdown Data
        $specializations = DoctorSpecialization::select('id', 'name')->orderBy('name')->get();
        $userGroups = UserGroup::select('id', 'name')->orderBy('name')->get(); // Fetch Groups

        return Inertia::render('SystemConfiguration/FacilitySetup/DoctorAssignment/Index', [
            // Add withQueryString() to keep filters during pagination
            'users' => $query->latest()->paginate(15)->withQueryString(), 
            'specializations' => $specializations,
            'userGroups' => $userGroups, // Pass to view
            'filters' => $request->only(['search', 'usergroup_id']), // Pass active filters
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