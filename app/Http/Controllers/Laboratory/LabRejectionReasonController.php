<?php

namespace App\Http\Controllers\Laboratory;

use App\Http\Controllers\Controller;
use App\Models\Laboratory\LabRejectionReason;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LabRejectionReasonController extends Controller
{
    public function index()
    {
        return Inertia::render('SystemConfiguration/LabSetup/Rejections/Index', [
            'rejections' => LabRejectionReason::latest()->paginate(10)
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/LabSetup/Rejections/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
        ]);

        LabRejectionReason::create($validated);

        return redirect()->route('systemconfiguration6.rejections.index')
            ->with('success', 'Rejection Reason created successfully.');
    }

    public function edit($id)
    {
        $reason = LabRejectionReason::findOrFail($id);
        return Inertia::render('SystemConfiguration/LabSetup/Rejections/Edit', ['reason' => $reason]);
    }

    public function update(Request $request, $id)
    {
        $reason = LabRejectionReason::findOrFail($id);
        $validated = $request->validate(['name' => 'required|string|max:255', 'code' => 'nullable|string|max:50']);
        $reason->update($validated);

        return redirect()->route('systemconfiguration6.rejections.index')->with('success', 'Updated successfully.');
    }

    public function destroy($id)
    {
        LabRejectionReason::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Deleted successfully.');
    }
}