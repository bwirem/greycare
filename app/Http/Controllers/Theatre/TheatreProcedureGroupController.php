<?php

namespace App\Http\Controllers\Theatre;

use App\Http\Controllers\Controller;
use App\Models\Theatre\TheatreProcedureGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TheatreProcedureGroupController extends Controller
{
    public function index()
    {
        return Inertia::render('SystemConfiguration/TheatreSetup/Groups/Index', [
            'groups' => TheatreProcedureGroup::withCount('procedures')->latest()->paginate(10)
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/TheatreSetup/Groups/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'is_major' => 'boolean',
            'is_minor' => 'boolean',
        ]);

        TheatreProcedureGroup::create($validated);

        return redirect()->route('systemconfiguration8.groups.index')->with('success', 'Group created.');
    }

    public function edit($id)
    {
        return Inertia::render('SystemConfiguration/TheatreSetup/Groups/Edit', [
            'group' => TheatreProcedureGroup::findOrFail($id)
        ]);
    }

    public function update(Request $request, $id)
    {
        $group = TheatreProcedureGroup::findOrFail($id);
        $group->update($request->validate([
            'name' => 'required|string|max:255', 
            'code' => 'nullable|string|max:50',
            'is_major' => 'boolean',
            'is_minor' => 'boolean',
        ]));
        
        return redirect()->route('systemconfiguration8.groups.index')->with('success', 'Group updated.');
    }

    public function destroy($id)
    {
        TheatreProcedureGroup::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Group deleted.');
    }
}