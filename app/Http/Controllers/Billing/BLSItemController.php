<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\Billing\BLSItem;
use App\Models\Billing\BLSItemGroup;
use App\Models\Billing\BLSPriceCategory;

use App\Models\BILInvoiceItem;
use App\Models\BILOrderItem;
use App\Models\BILReceiptItem;
use App\Models\BILSaleItem;    

use App\Models\Inventory\SIV_Store;
use App\Models\Inventory\SIV_Product;

// Inventory Transaction Models
use App\Models\IVIssueItem;
use App\Models\IVReceiveItem;
use App\Models\IVNormalAdjustmentItem;
use App\Models\IVPhysicalInventoryItem;
use App\Models\IVRequistionItem;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class BLSItemController extends Controller
{
    /**
     * Display a listing of items.
     */
    public function index(Request $request)
    {
        $query = BLSItem::with(['itemgroup', 'product.category']); 

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                ->orWhereHas('itemgroup', function ($subQuery) use ($search) {
                    $subQuery->where('name', 'like', '%' . $search . '%');
                });
            });
        }
        
        $query->orderBy(
            BLSItemGroup::select('name')
                ->whereColumn('bls_itemgroups.id', 'bls_items.itemgroup_id')
        )->orderBy('name', 'asc');

        $items = $query->paginate(50)->withQueryString();

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

        if (empty($activePriceCategories)) {
            $activePriceCategories[] = [
                'key' => 'price1',
                'label' => $priceCategorySettings ? $priceCategorySettings->price1 : 'Price'
            ];
        }

        return inertia('SystemConfiguration/BillingSetup/Items/Index', [
            'items' => $items,
            'filters' => $request->only(['search']),
            'success' => session('success'),
            'error' => session('error') ? [
                'message' => session('error'),
                'time' => microtime(true)
            ] : null,
            'activePriceCategories' => $activePriceCategories,
        ]);
    }
    

    /**
     * Show the form for creating a new item.
     */
    public function create()
    {
        $filteredItemGroups = BLSItemGroup::orderBy('name')
            ->where('name', '!=', 'Inventory')
            ->get();

        return inertia('SystemConfiguration/BillingSetup/Items/Create', [
            'itemGroups' => $filteredItemGroups,
            'pricecategories' => BLSPriceCategory::all(),
        ]);
    }

    /**
     * Store a newly created item in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:bls_items,name',
            'itemgroup_id' => 'required|exists:bls_itemgroups,id',
            'defaultqty' => 'required|integer|min:1',
            'addtocart' => 'boolean',
            'price1' => 'required|numeric|min:0',
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
         
        $validated['addtocart'] = $request->boolean('addtocart');
        $validated['price2'] = $validated['price2'] ?? 0;
        $validated['price3'] = $validated['price3'] ?? 0;
        $validated['price4'] = $validated['price4'] ?? 0;
        $validated['price5'] = $validated['price5'] ?? 0;
        $validated['price6'] = $validated['price6'] ?? 0;
        $validated['price7'] = $validated['price7'] ?? 0;
        $validated['price8'] = $validated['price8'] ?? 0;
        $validated['price9'] = $validated['price9'] ?? 0;
        $validated['price10'] = $validated['price10'] ?? 0;

        BLSItem::create($validated);

        return redirect()->route('systemconfiguration0.items.index')
            ->with('success', 'Item created successfully.');
    }

    /**
     * Show the form for editing the specified item.
     */
    public function edit(BLSItem $item)
    {
        $filteredItemGroups = BLSItemGroup::orderBy('name')->get();

        return inertia('SystemConfiguration/BillingSetup/Items/Edit', [
            'item' => $item,
            'itemGroups' => $filteredItemGroups,
            'pricecategories' => BLSPriceCategory::all(),
        ]);
    }

    /**
     * Update the specified item in storage.
     */
    public function update(Request $request, BLSItem $item)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('bls_items')->ignore($item->id)],
            'itemgroup_id' => 'required|exists:bls_itemgroups,id',
            'defaultqty' => 'required|integer|min:1',
            'addtocart' => 'boolean',

            'price1' => 'required|numeric|min:0',
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
    
        $validated['addtocart'] = $request->boolean('addtocart');
        $updateData = $validated;
        
        // --- MODIFIED LOGIC START: Protected Linked Items ---
        // Determine if this item is linked to ANY external module
        $isLinked = $item->product_id || 
                    $item->lab_panel_id || 
                    $item->rad_procedure_id || 
                    $item->theatre_procedure_id ||
                    $item->ipd_ward_id; // <--- Added IPD Ward Check

        if ($isLinked) {
            
            // Prevent renaming items managed by other modules
            if ($validated['name'] !== $item->name) {
                return redirect()->back()
                    ->with('error', 'Cannot update Name: This item is linked to a Clinical/Inventory module. Please rename it via the specific module interface.');
            }

            // Prevent changing group
            if ($validated['itemgroup_id'] != $item->itemgroup_id) {
                return redirect()->back()
                    ->with('error', 'Cannot update Group: This item is linked to a Clinical/Inventory module. Please update it via the specific module interface.');
            }

            unset($updateData['name'], $updateData['itemgroup_id']);
        }
        // --- MODIFIED LOGIC END ---
    
        $item->update($updateData);
    
        return redirect()->route('systemconfiguration0.items.index')
            ->with('success', 'Item updated successfully.');
    }
    

    /**
     * Remove the specified item from storage.
     */
    public function destroy(BLSItem $item)
    {
        // 1. Check usage in Billing Transactions
        $isUsed = false;
        if (BILInvoiceItem::where('item_id', $item->id)->exists()) $isUsed = true;
        elseif (BILOrderItem::where('item_id', $item->id)->exists()) $isUsed = true;
        elseif (BILReceiptItem::where('item_id', $item->id)->exists()) $isUsed = true;
        elseif (BILSaleItem::where('item_id', $item->id)->exists()) $isUsed = true;

        if ($isUsed) {
            return redirect()->route('systemconfiguration0.items.index')
                ->with('error', 'Cannot delete item: It has been used in existing billing transactions.');
        }

        // 2. Check Inventory Linkage
        if ($item->product_id) {
            $productIsUsed = false;
            if (IVIssueItem::where('product_id', $item->product_id)->exists()) $productIsUsed = true;
            elseif (IVReceiveItem::where('product_id', $item->product_id)->exists()) $productIsUsed = true;
            elseif (IVNormalAdjustmentItem::where('product_id', $item->product_id)->exists()) $productIsUsed = true;
            elseif (IVPhysicalInventoryItem::where('product_id', $item->product_id)->exists()) $productIsUsed = true;
            elseif (IVRequistionItem::where('product_id', $item->product_id)->exists()) $productIsUsed = true;

            if ($productIsUsed) {
                return redirect()->route('systemconfiguration0.items.index')
                    ->with('error', 'Cannot delete item: The linked Inventory Product is used in inventory transactions.');
            }
        }

        // 3. Check Clinical Linkages (Prevent deletion from here)
        if ($item->lab_panel_id) {
            return redirect()->route('systemconfiguration0.items.index')
                ->with('error', 'Cannot delete: This item is linked to a Laboratory Panel. Please delete the Panel in Lab Setup.');
        }

        if ($item->rad_procedure_id) {
            return redirect()->route('systemconfiguration0.items.index')
                ->with('error', 'Cannot delete: This item is linked to a Radiology Procedure. Please delete the Procedure in Radiology Setup.');
        }

        if ($item->theatre_procedure_id) {
            return redirect()->route('systemconfiguration0.items.index')
                ->with('error', 'Cannot delete: This item is linked to a Theatre Procedure. Please delete the Procedure in Theatre Setup.');
        }

        if ($item->ipd_ward_id) { // <--- Added IPD Ward Check
            return redirect()->route('systemconfiguration0.items.index')
                ->with('error', 'Cannot delete: This item is linked to an IPD Ward. Please delete the Ward in Facility Setup.');
        }

        // 4. Attempt deletion 
        try {
            DB::transaction(function () use ($item) {
                // For Inventory, we delete associated product as they are tightly coupled
                if ($item->product_id) {
                    $linkedProduct = SIV_Product::find($item->product_id);
                    if ($linkedProduct) {
                        $linkedProduct->delete();
                    }
                }
                $item->delete();
            });
        } catch (QueryException $e) {
            return redirect()->route('systemconfiguration0.items.index')
                ->with('error', 'Unable to delete: Database integrity constraint violation.');
        }

        return redirect()->route('systemconfiguration0.items.index')
            ->with('success', 'Item deleted successfully.');
    }


    /**
     * Search for items based on query.
     */
    public function search(Request $request)
    {
        $query = $request->input('query');
        $priceCategoryId = $request->input('pricecategory_id', 'price1'); 
        $storeId = $request->input('store_id', null); 

        if (!in_array($priceCategoryId, ['price1', 'price2', 'price3', 'price4'])) {
            $priceCategoryId = 'price1';
        }

        $itemsQuery = BLSItem::where('bls_items.name', 'like', '%' . $query . '%')
            ->select(
                'bls_items.id', 
                'bls_items.name', 
                'bls_items.product_id', 
                "bls_items.$priceCategoryId as price"
            );

        if ($storeId && is_numeric($storeId) && (int)$storeId > 0) {
            $qtyColumn = 'iv_productcontrol.qty_' . (int)$storeId;

            $itemsQuery->leftJoin('iv_productcontrol', 'iv_productcontrol.product_id', '=', 'bls_items.product_id')
                       ->addSelect(\DB::raw("COALESCE($qtyColumn, 0) as stock_quantity"));
        } else {
            $itemsQuery->addSelect(\DB::raw('0 as stock_quantity'));
        }

        $items = $itemsQuery->take(10)->get();

        return response()->json(['items' => $items]);
    }


    /**
     * Quickly update the prices of a single BLSItem via AJAX.
     */
    public function updatePrices(Request $request, BLSItem $item)
    {
        $rules = [];
        $priceKeys = ['price1', 'price2', 'price3', 'price4'];
        
        foreach ($request->all() as $key => $value) {
            if (in_array($key, $priceKeys)) {
                $rules[$key] = 'required|numeric|min:0';
            }
        }

        if (empty($rules)) {
            return response()->json(['success' => false, 'message' => 'No valid price data provided.'], 400);
        }

        $validated = $request->validate($rules);
        $item->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Prices updated successfully.',
        ]);
    }

    /**
     * Check availability.
     */
    public function checkAvailability($itemId)
    {
        $item = BLSItem::find($itemId);

        if (!$item || !$item->product_id) {
            return response()->json([]);
        }

        $stores = SIV_Store::all();
        $productControl = DB::table('iv_productcontrol')
                            ->where('product_id', $item->product_id)
                            ->first();

        $availableStoreIds = [];

        if ($productControl) {
            foreach ($stores as $store) {
                $col = 'qty_' . $store->id;
                if (isset($productControl->$col) && (float)$productControl->$col > 0) {
                    $availableStoreIds[] = $store->id;
                }
            }
        }

        return response()->json($availableStoreIds);
    }
}