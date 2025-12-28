<?php

namespace App\Http\Controllers\Radiology;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr; // Import Arr helper to separate price data
use Inertia\Inertia;

// Models
use App\Models\Radiology\RadProcedure;
use App\Models\Radiology\RadModality;

// Billing Models
use App\Models\Billing\BLSItem;
use App\Models\Billing\BLSItemGroup;
use App\Models\Billing\BLSPriceCategory;

class RadProcedureController extends Controller
{
    /**
     * Helper to get active price categories (Matches Lab/Inventory logic)
     */
    private function getActivePriceCategories()
    {
        $activePriceCategories = [];
        $priceCategorySettings = BLSPriceCategory::first();

        if ($priceCategorySettings) {
            for ($i = 1; $i <= 10; $i++) {
                if ($priceCategorySettings->{'useprice' . $i}) {
                    $activePriceCategories[] = [
                        'key' => 'price' . $i,
                        'label' => $priceCategorySettings->{'price' . $i},
                    ];
                }
            }
        }
        
        // Default fallback if no categories are enabled
        if (empty($activePriceCategories)) {
            $activePriceCategories[] = ['key' => 'price1', 'label' => 'Price'];
        }

        return $activePriceCategories;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Eager load modality for display
        $query = RadProcedure::with('modality');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        return Inertia::render('SystemConfiguration/RadiologySetup/Procedures/Index', [
            'procedures' => $query->latest()->paginate(10),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('SystemConfiguration/RadiologySetup/Procedures/Create', [
            'modalities' => RadModality::select('id', 'name')->where('is_active', true)->get(),
            'activePriceCategories' => $this->getActivePriceCategories(), // Pass price labels to UI
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 1. Validate ALL inputs (Procedure + Prices)
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'rad_modality_id' => 'required|exists:rad_modalities,id',
            'body_part' => 'nullable|string|max:100',
            'contrast_required' => 'boolean',
            'duration_minutes' => 'integer|min:1',
            
            // Prices (Validated here but NOT saved to rad_procedures table)
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
        ]);

        $validated['contrast_required'] = $request->boolean('contrast_required');

        // 2. Transaction
        DB::transaction(function () use ($validated, $request) {
            
            // A. Separate Data
            // We must remove price fields from the array used to create the RadProcedure
            $procedureData = Arr::except($validated, ['price1', 'price2', 'price3', 'price4', 'price5', 'price6', 'price7', 'price8', 'price9', 'price10']);

            // Create Procedure
            $procedure = RadProcedure::create($procedureData);

            // B. Create Linked Billing Item
            // Ensure 'Radiology' group exists
            $itemGroup = BLSItemGroup::firstOrCreate(['name' => 'Radiology']);

            BLSItem::create([
                'name' => $validated['name'],
                'itemgroup_id' => $itemGroup->id,
                'rad_procedure_id' => $procedure->id, // Link to the new Procedure
                
                // Use prices from the request inputs (defaulting to 0)
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
                
                'addtocart' => true, // Default to true as procedures are sellable services
                'defaultqty' => 1,
            ]);
        });

        return redirect()->route('systemconfiguration7.procedures.index')
            ->with('success', 'Procedure and Billing Item created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        // Eager load BLSItem so prices appear in the edit form
        $procedure = RadProcedure::with('blsItem')->findOrFail($id);
        
        return Inertia::render('SystemConfiguration/RadiologySetup/Procedures/Edit', [
            'procedure' => $procedure,
            'modalities' => RadModality::select('id', 'name')->where('is_active', true)->get(),
            'activePriceCategories' => $this->getActivePriceCategories(), // Pass price labels to UI
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $procedure = RadProcedure::with('blsItem')->findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'rad_modality_id' => 'required|exists:rad_modalities,id',
            'body_part' => 'nullable|string|max:100',
            'contrast_required' => 'boolean',
            'duration_minutes' => 'integer|min:1',
            
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
        ]);

        $validated['contrast_required'] = $request->boolean('contrast_required');

        DB::transaction(function () use ($procedure, $validated, $request) {
            
            // A. Separate Data (Remove prices)
            $procedureData = Arr::except($validated, ['price1', 'price2', 'price3', 'price4', 'price5', 'price6', 'price7', 'price8', 'price9', 'price10']);
            
            // Update Procedure
            $procedure->update($procedureData);

            // B. Update Linked Billing Item
            if ($procedure->blsItem) {
                // Prepare billing update
                $blsData = [
                    'name' => $validated['name'], // Keep name synced
                ];

                // Only update prices if they are present in the request
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

                $procedure->blsItem->update($blsData);
            } else {
                // Fallback: If BLSItem is missing, create it now
                $itemGroup = BLSItemGroup::firstOrCreate(['name' => 'Radiology']);
                $procedure->blsItem()->create([
                    'name' => $validated['name'],
                    'itemgroup_id' => $itemGroup->id,
                    'rad_procedure_id' => $procedure->id,
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
                    'addtocart' => true,
                    'defaultqty' => 1,
                ]);
            }
        });

        return redirect()->route('systemconfiguration7.procedures.index')->with('success', 'Procedure updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $procedure = RadProcedure::with('blsItem')->findOrFail($id);
        
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