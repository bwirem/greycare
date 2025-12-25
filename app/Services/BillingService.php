<?php

namespace App\Services;

use App\Models\Billing\BILOrder;
use App\Models\Billing\BILOrderItem;
use App\Models\Billing\BLSCustomer;
use App\Models\Billing\BLSItem;
use App\Models\Patient\Patient;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class BillingService
{
    /**
     * Add a line item to the patient's active bill.
     */
    public function addToBill($patientCode, $billItemId, $quantity, $sourceType, $sourceId)
    {
        // 1. Find the Billing Customer
        $customer = BLSCustomer::where('patient_code', $patientCode)->first();
        if (!$customer) {
            return; 
        }

        // 2. Find an OPEN Order (Stage 3 = Pending) for today
        $order = BILOrder::where('customer_id', $customer->id)
            ->where('stage', 3) 
            ->whereDate('created_at', Carbon::today())
            ->first();

        // 3. Create Order if it doesn't exist
        if (!$order) {
            // FIX: Handle CLI/Console execution where auth() is null.
            // We fallback to User ID 1 (System Admin) and Store ID 1 (Main Store).
            $userId = auth()->id() ?? 1; 
            $defaultStoreId = auth()->user()->store_id ?? 1; 

            $order = BILOrder::create([
                'transdate' => now(),
                'store_id' => $defaultStoreId,
                'customer_id' => $customer->id,
                'stage' => 3, // Pending
                'total' => 0, // Will recalculate below
                'user_id' => $userId, // <--- Fixed: Now guaranteed to have a value
            ]);
        }

        // 4. Get Item Details (Price)
        $item = BLSItem::find($billItemId);
        if (!$item) return;

        $price = $item->price1; 

        // 5. Add or Update the Item in the Order
        $existingLine = BILOrderItem::where('order_id', $order->id)
            ->where('source_type', $sourceType)
            ->where('source_id', $sourceId)
            ->first();

        if ($existingLine) {
            $existingLine->update([
                'quantity' => $quantity,
                'price' => $price
            ]);
        } else {
            BILOrderItem::create([
                'order_id' => $order->id,
                'item_id' => $billItemId,
                'item_name' => $item->name,
                'quantity' => $quantity,
                'price' => $price,
                'source_store_id' => $order->store_id, 
                'source_type' => $sourceType, 
                'source_id' => $sourceId,
                'price_ref' => 'Standard'     
            ]);
        }

        // 6. Recalculate Order Total
        $order->total = $order->orderitems()->sum(DB::raw('price * quantity'));
        $order->saveQuietly(); 
    }
}