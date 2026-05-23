<?php

namespace App\Http\Controllers\Traits;

use App\Models\Billing\BILOrder;
use App\Models\Billing\BLSPriceCategory;
use App\Models\Billing\BLSCustomer;
use App\Models\Facility\FacilityOption;
use App\Models\UserGroupPrinter;
use App\Services\Billing\ControlNumberService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Barryvdh\DomPDF\Facade\Pdf;

trait HandlesOrdering
{
    /**
     * Fetches the active price categories.
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
            'payment_ref'   => "KTY123493", 
        ]);      

        // 5. IF ERROR/DUPLICATE: Throw ValidationException
        if (!isset($controlResponse['status']) || $controlResponse['status'] !== 'success') {
            $errorMessage = $controlResponse['message'] ?? 'API Error: Failed to generate control number.';
            Log::error("Order Creation Aborted: " . $errorMessage);
            
            throw ValidationException::withMessages([
                'api_error' => $errorMessage
            ]);
        }

        // 6. Save everything to the database and capture the Order
        $order = DB::transaction(function () use ($validated, $calculatedTotal, $controlResponse) {

            $stage = $controlResponse['status'] == 'success' ? 4 : $validated['stage'];

            $newOrder = BILOrder::create([
                'customer_id' => $validated['customer_id'],
                'store_id'    => $validated['store_id'],
                'stage'       => $stage,
                'total'       => 0,
                'user_id'     => Auth::id(),
            ]);

            $newOrder->orderitems()->createMany($validated['orderitems']);

            $newOrder->total = $calculatedTotal;
            $newOrder->saveQuietly(); 
            
            return $newOrder;
        });

        // ============================================================
        // 7. PRINTING LOGIC START (Control Number Print/Preview)
        // ============================================================
        
        session(['latest_order_id' => $order->id, 'latest_control_response' => $controlResponse]);

        $userGroupId = Auth::user()->usergroup_id;
        $machineName = gethostname(); 

        $printerConfig = UserGroupPrinter::where('usergroup_id', $userGroupId)
            ->where('documenttypecode', 'control_number') // Changed document type to control_number
            ->where('autoprint', true) 
            ->where(function ($query) use ($machineName) {
                $query->where('machinename', $machineName)
                      ->orWhere('machinename', '')
                      ->orWhereNull('machinename');
            })
            ->orderByRaw('LENGTH(machinename) DESC') 
            ->first();

        $backendPrinted = false;
        $frontendAutoPrint = false;           
        // Adjust the route to match your web.php definition
        $previewUrl = route('billing1.control_number_preview');

        if ($printerConfig) {
            if (!$printerConfig->printtoscreen) {
                // Attempt Backend Printing
                $tempPdfPath = $this->generateControlNumberTempPdf($order, $controlResponse);
                
                if ($this->printToBackendPrinter($tempPdfPath, $printerConfig->printername)) {
                    $backendPrinted = true;
                } else {
                    $frontendAutoPrint = true;
                }
            } else {
                $frontendAutoPrint = false; 
            }
        }  

        $msg = 'Order created and control number generated successfully.';
        if ($backendPrinted) {
            $msg .= ' Sent to server printer: ' . $printerConfig->printername;
        }

        return [
            'success' => true,
            'preview_url' => $previewUrl,
            'auto_print' => $frontendAutoPrint, 
            'backend_printed' => $backendPrinted, 
            'message' => $msg,
            'control_number' => $controlResponse['control_no'] ?? null // Make sure this is control_no !
        ];
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
            'orderitems.*.quantity' => 'required|numeric|min:1', 
            'orderitems.*.price' => 'required|numeric|min:0',
            'orderitems.*.source_store_id' => 'nullable|integer',             
            'orderitems.*.price_ref' => 'nullable|string',
        ]);

        // 1. Calculate the total manually BEFORE saving to DB  
        $calculatedTotal = collect($validated['orderitems'])->sum(function ($item) {
            return $item['quantity'] * $item['price'];
        });

        // 2. Control number service
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
            'payment_ref'   => "KTY123489", 
        ]);      

        // 5. IF ERROR/DUPLICATE: Throw ValidationException
         if (!isset($controlResponse['status']) || !in_array($controlResponse['status'], ['success', 'duplicate'])) {
            $errorMessage = $controlResponse['message'] ?? 'API Error: Failed to generate control number.';
            Log::error("Order Update Aborted: " . $errorMessage);
            
            throw ValidationException::withMessages([
                'api_error' => $errorMessage
            ]);
        }

        // 6. Save everything to the database  
        $updatedOrder = DB::transaction(function () use ($validated, $order, $controlResponse) {
            $stage = $controlResponse['status'] == 'success' ? 4 : $validated['stage'];

            $incomingItemIds = collect($validated['orderitems'])->pluck('id')->filter()->toArray();
            $oldItemIds = $order->orderitems()->pluck('id')->toArray();

            $itemsToDelete = array_diff($oldItemIds, $incomingItemIds);
            if (!empty($itemsToDelete)) {
                $order->orderitems()->whereIn('id', $itemsToDelete)->delete();
            }

            foreach ($validated['orderitems'] as $itemData) {
                $order->orderitems()->updateOrCreate(
                    ['id' => $itemData['id'] ?? null],
                    [
                        'item_id' => $itemData['item_id'],
                        'quantity' => $itemData['quantity'],
                        'price' => $itemData['price'],
                        'source_store_id' => $itemData['source_store_id'] ?? null,
                        'price_ref' => $itemData['price_ref'] ?? null,
                    ]
                );
            }
            
            $order->refresh();
            $calculatedTotal = $order->orderitems->sum(fn($item) => $item->quantity * $item->price);

            $order->update([
                'customer_id' => $validated['customer_id'],
                'store_id' => $validated['store_id'],
                'stage' => $stage,
                'total' => $calculatedTotal,
                'user_id' => Auth::id(), 
            ]);

            return $order;
        });

        // ============================================================
        // 7. PRINTING LOGIC START (Control Number Print/Preview)
        // ============================================================
        
        session(['latest_order_id' => $updatedOrder->id, 'latest_control_response' => $controlResponse]);

        $userGroupId = Auth::user()->usergroup_id;
        $machineName = gethostname(); 

        $printerConfig = UserGroupPrinter::where('usergroup_id', $userGroupId)
            ->where('documenttypecode', 'control_number')
            ->where('autoprint', true)
            ->where(function ($query) use ($machineName) {
                $query->where('machinename', $machineName)
                      ->orWhere('machinename', '')
                      ->orWhereNull('machinename');
            })
            ->orderByRaw('LENGTH(machinename) DESC') 
            ->first();

        $backendPrinted = false;
        $frontendAutoPrint = false;           
        $previewUrl = route('billing1.control_number_preview');
        //$previewUrl = route('outpatient0.control_number_preview');

        if ($printerConfig) {
            if (!$printerConfig->printtoscreen) {
                $tempPdfPath = $this->generateControlNumberTempPdf($updatedOrder, $controlResponse);
                
                if ($this->printToBackendPrinter($tempPdfPath, $printerConfig->printername)) {
                    $backendPrinted = true;
                } else {
                    $frontendAutoPrint = true;
                }
            } else {
                $frontendAutoPrint = false; 
            }
        }  

        $msg = 'Order updated and control number regenerated successfully.';
        if ($backendPrinted) {
            $msg .= ' Sent to server printer: ' . $printerConfig->printername;
        }

        // REMOVE return response()->json([ ... ]);
        // REPLACE WITH:

        return [
            'success' => true,
            'preview_url' => $previewUrl,
            'auto_print' => $frontendAutoPrint, 
            'backend_printed' => $backendPrinted, 
            'message' => $msg,
            'control_number' => $controlResponse['control_no'] ?? null // Make sure this is control_no !
        ];
    }

    // ============================================================
    // PRINTING HELPERS (Adapted for Control Numbers)
    // ============================================================

    /**
     * Print to Backend Local Printer via SumatraPDF
     */
    private function printToBackendPrinter($filePath, $printerName)
    {
        $printerExe = public_path('SumatraPDF.exe');
        
        if (!file_exists($printerExe) && strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            Log::warning("SumatraPDF.exe missing. Falling back to browser print.");
            return false;
        }

        if (strtoupper(substr(PHP_OS, 0, 3)) !== 'WIN') {
             return false; 
        }

        try {
            $command = "start /B \"\" \"{$printerExe}\" -print-to \"{$printerName}\" -silent \"{$filePath}\"";
            pclose(popen($command, "r"));
            return true;
        } catch (\Exception $e) {
            Log::error("Backend print failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Generates a temporary PDF file for backend printing of the control number
     */
    private function generateControlNumberTempPdf($order, $controlResponse)
    {
        $facility = FacilityOption::first();
        $customPaper = array(0, 0, 226.77, 1000); // 80mm POS paper width

        $pdf = Pdf::loadView('pdfs.control_number_receipt', [
            'order' => $order,
            'controlResponse' => $controlResponse,
            'facility' => $facility,
        ])->setPaper($customPaper, 'portrait');

        $fileName = 'control_num_' . $order->id . '_' . time() . '.pdf';
        $directory = storage_path('app/public/temp_control_numbers');
        
        if (!file_exists($directory)) {
            mkdir($directory, 0755, true);
        }
        
        $filePath = $directory . '/' . $fileName;
        $pdf->save($filePath);
        
        return $filePath;
    }

    /**
     * Public endpoint to render the control number PDF to the browser for preview/frontend print
     */
    public function controlNumberPreview()
    {
        $orderId = session('latest_order_id');
        $controlResponse = session('latest_control_response');

        if (!$orderId) {
            return redirect()->back()->with('error', 'No control number to display.');
        }

        $order = BILOrder::findOrFail($orderId);
        $facility = FacilityOption::first();

        $customPaper = array(0, 0, 226.77, 1000); 

        // Ensure you create this Blade view (`resources/views/pdfs/control_number_receipt.blade.php`)
        $pdf = Pdf::loadView('pdfs.control_number_receipt', [
            'order' => $order,
            'controlResponse' => $controlResponse,
            'facility' => $facility,
        ])->setPaper($customPaper, 'portrait');

        return response($pdf->output(), 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="control_number_' . $order->id . '.pdf"');
    }
}