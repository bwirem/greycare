<?php

namespace App\Http\Controllers\Theatre;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr; // Import Arr helper for data separation
use Inertia\Inertia;

// Models
use App\Models\Theatre\TheatreProcedure;
use App\Models\Theatre\TheatreProcedureGroup;

// Billing Models
use App\Models\Billing\BLSItem;
use App\Models\Billing\BLSItemGroup;
use App\Models\Billing\BLSPriceCategory;

class TheatreProcedureController extends Controller
{
    /**
     * Helper to get active price categories
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
            'activePriceCategories' => $this->getActivePriceCategories(), 
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validate (Includes prices for validation rules)
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'theatre_procedure_group_id' => 'nullable|exists:theatre_procedure_groups,id',
            
            // Prices
            'price1' => 'nullable|numeric|min:0',
            'price2' => 'nullable|numeric|min:0',
            'price3' => 'nullable|numeric|min:0',
            'price4' => 'nullable|numeric|min:0',
        ]);

        // 2. Transaction
        DB::transaction(function () use ($validated, $request) {
            
            // A. Separate Data
            // REMOVE price fields from the array used to create the TheatreProcedure
            $procedureData = Arr::except($validated, ['price1', 'price2', 'price3', 'price4']);
            
            // Create Procedure
            $procedure = TheatreProcedure::create($procedureData);

            // B. Create Linked Billing Item
            $itemGroup = BLSItemGroup::firstOrCreate(['name' => 'Theatre']);

            BLSItem::create([
                'name' => $validated['name'],
                'itemgroup_id' => $itemGroup->id,
                'theatre_procedure_id' => $procedure->id, // Link to the new Procedure
                
                // Use prices from request (defaulting to 0)
                'price1' => $request->input('price1', 0),
                'price2' => $request->input('price2', 0),
                'price3' => $request->input('price3', 0),
                'price4' => $request->input('price4', 0),
                
                'addtocart' => true, // Default to sellable
                'defaultqty' => 1,
            ]);
        });

        return redirect()->route('systemconfiguration8.procedures.index')
            ->with('success', 'Procedure and Billing Item created successfully.');
    }

    public function edit($id)
    {
        // Eager load BLSItem to show prices in the edit form
        $procedure = TheatreProcedure::with('blsItem')->findOrFail($id);
        
        return Inertia::render('SystemConfiguration/TheatreSetup/Procedures/Edit', [
            'procedure' => $procedure,
            'groups' => TheatreProcedureGroup::select('id', 'name')->orderBy('name')->get(),
            'activePriceCategories' => $this->getActivePriceCategories(), 
        ]);
    }

    public function update(Request $request, $id)
    {
        $procedure = TheatreProcedure::with('blsItem')->findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'theatre_procedure_group_id' => 'nullable|exists:theatre_procedure_groups,id',
            
            // Prices
            'price1' => 'nullable|numeric|min:0',
            'price2' => 'nullable|numeric|min:0',
            'price3' => 'nullable|numeric|min:0',
            'price4' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($procedure, $validated, $request) {
            
            // A. Separate Data
            // REMOVE price fields before updating TheatreProcedure
            $procedureData = Arr::except($validated, ['price1', 'price2', 'price3', 'price4']);
            
            // Update Procedure
            $procedure->update($procedureData);

            // B. Update Linked Billing Item
            if ($procedure->blsItem) {
                // Prepare billing update
                $blsData = [
                    'name' => $validated['name'], // Sync name
                ];

                if ($request->has('price1')) $blsData['price1'] = $request->input('price1');
                if ($request->has('price2')) $blsData['price2'] = $request->input('price2');
                if ($request->has('price3')) $blsData['price3'] = $request->input('price3');
                if ($request->has('price4')) $blsData['price4'] = $request->input('price4');

                $procedure->blsItem->update($blsData);
            } else {
                // Fallback: Create Billing Item if missing
                $itemGroup = BLSItemGroup::firstOrCreate(['name' => 'Theatre']);
                $procedure->blsItem()->create([
                    'name' => $validated['name'],
                    'itemgroup_id' => $itemGroup->id,
                    'theatre_procedure_id' => $procedure->id,
                    'price1' => $request->input('price1', 0),
                    'price2' => $request->input('price2', 0),
                    'price3' => $request->input('price3', 0),
                    'price4' => $request->input('price4', 0),
                    'addtocart' => true,
                    'defaultqty' => 1,
                ]);
            }
        });

        return redirect()->route('systemconfiguration8.procedures.index')->with('success', 'Procedure updated.');
    }

    public function destroy($id)
    {
        $procedure = TheatreProcedure::with('blsItem')->findOrFail($id);
        
        DB::transaction(function () use ($procedure) {
            // 1. Delete linked Billing Item first
            if ($procedure->blsItem) {
                $procedure->blsItem->delete();
            }

            // 2. Delete the Procedure
            $procedure->delete();
        });
        
        return redirect()->back()->with('success', 'Procedure deleted.');
    }
}