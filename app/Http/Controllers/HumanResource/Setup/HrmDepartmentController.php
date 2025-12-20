<?php

namespace App\Http\Controllers\HumanResource\Setup;

use App\Http\Controllers\Controller;
use App\Models\HumanResource\HrmDepartment; // Ensure you create this Model
use Illuminate\Http\Request;
use Inertia\Inertia;

class HrmDepartmentController extends Controller
{
    public function index(Request $request)
    {
        $query = HrmDepartment::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('code', 'like', '%' . $request->search . '%');
        }

        $departments = $query->orderBy('name', 'asc')->paginate(10);

        return Inertia::render('SystemConfiguration/HrSetup/Departments/Index', [
            'departments' => $departments,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/HrSetup/Departments/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:hrm_departments',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        HrmDepartment::create($validated);

        return redirect()->route('systemconfiguration11.departments.index')
            ->with('success', 'Department created successfully.');
    }

    public function edit(HrmDepartment $department)
    {
        return Inertia::render('SystemConfiguration/HrSetup/Departments/Edit', [
            'department' => $department,
        ]);
    }

    public function update(Request $request, HrmDepartment $department)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:hrm_departments,code,' . $department->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $department->update($validated);

        return redirect()->route('systemconfiguration11.departments.index')
            ->with('success', 'Department updated successfully.');
    }

    public function destroy(HrmDepartment $department)
    {
        $department->delete();
        return redirect()->route('systemconfiguration11.departments.index')
            ->with('success', 'Department deleted successfully.');
    }
}