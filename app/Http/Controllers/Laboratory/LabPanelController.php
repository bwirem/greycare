<?php

namespace App\Http\Controllers\Laboratory;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr; 
use Inertia\Inertia;

// Models
use App\Models\Laboratory\LabPanel;
use App\Models\Laboratory\LabCategory;
use App\Models\Laboratory\LabNatureOfSample;

// Billing Models
use App\Models\Billing\BLSItem;
use App\Models\Billing\BLSItemGroup;
use App\Models\Billing\BLSPriceCategory;

class LabPanelController extends Controller
{
    /**
     * Helper to get active price categories (consistent with Product/Billing Controllers)
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
        // Eager load category and sample for display
        $query = LabPanel::with(['category', 'defaultSample']);

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        return Inertia::render('SystemConfiguration/LabSetup/Panels/Index', [
            'panels' => $query->latest()->paginate(10),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('SystemConfiguration/LabSetup/Panels/Create', [
            'categories' => LabCategory::select('id', 'name')->orderBy('name')->get(),
            'samples' => LabNatureOfSample::select('id', 'name')->orderBy('name')->get(),
            'activePriceCategories' => $this->getActivePriceCategories(), // Pass price labels
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 1. Validate ALL inputs (Panel fields + Price fields)
        $validated = $request->validate([
            // Lab Panel Fields
            'name' => 'required|string|max:255|unique:lab_panels,name',
            'code' => 'nullable|string|max:50',
            'lab_category_id' => 'required|exists:lab_categories,id',
            'lab_nature_of_sample_id' => 'nullable|exists:lab_nature_of_samples,id',
            'is_available' => 'boolean', 
            
            // Billing Price Fields (These do not exist in lab_panels table)
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

        // Ensure boolean casting
        $validated['is_available'] = $request->boolean('is_available');

        DB::transaction(function () use ($validated, $request) {
            
            // 2. Separate Data
            // We must remove price fields from the array used to create the LabPanel
            // because the 'lab_panels' table does not have 'price1', 'price2', etc.
            $panelData = Arr::except($validated, ['price1', 'price2', 'price3', 'price4', 'price5', 'price6', 'price7', 'price8', 'price9', 'price10']);

            // A. Create the Lab Panel
            $panel = LabPanel::create($panelData);

            // B. Create the Billing Item
            // Ensure a 'Laboratory' group exists in billing
            $itemGroup = BLSItemGroup::firstOrCreate(['name' => 'Laboratory']);

            BLSItem::create([
                'name' => $validated['name'],
                'itemgroup_id' => $itemGroup->id,
                'lab_panel_id' => $panel->id, // Link to the new Panel
                
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
                
                // Map 'is_available' from Lab to 'addtocart' in Billing
                'addtocart' => $validated['is_available'], 
                'defaultqty' => 1,
            ]);
        });

        return redirect()->route('systemconfiguration6.panels.index')
            ->with('success', 'Lab Test Panel created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        // Eager load the BLSItem to show current prices in the form
        $panel = LabPanel::with('blsItem')->findOrFail($id);
        
        return Inertia::render('SystemConfiguration/LabSetup/Panels/Edit', [
            'panel' => $panel,
            'categories' => LabCategory::select('id', 'name')->orderBy('name')->get(),
            'samples' => LabNatureOfSample::select('id', 'name')->orderBy('name')->get(),
            'activePriceCategories' => $this->getActivePriceCategories(), // Pass price labels
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $panel = LabPanel::with('blsItem')->findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:lab_panels,name,' . $panel->id,
            'code' => 'nullable|string|max:50',
            'lab_category_id' => 'required|exists:lab_categories,id',
            'lab_nature_of_sample_id' => 'nullable|exists:lab_nature_of_samples,id',
            'is_available' => 'boolean',

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

        $validated['is_available'] = $request->boolean('is_available');

        DB::transaction(function () use ($panel, $validated, $request) {
            
            // 2. Separate Data
            $panelData = Arr::except($validated, ['price1', 'price2', 'price3', 'price4', 'price5', 'price6', 'price7', 'price8', 'price9', 'price10']);

            // A. Update Lab Panel
            $panel->update($panelData);

            // B. Update Linked Billing Item
            if ($panel->blsItem) {
                // Prepare billing update data
                $blsData = [
                    'name' => $validated['name'], // Keep name synced
                    'addtocart' => $validated['is_available'], // Sync availability
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

                $panel->blsItem->update($blsData);
            } else {
                // Fallback: If BLSItem is missing, create it now
                $itemGroup = BLSItemGroup::firstOrCreate(['name' => 'Laboratory']);
                $panel->blsItem()->create([
                    'name' => $validated['name'],
                    'itemgroup_id' => $itemGroup->id,
                    'lab_panel_id' => $panel->id,
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
                    'addtocart' => $validated['is_available'],
                    'defaultqty' => 1,
                ]);
            }
        });

        return redirect()->route('systemconfiguration6.panels.index')->with('success', 'Panel updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $panel = LabPanel::with('blsItem')->findOrFail($id);

        DB::transaction(function () use ($panel) {
            // 1. Delete linked Billing Item first
            if ($panel->blsItem) {
                // (Optional: Check if used in billing transactions before deleting)
                $panel->blsItem->delete();
            }

            // 2. Delete the Panel
            $panel->delete();
        });

        return redirect()->back()->with('success', 'Panel deleted.');
    }
}