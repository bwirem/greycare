<?php
namespace App\Http\Controllers;

use App\Models\UserGroup;
use App\Enums\StaffCategory; // Import Enum
use Illuminate\Http\Request;

class UserGroupController extends Controller
{
    public function index(Request $request)
    {
        $query = UserGroup::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $usergroups = $query->orderBy('created_at', 'desc')->paginate(50);

        return inertia('UserManagement/UserGroups/Index', [
            'usergroups' => $usergroups,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return inertia('UserManagement/UserGroups/Create', [
            'staffCategories' => StaffCategory::getOptions()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'staffcategory' => 'required|integer', // Added validation
        ]);

        UserGroup::create($validated);

        return redirect()->route('usermanagement.usergroups.index')
            ->with('success', 'Role created successfully.');
    }

    public function edit(UserGroup $usergroup)
    {
        return inertia('UserManagement/UserGroups/Edit', [
            'usergroup' => $usergroup,
            'staffCategories' => StaffCategory::getOptions()
        ]);
    }

    public function update(Request $request, UserGroup $usergroup)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255', 
            'staffcategory' => 'required|integer', // Added validation           
        ]);

        $usergroup->update($validated);

        return redirect()->route('usermanagement.usergroups.index')
            ->with('success', 'Role updated successfully.');
    }

    public function destroy(UserGroup $usergroup)
    {
        $usergroup->delete();

        return redirect()->route('usermanagement.usergroups.index')
            ->with('success', 'Role deleted successfully.');
    }
}