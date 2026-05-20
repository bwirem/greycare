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
use App\Models\BloodBank\BbComponentType; // Make sure to import this

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

        $component_types = BbComponentType::select('id', 'name')->get();

        return Inertia::render('BloodBank/Inventory/Index', [
            'stock' => $stock,
            'component_types' => $component_types
        ]);
    }

    /**
     * Receive Bag from National Blood Bank (External)
     */
    public function receiveExternal(Request $request)
    {
        $request->validate([
            'bag_serial_number' => 'required|string|unique:bb_blood_bags,bag_serial_number',
            'blood_group' => 'required|string|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'bb_component_type_id' => 'required|exists:bb_component_types,id',
            'collected_at' => 'required|date|before_or_equal:today',
            'expires_at' => 'required|date|after:today',
        ]);

        BbBloodBag::create([
            'bb_donation_id' => 1,//null, // Null because it didn't come from a local donor
            'bb_component_type_id' => $request->bb_component_type_id,
            'bag_serial_number' => $request->bag_serial_number,
            'blood_group' => $request->blood_group,
            'collected_at' => $request->collected_at,
            'expires_at' => $request->expires_at,
            'status' => 'Available', // National Bank bags are pre-tested
            'location' => 'Main Bank'
        ]);

        return redirect()->back()->with('success', 'External bag received successfully and added to stock.');
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