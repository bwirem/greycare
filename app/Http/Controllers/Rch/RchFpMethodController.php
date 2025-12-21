<?php

namespace App\Http\Controllers\Rch;

use App\Http\Controllers\Controller;
use App\Models\Rch\RchFpMethod;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RchFpMethodController extends Controller
{
    public function index()
    {
        return Inertia::render('SystemConfiguration/RchSetup/FpMethods/Index', [
            'methods' => RchFpMethod::latest()->paginate(10)
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/RchSetup/FpMethods/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:rch_fp_methods,code',
            'type' => 'required|string|max:100', // e.g. Hormonal, Barrier
        ]);

        RchFpMethod::create($validated);
        return redirect()->route('systemconfiguration14.fpmethods.index')->with('success', 'Method created successfully.');
    }

    public function edit($id)
    {
        return Inertia::render('SystemConfiguration/RchSetup/FpMethods/Edit', [
            'method' => RchFpMethod::findOrFail($id)
        ]);
    }

    public function update(Request $request, $id)
    {
        $method = RchFpMethod::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:rch_fp_methods,code,' . $id,
            'type' => 'required|string|max:100',
            'is_active' => 'boolean'
        ]);

        $method->update($validated);
        return redirect()->route('systemconfiguration14.fpmethods.index')->with('success', 'Method updated successfully.');
    }

    public function destroy($id)
    {
        RchFpMethod::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Method deleted.');
    }
}