<?php

namespace App\Http\Controllers\Inventory;
use App\Http\Controllers\Controller;

use App\Enums\StoreType;
use App\Http\Controllers\Traits\ManagesItems;
use App\Http\Controllers\Traits\GeneratesUniqueNumbers;

use App\Models\Inventory\IVInterFacilityTransfer;
use App\Models\Inventory\IVIssue;// Adjust namespace if needed
use App\Models\System\Facility; // Adjust to your actual Facility model
use App\Models\Inventory\SIV_Store;

use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class IVInterFacilityTransferController extends Controller
{
    use ManagesItems;
    use GeneratesUniqueNumbers;

    public function index(Request $request)
    {        
        $query = IVInterFacilityTransfer::with(['transferitems', 'sourceStore', 'destinationFacility']);

        if ($request->filled('search')) {
            $query->whereHas('sourceStore', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            })->orWhereHas('destinationFacility', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('stage')) {
            $query->where('stage', $request->stage);
        } else {
            $query->where('stage', '<=', 2);
        }

        $transfers = $query->orderBy('created_at', 'desc')->paginate(10);

        return inertia('Inventory/InterFacilityTransfer/Index', [
            'transfers' => $transfers,
            'filters' => $request->only(['search', 'stage']),
        ]);
    }

    public function create()
    {
        return inertia('Inventory/InterFacilityTransfer/Create', [
            'stores' => SIV_Store::all(['id', 'name']),
            'facilities' => Facility::all(['id', 'name']), // Adjust model mapping
        ]);
    }

    public function store(Request $request, InventoryService $inventoryService)
    {
        $validated = $request->validate([
            'source_store_id' => 'required|exists:siv_stores,id',
            'destination_facility_id' => 'required|exists:facilities,id', // Adjust table name
            'stage' => 'required|integer|in:1,2',
            'remarks' => 'nullable|string',
            'transferitems' => 'required|array|min:1',
            'transferitems.*.item_id' => 'required|exists:siv_products,id',
            'transferitems.*.quantity' => 'required|numeric|min:0.01',
            'transferitems.*.price' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $transfer = IVInterFacilityTransfer::create([
                'transdate' => now(),
                'source_store_id' => $validated['source_store_id'],
                'destination_facility_id' => $validated['destination_facility_id'],
                'stage' => 1, 
                'total' => 0, 
                'remarks' => $validated['remarks'] ?? null,
                'user_id' => Auth::id(),
            ]);

            $this->processTransferUpdate($transfer, $validated);

            if ((int) $validated['stage'] === 2) {
                $this->processStockTransfer($transfer, $inventoryService);
                $transfer->update(['stage' => 2]);
            }

            DB::commit();

            return redirect()->route('inventory4.index')
                ->with('success', 'Inter-Facility Transfer created successfully.');

        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('Transfer creation failed: ' . $e->getMessage());
            return back()->withInput()->with('error', 'Failed to create transfer.');
        }
    }

    public function edit(IVInterFacilityTransfer $inter_facility_transfer)
    {
        $inter_facility_transfer->load(['sourceStore', 'destinationFacility', 'transferitems.item']);

        return inertia('Inventory/InterFacilityTransfer/Edit', [
            'transfer' => $inter_facility_transfer,
            'stores' => SIV_Store::all(['id', 'name']),
            'facilities' => Facility::all(['id', 'name']),
        ]);
    }

    public function update(Request $request, IVInterFacilityTransfer $inter_facility_transfer, InventoryService $inventoryService)
    {
        $validated = $request->validate([
            'source_store_id' => 'required|exists:siv_stores,id',
            'destination_facility_id' => 'required|exists:facilities,id',
            'stage' => 'required|integer|in:1,2',
            'remarks' => 'nullable|string',
            'transferitems' => 'required|array|min:1',
            'transferitems.*.id' => 'nullable|exists:iv_interfacilitytransferitems,id', // Adjust table mapping
            'transferitems.*.item_id' => 'required|exists:siv_products,id',
            'transferitems.*.quantity' => 'required|numeric|min:0.01',
            'transferitems.*.price' => 'required|numeric|min:0',  
        ]);

        $newStage = (int) $validated['stage'];
        $originalStage = $inter_facility_transfer->stage;

        //log::info("Updating transfer ID {$inter_facility_transfer->id} from stage {$originalStage} to {$newStage}");

        DB::beginTransaction();
        try {
            $this->processTransferUpdate($inter_facility_transfer, $validated);

            if ($newStage === 2 && $originalStage < 2) {
                $this->processStockTransfer($inter_facility_transfer, $inventoryService);
                $inter_facility_transfer->update(['stage' => 2]);
            }

            DB::commit();
            return redirect()->route('inventory4.index')
                ->with('success', 'Transfer updated successfully.');
        } catch (Throwable $e) {
            DB::rollBack();
            Log::error('Transfer update failed: ' . $e->getMessage());
            return back()->withInput()->with('error', 'Failed to update transfer.');
        }
    }

    private function processTransferUpdate(IVInterFacilityTransfer $transfer, array $validatedData): void
    {
        $this->syncItems($transfer, $validatedData['transferitems'], 'transferitems');

        $transfer->load('transferitems');
        $calculatedTotal = $transfer->transferitems->sum(fn($item) => $item->quantity * $item->price);

        $transfer->update([
            'source_store_id' => $validatedData['source_store_id'],
            'destination_facility_id' => $validatedData['destination_facility_id'],
            'remarks' => $validatedData['remarks'] ?? $transfer->remarks,
            'total' => $calculatedTotal,
            'user_id' => Auth::id(),
            'stage' => $validatedData['stage'], 
        ]);
    }

    private function processStockTransfer(IVInterFacilityTransfer $transfer, InventoryService $inventoryService): void
    {
        $transfer->load(['destinationFacility', 'transferitems']);

        $destinationFacility = $transfer->destinationFacility;
        $sourceStoreId = $transfer->source_store_id;
        $deliveryNo = $this->generateUniqueNumber(IVIssue::class, 'delivery_no', 'TRANS');

        $items = $transfer->transferitems->map(fn($item) => [
            'product_id' => $item->product_id ?? $item->item_id, // ensure correct field matches InventoryService expectations
            'quantity' => $item->quantity, // Always a positive reduction for transfers
            'price' => $item->price,
        ])->all();

        // A transfer out to another facility is an ISSUE from our store
        $inventoryService->issue(
            $sourceStoreId,
            $destinationFacility->id,
            StoreType::Facility->value, // Uses enum value
            $destinationFacility->name,
            $items,
            $deliveryNo
        );
    }

    public function destroy(IVInterFacilityTransfer $inter_facility_transfer)
    {
        if ($inter_facility_transfer->stage >= 2) {
            return back()->with('error', 'Cannot delete a transfer that has already been committed.');
        }

        $inter_facility_transfer->delete(); 

        return redirect()->route('inventory4.index')
            ->with('success', 'Transfer deleted successfully.');
    }
}