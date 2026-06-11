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
    /**
     * Add a line item to the patient's active bill.
     * Returns the Order object so the controller can redirect to it.
     */
    public function addToBill($patientCode,$billinggroupId = null,$billingsubgroupId=null,
    $billinggroupmembershipno=null,$wardId=null, $billItemId,$quantity, $sourceType, 
    $sourceId, $priceCategory = 'price1', $paymentCategory)
    {
        // 1. Find the Billing Customer
        $customer = BLSCustomer::where('patient_code', $patientCode)->first();
        if (!$customer) {
            return null; // Changed from return; to return null;
        }

        // 2. Find an OPEN Order
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
                'billinggroup_id' => $billinggroupId,
                'billingsubgroup_id' => $billingsubgroupId,
                'billinggroupmembershipno' => $billinggroupmembershipno,
                'ward_id' => $wardId,   
                'stage' => 3, 
                'payment_category' => $paymentCategory,
                'total' => 0, 
                'user_id' => $userId,
            ]);
        }

        // 4. Get Item Details
        $item = BLSItem::find($billItemId);
        
        // If item exists, process it
        if ($item) {
            $priceColumn = 'price1'; 
            if (!empty($priceCategory) && array_key_exists($priceCategory, $item->getAttributes())) {
                $priceColumn = $priceCategory;
            }
            $price = $item->{$priceColumn}; 
            $priceRef = ucfirst($priceColumn);

            // 5. Add or Update Item
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

            // 6. Recalculate Total
            $order->total = $order->orderitems()->sum(DB::raw('price * quantity'));
            $order->saveQuietly(); 
        }

        return $order; // <--- IMPORTANT: Return the order object
    }
}