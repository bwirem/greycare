<?php

namespace App\Http\Controllers\BloodBank;

use App\Http\Controllers\Controller;
use App\Models\BloodBank\BbComponentType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BbComponentTypeController extends Controller
{
    public function index()
    {
        return Inertia::render('SystemConfiguration/BloodBankSetup/Components/Index', [
            'components' => BbComponentType::latest()->paginate(10)
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/BloodBankSetup/Components/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:bb_component_types,code',
            'shelf_life_days' => 'required|integer|min:1',
            'bill_item_id' => 'nullable|integer'
        ]);

        BbComponentType::create($validated);

        return redirect()->route('systemconfiguration10.components.index')->with('success', 'Component Type created.');
    }

    public function edit($id)
    {
        return Inertia::render('SystemConfiguration/BloodBankSetup/Components/Edit', [
            'component' => BbComponentType::findOrFail($id)
        ]);
    }

    public function update(Request $request, $id)
    {
        $component = BbComponentType::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:bb_component_types,code,'.$id,
            'shelf_life_days' => 'required|integer|min:1',
            'bill_item_id' => 'nullable|integer'
        ]);

        $component->update($validated);

        return redirect()->route('systemconfiguration10.components.index')->with('success', 'Updated.');
    }

    public function destroy($id)
    {
        BbComponentType::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Deleted.');
    }
}