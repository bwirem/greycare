<?php

namespace App\Http\Controllers\Laboratory;

use App\Http\Controllers\Controller;
use App\Models\Laboratory\LabNatureOfSample;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LabNatureOfSampleController extends Controller
{
    public function index()
    {
        return Inertia::render('SystemConfiguration/LabSetup/Samples/Index', [
            'samples' => LabNatureOfSample::latest()->paginate(10)
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/LabSetup/Samples/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:lab_nature_of_samples,name',
            'code' => 'nullable|string|max:50',
        ]);

        LabNatureOfSample::create($validated);

        return redirect()->route('systemconfiguration6.samples.index')
            ->with('success', 'Sample Type created successfully.');
    }

    public function edit($id)
    {
        $sample = LabNatureOfSample::findOrFail($id);
        return Inertia::render('SystemConfiguration/LabSetup/Samples/Edit', [
            'sample' => $sample
        ]);
    }

    public function update(Request $request, $id)
    {
        $sample = LabNatureOfSample::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:lab_nature_of_samples,name,'.$id,
            'code' => 'nullable|string|max:50',
        ]);

        $sample->update($validated);

        return redirect()->route('systemconfiguration6.samples.index')
            ->with('success', 'Sample Type updated successfully.');
    }

    public function destroy($id)
    {
        $sample = LabNatureOfSample::findOrFail($id);
        $sample->delete();

        return redirect()->back()->with('success', 'Sample Type deleted.');
    }
}