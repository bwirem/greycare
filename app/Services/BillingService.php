<?php

namespace App\Services;

use App\Models\Billing\BILOrder;
use App\Models\Billing\BILOrderItem;
use App\Models\Billing\BLSCustomer;
use App\Models\Billing\BLSItem;
use App\Models\Patient\Patient;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

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
            // Should not happen if registration flows are correct, but safety check
            return; 
        }

        // 2. Find an OPEN Order (Stage 3 = Pending/Proforma) for today
        // If the patient paid (Stage 5), we create a NEW order.
        $order = BILOrder::where('customer_id', $customer->id)
            ->where('stage', 3) // 3 = Pending
            ->whereDate('created_at', Carbon::today())
            ->first();

        // 3. Create Order if it doesn't exist
        if (!$order) {
            $patient = Patient::where('code', $patientCode)->first();
            // Determine default store (e.g., Main Store or based on user)
            $defaultStoreId = auth()->user()->store_id ?? 1; 

            $order = BILOrder::create([
                'transdate' => now(),
                'store_id' => $defaultStoreId,
                'customer_id' => $customer->id,
                'stage' => 3, // Pending
                'total' => 0, // Will recalculate
                'user_id' => auth()->id(),
            ]);
        }

        // 4. Get Item Details (Price)
        $item = BLSItem::find($billItemId);
        if (!$item) return;

        // Logic for Price Category (Cash vs Insurance) can go here
        // For now, defaulting to price1
        $price = $item->price1; 

        // 5. Add or Update the Item in the Order
        // Check if this specific source (e.g., Lab Request #50) is already there to prevent dupes
        $existingLine = BILOrderItem::where('order_id', $order->id)
            ->where('source_type', $sourceType)
            ->where('source_id', $sourceId)
            ->first();

        if ($existingLine) {
            // Update quantity if needed, or skip
            $existingLine->update([
                'quantity' => $quantity,
                'price' => $price
            ]);
        } else {
            BILOrderItem::create([
                'order_id' => $order->id,
                'item_id' => $billItemId,
                'item_name' => $item->name, // Snapshot name
                'quantity' => $quantity,
                'price' => $price,
                'source_store_id' => $order->store_id, // Or specific store logic
                'source_type' => $sourceType, // 'consultation', 'laboratory', 'pharmacy'
                'source_id' => $sourceId,     // The ID of the request
            ]);
        }

        // 6. Recalculate Order Total
        $order->total = $order->orderitems()->sum(\DB::raw('price * quantity'));
        $order->save();
    }
}