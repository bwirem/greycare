<?php

namespace App\Http\Controllers\HumanResource\Setup;

use App\Http\Controllers\Controller;
use App\Models\HumanResource\HrmPosition; // Ensure you create this Model
use Illuminate\Http\Request;
use Inertia\Inertia;

class HrmPositionController extends Controller
{
    public function index(Request $request)
    {
        $query = HrmPosition::query();

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('code', 'like', '%' . $request->search . '%');
        }

        $positions = $query->orderBy('title', 'asc')->paginate(10);

        return Inertia::render('SystemConfiguration/HrSetup/Positions/Index', [
            'positions' => $positions,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/HrSetup/Positions/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:hrm_positions',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        HrmPosition::create($validated);

        return redirect()->route('systemconfiguration11.positions.index')
            ->with('success', 'Position created successfully.');
    }

    public function edit(HrmPosition $position)
    {
        return Inertia::render('SystemConfiguration/HrSetup/Positions/Edit', [
            'position' => $position,
        ]);
    }

    public function update(Request $request, HrmPosition $position)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:hrm_positions,code,' . $position->id,
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $position->update($validated);

        return redirect()->route('systemconfiguration11.positions.index')
            ->with('success', 'Position updated successfully.');
    }

    public function destroy(HrmPosition $position)
    {
        $position->delete();
        return redirect()->route('systemconfiguration11.positions.index')
            ->with('success', 'Position deleted successfully.');
    }
}