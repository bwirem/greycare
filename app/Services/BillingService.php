<?php

namespace App\Services;

use App\Models\Billing\BILOrder;
use App\Models\Billing\BILOrderItem;
use App\Models\Billing\BLSCustomer;
use App\Models\Billing\BLSItem;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class BillingService
{
    /**
     * Add a line item to the patient's active bill.
     *
     * @param string $patientCode
     * @param int $billItemId
     * @param float $quantity
     * @param string $sourceType
     * @param int $sourceId
     * @param string $priceCategory (e.g. 'price1', 'price5')
     */
    public function addToBill($patientCode, $billItemId, $quantity, $sourceType, $sourceId, $priceCategory = 'price1',$paymentCategory)
    {
        // 1. Find the Billing Customer
        $customer = BLSCustomer::where('patient_code', $patientCode)->first();
        if (!$customer) {
            return; 
        }

        // 2. Find an OPEN Order (Stage 3 = Pending) for today
        $order = BILOrder::where('customer_id', $customer->id)
            ->where('stage', 3) 
            ->where('payment_category', $paymentCategory)
            ->whereDate('created_at', Carbon::today())
            ->first();

        // 3. Create Order if it doesn't exist
        if (!$order) {
            $userId = Auth::id() ?? 1; 
            $defaultStoreId = Auth::user()?->store_id ?? 1; 

            $order = BILOrder::create([
                'transdate' => now(),
                'store_id' => $defaultStoreId,
                'customer_id' => $customer->id,
                'stage' => 3, // Pending
                'payment_category' => $paymentCategory,
                'total' => 0, 
                'user_id' => $userId,
            ]);
        }

        // 4. Get Item Details & Determine Price
        $item = BLSItem::find($billItemId);
        if (!$item) return;

        $priceColumn = 'price1'; // Default Fallback
        
        // FIX: Use array_key_exists on loaded attributes instead of Schema::hasColumn
        // This avoids the 'generation_expression' MySQL error while still supporting future columns.
        if (!empty($priceCategory) && array_key_exists($priceCategory, $item->getAttributes())) {
            $priceColumn = $priceCategory;
        }

        // Extract Price dynamically
        $price = $item->{$priceColumn}; 
        
        // Set Reference (e.g., 'Price1', 'Price5') for the receipt
        $priceRef = ucfirst($priceColumn);

        // 5. Add or Update the Item in the Order
        $existingLine = BILOrderItem::where('order_id', $order->id)
            ->where('source_type', $sourceType)
            ->where('source_id', $sourceId)
            ->first();

        if ($existingLine) {
            $existingLine->update([
                'quantity' => $quantity,
                'price' => $price,
                'price_ref' => $priceRef 
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
                'price_ref' => $priceRef     
            ]);
        }

        // 6. Recalculate Order Total
        $order->total = $order->orderitems()->sum(DB::raw('price * quantity'));
        $order->saveQuietly(); 
    }
}