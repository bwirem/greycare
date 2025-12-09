<?php

namespace App\Http\Controllers\BloodBank;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// Models
use App\Models\BloodBank\BbBloodBag;
use App\Models\BloodBank\BbDiscard;

class BbInventoryController extends Controller
{
    /**
     * Dashboard: Stock Summary
     */
    public function index()
    {
        // Group by Component Type and Blood Group
        $stock = BbBloodBag::select('bb_component_type_id', 'blood_group', DB::raw('count(*) as count'))
            ->where('status', 'Available')
            ->where('expires_at', '>', now())
            ->with('componentType') // Assuming relationship exists in BbBloodBag model
            ->groupBy('bb_component_type_id', 'blood_group')
            ->get();

        return Inertia::render('BloodBank/Inventory/Index', [
            'stock' => $stock
        ]);
    }

    /**
     * List all Bags (Filtrable)
     */
    public function bags(Request $request)
    {
        $query = BbBloodBag::with(['componentType', 'donation.donor']);

        if ($request->status) {
            $query->where('status', $request->status);
        } else {
            // Default show valid bags
            $query->whereIn('status', ['Available', 'Quarantine', 'Reserved']);
        }

        if ($request->blood_group) {
            $query->where('blood_group', $request->blood_group);
        }

        return Inertia::render('BloodBank/Inventory/Bags', [
            'bags' => $query->orderBy('expires_at', 'asc')->paginate(20)->withQueryString(),
            'filters' => $request->only(['status', 'blood_group'])
        ]);
    }

    /**
     * Discard a Bag (Expired, Broken, unsafe)
     */
    public function discard(Request $request, BbBloodBag $bag)
    {
        $request->validate([
            'reason' => 'required|string',
            'remarks' => 'nullable|string'
        ]);

        DB::transaction(function () use ($request, $bag) {
            // 1. Log Discard
            BbDiscard::create([
                'bb_blood_bag_id' => $bag->id,
                'reason_category' => $request->reason,
                'remarks' => $request->remarks,
                'disposed_by' => Auth::id(),
                'disposed_at' => now()
            ]);

            // 2. Update Bag Status
            $bag->update(['status' => 'Discarded']);
        });

        return redirect()->back()->with('success', 'Blood bag discarded successfully.');
    }
}