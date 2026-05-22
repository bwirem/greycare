<?php

namespace App\Http\Controllers\Traits;

use App\Models\Billing\BILOrder;
use App\Models\Billing\BLSPriceCategory;
use App\Models\Billing\BLSCustomer;
use App\Services\Billing\ControlNumberService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\ValidationException;

trait HandlesOrdering
{
    /**
     * Fetches the active price categories.
     * This logic is based on a database structure where categories are columns in a single row.
     */
    protected function fetchPriceCategories()
    {
        $rows = BLSPriceCategory::query()->first();
        $priceCategories = [];

        if ($rows) {
            for ($i = 1; $i <= 13; $i++) {
                if (!empty($rows->{'useprice' . $i}) && $rows->{'useprice' . $i} == 1) {
                    $priceCategories[] = [
                        'pricename' => 'price' . $i,
                        'pricedescription' => trim($rows->{'price' . $i}),
                    ];
                }
            }
        }

        return $priceCategories;
    }

    /**
     * Validate and create a new order and its items.
     */
    
    public function createOrder(Request $request)
    {        
        $validated = $request->validate([
            'customer_id' => 'required|exists:bls_customers,id',
            'store_id' => 'required|exists:siv_stores,id',
            'description' => 'nullable|string|max:255', 
            'stage' => 'required|integer|min:1',
            'orderitems' => 'required|array',
            'orderitems.*.item_id' => 'required|exists:bls_items,id',
            'orderitems.*.quantity' => 'required|numeric|min:1', 
            'orderitems.*.price' => 'required|numeric|min:0',
            'orderitems.*.source_store_id' => 'nullable|integer',             
            'orderitems.*.price_ref' => 'nullable|string',
        ]);

        // 1. Calculate the total manually BEFORE saving to DB
        $calculatedTotal = collect($validated['orderitems'])->sum(function ($item) {
            return $item['quantity'] * $item['price'];
        });

       // 2. Control Number Service 
        $controlService = new ControlNumberService();

        // 3. Retrieve customer details for API payload
        $customer = BLSCustomer::find($validated['customer_id']);
        $patientId = $customer?->patient_code;
        $patientName = trim("{$customer->first_name} {$customer->other_names} {$customer->surname}");

        // 4. Call the Control Number Service BEFORE touching the Database
        $controlResponse = $controlService->generateControlNumber([
            'patient_id'    => $patientId,
            'patient_name'  => $patientName ?: 'Unknown',
            'amount'        => $calculatedTotal,
            'description'   => $validated['description'] ?? 'Medical Services', 
            'mobile_number' => $customer?->phone ?? '2556',
            'payment_ref'   => "KTY123477", 
        ]);

        Log::info('Control Number API Response:', $controlResponse);

        // 5. 🔥 IF ERROR/DUPLICATE: Throw ValidationException
        if (!isset($controlResponse['status']) || $controlResponse['status'] !== 'success') {
            
            $errorMessage = $controlResponse['message'] ?? 'API Error: Failed to generate control number.';
            Log::error("Order Creation Aborted: " . $errorMessage);
            
            // This natively triggers the `onError: (formErrors) => {}` in Inertia!
            throw ValidationException::withMessages([
                'api_error' => $errorMessage
            ]);
        }

        // 6. If the API was fully successful, NOW save everything to the database
        DB::transaction(function () use ($validated, $calculatedTotal, $controlResponse) {

            $stage = $controlResponse['status'] == 'success'
                ? 4
                : $validated['stage'];

            $order = BILOrder::create([
                'customer_id' => $validated['customer_id'],
                'store_id'    => $validated['store_id'],
                'stage'       => $stage,
                'total'       => 0,
                'user_id'     => Auth::id(),
            ]);

            $order->orderitems()->createMany($validated['orderitems']);

            $order->total = $calculatedTotal;
            $order->saveQuietly(); 
        });
    }


    /**
     * Validate and update an existing order and its items.
     */
    public function updateOrder(Request $request, BILOrder $order)
    {
        
        $validated = $request->validate([
            'customer_id' => 'required|exists:bls_customers,id',
            'store_id' => 'required|exists:siv_stores,id',
            'stage' => 'required|integer|min:1',
            'orderitems' => 'required|array',
            'orderitems.*.id' => 'nullable|exists:bil_orderitems,id',
            'orderitems.*.item_id' => 'required|exists:bls_items,id',
            'orderitems.*.quantity' => 'required|numeric|min:1', // Quantity should be at least 1
            'orderitems.*.price' => 'required|numeric|min:0',
            // New fields for Multi-Store and Price Category tracking
            'orderitems.*.source_store_id' => 'nullable|integer',             
            'orderitems.*.price_ref' => 'nullable|string',
        ]);

        // 1. Calculate the total manually BEFORE saving to DB  
            $calculatedTotal = collect($validated['orderitems'])->sum(function ($item) {
                return $item['quantity'] * $item['price'];
            });


        //2. control number service
            $controlService = new ControlNumberService();
    
        // 3. Retrieve customer details for API payload
            $customer = BLSCustomer::find($validated['customer_id']);
            $patientId = $customer?->patient_code;
            $patientName = trim("{$customer->first_name} {$customer->other_names} {$customer->surname}");
    
        // 4. Call the Control Number Service BEFORE touching the Database
            $controlResponse = $controlService->generateControlNumber([
                'patient_id'    => $patientId,
                'patient_name'  => $patientName ?: 'Unknown',
                'amount'        => $calculatedTotal,
                'description'   => 'Order Update: ' . ($validated['description'] ?? 'Medical Services'), 
                'mobile_number' => $customer?->phone ?? '2556',
                'payment_ref'   => "KTY123479", 
            ]);
    
            Log::info('Control Number API Response on Update:', $controlResponse);
    
        // 5. 🔥 IF ERROR/DUPLICATE: Throw ValidationException
            if (!isset($controlResponse['status']) || $controlResponse['status'] !== 'success') {
                
                $errorMessage = $controlResponse['message'] ?? 'API Error: Failed to generate control number.';
                Log::error("Order Update Aborted: " . $errorMessage);
                
                // This natively triggers the `onError: (formErrors) => {}` in Inertia!
                throw ValidationException::withMessages([
                    'api_error' => $errorMessage
                ]);
            }
    
        // 6. If the API was fully successful, NOW save everything to the database  

        DB::transaction(function () use ($validated, $order, $controlResponse) {
            $stage = $controlResponse['status'] == 'success'
                ? 4
                : $validated['stage'];

            $incomingItemIds = collect($validated['orderitems'])->pluck('id')->filter()->toArray();
            $oldItemIds = $order->orderitems()->pluck('id')->toArray();

            // Delete items that are no longer in the request
            $itemsToDelete = array_diff($oldItemIds, $incomingItemIds);
            if (!empty($itemsToDelete)) {
                $order->orderitems()->whereIn('id', $itemsToDelete)->delete();
            }

            // Update existing items and create new ones
            foreach ($validated['orderitems'] as $itemData) {
                $order->orderitems()->updateOrCreate(
                    ['id' => $itemData['id'] ?? null], // Condition to find the item
                    [
                        'item_id' => $itemData['item_id'],
                        'quantity' => $itemData['quantity'],
                        'price' => $itemData['price'],
                        'source_store_id' => $itemData['source_store_id'] ?? null,
                        'price_ref' => $itemData['price_ref'] ?? null,
                    ]
                );
            }
            
            // Refresh the order instance to get the updated relationship state from the database.
            // This is crucial for an accurate total calculation.
            $order->refresh();

            // Recalculate the total based on the final state of the order items
            $calculatedTotal = $order->orderitems->sum(fn($item) => $item->quantity * $item->price);

            // Update the main order details
            $order->update([
                'customer_id' => $validated['customer_id'],
                'store_id' => $validated['store_id'],
                'stage' => $stage,//$validated['stage'],
                'total' => $calculatedTotal,
                'user_id' => Auth::id(), // Update the user who last edited the order
            ]);
        });
    }
}