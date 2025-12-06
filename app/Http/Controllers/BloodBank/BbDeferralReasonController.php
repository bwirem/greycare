<?php

namespace App\Http\Controllers\BloodBank;

use App\Http\Controllers\Controller;
use App\Models\BloodBank\BbDeferralReason;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BbDeferralReasonController extends Controller
{
    public function index()
    {
        return Inertia::render('SystemConfiguration/BloodBankSetup/Deferrals/Index', [
            'deferrals' => BbDeferralReason::latest()->paginate(10)
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/BloodBankSetup/Deferrals/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:Temporary,Permanent',
            'deferral_days' => 'required|integer|min:0',
        ]);

        BbDeferralReason::create($validated);
        return redirect()->route('systemconfiguration10.deferrals.index')->with('success', 'Reason created.');
    }

    public function edit($id)
    {
        return Inertia::render('SystemConfiguration/BloodBankSetup/Deferrals/Edit', [
            'deferral' => BbDeferralReason::findOrFail($id)
        ]);
    }

    public function update(Request $request, $id)
    {
        $reason = BbDeferralReason::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:Temporary,Permanent',
            'deferral_days' => 'required|integer|min:0',
        ]);
        $reason->update($validated);
        return redirect()->route('systemconfiguration10.deferrals.index')->with('success', 'Updated.');
    }

    public function destroy($id)
    {
        BbDeferralReason::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Deleted.');
    }
}