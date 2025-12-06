<?php

namespace App\Http\Controllers\Theatre;

use App\Http\Controllers\Controller;
use App\Models\Theatre\TheatreProcedure;
use App\Models\Theatre\TheatreProcedureGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TheatreProcedureController extends Controller
{
    public function index(Request $request)
    {
        $query = TheatreProcedure::with('group');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        return Inertia::render('SystemConfiguration/TheatreSetup/Procedures/Index', [
            'procedures' => $query->latest()->paginate(10),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/TheatreSetup/Procedures/Create', [
            'groups' => TheatreProcedureGroup::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'theatre_procedure_group_id' => 'nullable|exists:theatre_procedure_groups,id',
            'bill_item_id' => 'nullable|integer'
        ]);

        TheatreProcedure::create($validated);

        return redirect()->route('systemconfiguration8.procedures.index')->with('success', 'Procedure created.');
    }

    public function edit($id)
    {
        return Inertia::render('SystemConfiguration/TheatreSetup/Procedures/Edit', [
            'procedure' => TheatreProcedure::findOrFail($id),
            'groups' => TheatreProcedureGroup::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $procedure = TheatreProcedure::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'theatre_procedure_group_id' => 'nullable|exists:theatre_procedure_groups,id',
            'bill_item_id' => 'nullable|integer'
        ]);

        $procedure->update($validated);

        return redirect()->route('systemconfiguration8.procedures.index')->with('success', 'Procedure updated.');
    }

    public function destroy($id)
    {
        TheatreProcedure::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Procedure deleted.');
    }
}