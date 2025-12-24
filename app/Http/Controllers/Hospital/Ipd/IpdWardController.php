<?php

namespace App\Http\Controllers\Hospital\Ipd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr; // Helper to separate price data
use Inertia\Inertia;

// Models
use App\Models\Ipd\IpdWard;
use App\Models\Billing\BLSItem;
use App\Models\Billing\BLSItemGroup;
use App\Models\Billing\BLSPriceCategory;

class IpdWardController extends Controller
{
    /**
     * Helper to get active price categories (Price1, Price2, etc.)
     */
    private function getActivePriceCategories()
    {
        $activePriceCategories = [];
        $priceCategorySettings = BLSPriceCategory::first();

        if ($priceCategorySettings) {
            for ($i = 1; $i <= 4; $i++) {
                if ($priceCategorySettings->{'useprice' . $i}) {
                    $activePriceCategories[] = [
                        'key' => 'price' . $i,
                        'label' => $priceCategorySettings->{'price' . $i},
                    ];
                }
            }
        }
        
        if (empty($activePriceCategories)) {
            $activePriceCategories[] = ['key' => 'price1', 'label' => 'Price'];
        }

        return $activePriceCategories;
    }

    /**
     * Display a listing of wards.
     */
    public function index(Request $request)
    {
        // Eager load 'blsItem' so we can show the price in the list
        $query = IpdWard::with('blsItem');

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        return Inertia::render('SystemConfiguration/FacilitySetup/Wards/Index', [
            'wards' => $query->orderBy('name')->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
            'success' => session('success'),
        ]);
    }

    /**
     * Show the form for creating a new ward.
     */
    public function create()
    {
        return Inertia::render('SystemConfiguration/FacilitySetup/Wards/Create', [
            'activePriceCategories' => $this->getActivePriceCategories(),
        ]);
    }

    /**
     * Store a newly created ward and its daily charge.
     */
    public function store(Request $request)
    {
        // 1. Validate Ward Details + Prices
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:ipd_wards,name',
            //'type' => 'nullable|string|max:50', // e.g. General, Private
            //'gender' => 'nullable|string|in:Male,Female,Mixed',
            
            // Prices (Daily Charges)
            'price1' => 'nullable|numeric|min:0',
            'price2' => 'nullable|numeric|min:0',
            'price3' => 'nullable|numeric|min:0',
            'price4' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $request) {
            
            // A. Separate Data (Remove prices from Ward creation)
            $wardData = Arr::except($validated, ['price1', 'price2', 'price3', 'price4']);
            
            // Create Ward
            $ward = IpdWard::create($wardData);

            // B. Create Billing Item automatically
            // Ensure an 'Accommodation' or 'Hospital Charges' group exists
            $itemGroup = BLSItemGroup::firstOrCreate(['name' => 'Accommodation']);

            BLSItem::create([
                'name' => $ward->name . ' (Daily Charge)', // Distinct name for billing
                'itemgroup_id' => $itemGroup->id,
                'ipd_ward_id' => $ward->id, // Link to the new Ward
                
                // Set Prices
                'price1' => $request->input('price1', 0),
                'price2' => $request->input('price2', 0),
                'price3' => $request->input('price3', 0),
                'price4' => $request->input('price4', 0),
                
                'addtocart' => true, // Allow manual addition if needed
                'defaultqty' => 1,
            ]);
        });

        return redirect()->route('systemconfiguration5.wards.index')
            ->with('success', 'Ward and Daily Charge created successfully.');
    }

    /**
     * Show the form for editing the ward.
     */
    public function edit($id)
    {
        // Load the linked billing item to populate prices in the form
        $ward = IpdWard::with('blsItem')->findOrFail($id);

        return Inertia::render('SystemConfiguration/FacilitySetup/Wards/Edit', [
            'ward' => $ward,
            'activePriceCategories' => $this->getActivePriceCategories(),
        ]);
    }

    /**
     * Update the ward and its prices.
     */
    public function update(Request $request, $id)
    {
        $ward = IpdWard::with('blsItem')->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:ipd_wards,name,' . $id,
            //'type' => 'nullable|string|max:50',
            //'gender' => 'nullable|string|in:Male,Female,Mixed',
            
            'price1' => 'nullable|numeric|min:0',
            'price2' => 'nullable|numeric|min:0',
            'price3' => 'nullable|numeric|min:0',
            'price4' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($ward, $validated, $request) {
            
            // A. Update Ward
            $wardData = Arr::except($validated, ['price1', 'price2', 'price3', 'price4']);
            $ward->update($wardData);

            // B. Update Linked Billing Item
            if ($ward->blsItem) {
                $blsData = [
                    'name' => $ward->name . ' (Daily Charge)', // Keep name synced
                ];

                // Update prices if present
                if ($request->has('price1')) $blsData['price1'] = $request->input('price1');
                if ($request->has('price2')) $blsData['price2'] = $request->input('price2');
                if ($request->has('price3')) $blsData['price3'] = $request->input('price3');
                if ($request->has('price4')) $blsData['price4'] = $request->input('price4');

                $ward->blsItem->update($blsData);
            } else {
                // Fallback: If billing item was missing, create it now
                $itemGroup = BLSItemGroup::firstOrCreate(['name' => 'Accommodation']);
                $ward->blsItem()->create([
                    'name' => $ward->name . ' (Daily Charge)',
                    'itemgroup_id' => $itemGroup->id,
                    'ipd_ward_id' => $ward->id,
                    'price1' => $request->input('price1', 0),
                    'price2' => $request->input('price2', 0),
                    'price3' => $request->input('price3', 0),
                    'price4' => $request->input('price4', 0),
                    'addtocart' => true,
                    'defaultqty' => 1,
                ]);
            }
        });

        return redirect()->route('systemconfiguration5.wards.index')
            ->with('success', 'Ward updated successfully.');
    }

    /**
     * Delete the ward and its billing item.
     */
    public function destroy($id)
    {
        $ward = IpdWard::with('blsItem')->findOrFail($id);

        if ($ward->rooms()->exists()) {
            return back()->withErrors(['error' => 'Cannot delete ward. It contains rooms/beds. Please delete them first.']);
        }

        DB::transaction(function () use ($ward) {
            // 1. Delete linked Billing Item first
            if ($ward->blsItem) {
                $ward->blsItem->delete();
            }

            // 2. Delete the Ward
            $ward->delete();
        });

        return redirect()->route('systemconfiguration5.wards.index')
            ->with('success', 'Ward deleted successfully.');
    }
}