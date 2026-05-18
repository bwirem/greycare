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
            for ($i = 1; $i <= 15; $i++) {
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
            'price5' => 'nullable|numeric|min:0',
            'price6' => 'nullable|numeric|min:0',
            'price7' => 'nullable|numeric|min:0',
            'price8' => 'nullable|numeric|min:0',
            'price9' => 'nullable|numeric|min:0',
            'price10' => 'nullable|numeric|min:0',
            'price11' => 'nullable|numeric|min:0',
            'price12' => 'nullable|numeric|min:0',
            'price13' => 'nullable|numeric|min:0',
            'price14' => 'nullable|numeric|min:0',
            'price15' => 'nullable|numeric|min:0',
        ]);

        // 2. Transaction
        DB::transaction(function () use ($validated, $request) {
            
            // A. Separate Data
            // REMOVE price fields from the array used to create the TheatreProcedure
            $procedureData = Arr::except($validated, ['price1', 'price2', 'price3', 'price4', 'price5', 'price6', 'price7', 'price8', 'price9', 'price10', 'price11', 'price12', 'price13', 'price14', 'price15']);
            
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
                'price5' => $request->input('price5', 0),
                'price6' => $request->input('price6', 0),
                'price7' => $request->input('price7', 0),
                'price8' => $request->input('price8', 0),
                'price9' => $request->input('price9', 0),
                'price10' => $request->input('price10', 0),
                'price11' => $request->input('price11', 0),
                'price12' => $request->input('price12', 0),
                'price13' => $request->input('price13', 0),
                'price14' => $request->input('price14', 0),
                'price15' => $request->input('price15', 0),

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
            'price5' => 'nullable|numeric|min:0',
            'price6' => 'nullable|numeric|min:0',
            'price7' => 'nullable|numeric|min:0',
            'price8' => 'nullable|numeric|min:0',
            'price9' => 'nullable|numeric|min:0',
            'price10' => 'nullable|numeric|min:0',
            'price11' => 'nullable|numeric|min:0',
            'price12' => 'nullable|numeric|min:0',
            'price13' => 'nullable|numeric|min:0',
            'price14' => 'nullable|numeric|min:0',
            'price15' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($procedure, $validated, $request) {
            
            // A. Separate Data
            // REMOVE price fields before updating TheatreProcedure
            $procedureData = Arr::except($validated, ['price1', 'price2', 'price3', 'price4', 'price5', 'price6', 'price7', 'price8', 'price9', 'price10', 'price11', 'price12', 'price13', 'price14', 'price15']);
            
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
                if ($request->has('price5')) $blsData['price5'] = $request->input('price5');
                if ($request->has('price6')) $blsData['price6'] = $request->input('price6');
                if ($request->has('price7')) $blsData['price7'] = $request->input('price7');
                if ($request->has('price8')) $blsData['price8'] = $request->input('price8');
                if ($request->has('price9')) $blsData['price9'] = $request->input('price9');
                if ($request->has('price10')) $blsData['price10'] = $request->input('price10');
                if ($request->has('price11')) $blsData['price11'] = $request->input('price11');
                if ($request->has('price12')) $blsData['price12'] = $request->input('price12');
                if ($request->has('price13')) $blsData['price13'] = $request->input('price13');
                if ($request->has('price14')) $blsData['price14'] = $request->input('price14');
                if ($request->has('price15')) $blsData['price15'] = $request->input('price15');
                // Update Billing Item

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
                    'price5' => $request->input('price5', 0),
                    'price6' => $request->input('price6', 0),
                    'price7' => $request->input('price7', 0),   
                    'price8' => $request->input('price8', 0),
                    'price9' => $request->input('price9', 0),
                    'price10' => $request->input('price10', 0),
                    'price11' => $request->input('price11', 0),
                    'price12' => $request->input('price12', 0),
                    'price13' => $request->input('price13', 0),
                    'price14' => $request->input('price14', 0),
                    'price15' => $request->input('price15', 0),
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