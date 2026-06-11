<?php
namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\HandlesOrdering;
use App\Http\Controllers\Traits\GeneratesUniqueNumbers;
use App\Services\InventoryService; // Import the service
use App\Services\Billing\ControlNumberService;

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

use App\Models\Billing\{
    BILOrder, BILOrderItem, BILSale, BILReceipt, BILInvoice, BILInvoiceLog,
    BILInvoicePayment, BILInvoicePaymentDetail, BILDebtor, BILDebtorLog,
    BILCollection,BLSPaymentType, BLSPriceCategory, BLSCustomer, BILControlNumber
};

use App\Models\Inventory\{
    IVRequistion,
    IVRequistionItem,
    IVIssue ,SIV_Store   
};

// Clinical Models (For Payment Status Updates)
use App\Models\Opd\OpdBooking;
use App\Models\Laboratory\LabPrescription;
use App\Models\Radiology\RadRequest;
use App\Models\Pharmacy\PharmacyPrescription;
use App\Models\Theatre\TheatreBooking;
//use App\Models\Ipd\IpdAdmission; // Already imported in the main controller namespace
use App\Models\Patient\PatientBillingGroup;
use App\Models\Patient\PatientBillingSubgroup;

use App\Models\Facility\{    
    FacilityOption,
};

use App\Models\{    
    UserGroupPrinter,
};


use App\Services\BillingService;
use App\Models\Ipd\IpdAdmission;
use App\Models\Ipd\IpdBedCharge;


use App\Enums\{
    BillingTransTypes, InvoiceStatus, PaymentSources, InvoiceTransTypes, StoreType
};


class BilPostController extends Controller
{
    use HandlesOrdering;
    use GeneratesUniqueNumbers;

    /**
     * Display a listing of posted or proforma orders.
     */
    public function index(Request $request)
    {
        $today = now()->format('Y-m-d');
        $startDate = $request->input('start_date', $today);
        $endDate = $request->input('end_date', $today);

        $query = BILOrder::with(['orderitems', 'customer']);

        if ($request->filled('search')) {
            $query->whereHas('customer', function ($q) use ($request) {
                $q->where('first_name', 'like', '%' . $request->search . '%')
                  ->orWhere('surname', 'like', '%' . $request->search . '%')
                  ->orWhere('other_names', 'like', '%' . $request->search . '%')
                  ->orWhere('company_name', 'like', '%' . $request->search . '%');
            });
        }

        $parsedStartDate = Carbon::parse($startDate)->startOfDay();
        $parsedEndDate = Carbon::parse($endDate)->endOfDay();
        $query->whereBetween('created_at', [$parsedStartDate, $parsedEndDate]);

        if ($request->filled('stage')) {
            $query->where('stage', $request->stage);
        }

        $query->whereIn('stage', [3, 4]); // Proforma (3) and Saved for Later (4)
        $query->orderByRaw("FIELD(payment_category, 'Cash', 'Insurance', 'Exemption', 'Invoice') ASC");        

        //$query->where('payment_category', 'Cash'); // Proforma (3) and Saved for Later (4)

        $orders = $query->orderBy('created_at', 'desc')->paginate(30)->withQueryString();

        return inertia('Billing/BilPosts/Index', [
            'orders' => $orders,
            'filters' => [
                'search'     => $request->input('search'),
                'stage'      => $request->input('stage'),
                'start_date' => $startDate,
                'end_date'   => $endDate,
            ],
        ]);
    }

    /**
     * Show the form for creating a new order.
     */
    public function create()
    {
        return inertia('Billing/BilPosts/Create', [
            'fromstore' => SIV_Store::all(),
            'priceCategories' => $this->fetchPriceCategories(),
            'facilityOptions' => FacilityOption::first(),
            'billinggroups' => PatientBillingGroup::all(),
            'billingsubgroups' => PatientBillingSubgroup::all(),
        ]);
    }

    /**
     * Show a confirmation view before saving a new order.
     * THIS METHOD HAS BEEN RESTORED.
     */
    public function confirmSave(Request $request)
    {
        Log::info('Confirm Save Payload:', $request->all());
        // Validate the incoming order data
        $validatedData = $request->validate([
            'billinggroup_id' => 'nullable|integer|exists:patient_billing_groups,id',
            'billingsubgroup_id' => 'nullable|integer|exists:patient_billing_subgroups,id',
            'billinggroupmembershipno' => 'nullable|string|max:255',
            'ward_id' => 'nullable|integer',
            'store_id' => 'required|integer|exists:siv_stores,id',
            'pricecategory_id' => 'required|string',
            'total' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:255', // <-- YOU MUST ADD THIS LINE
           
            'orderitems' => 'required|array|min:1',
            'orderitems.*.item_id' => 'required|integer|exists:bls_items,id',
            'orderitems.*.item_name' => 'required|string',
            'orderitems.*.quantity' => 'required|numeric|min:0.01',
            'orderitems.*.price' => 'required|numeric|min:0',

            // New fields for Multi-Store and Price Category tracking
            'orderitems.*.source_store_id' => 'nullable|integer', 
            'orderitems.*.source_store_name' => 'nullable|string', // Kept for display in the view
            'orderitems.*.price_ref' => 'nullable|string',
        ]);

        return inertia('Billing/BilPosts/SaveOrderConfirmation', [
            'orderData' => $validatedData
        ]);
    }

    /**
     * Store a newly created order with a "Saved for Later" status.
     */
    public function store(Request $request)
    {       
        // 1. Get the array of print instructions from the Trait
        $printData = $this->createOrder($request); 
        
        // 2. Redirect to the index page and flash the print instructions to the session
        return redirect()->route('billing1.index')->with('print_response', $printData);
    }
    /**
     * Show the form for editing the specified order.
     */
    public function edit(BILOrder $order)
    {
        // 1. Load relationships
        // Added 'orderitems.sourceStore' to efficiently fetch store names
        $order->load(['customer', 'store', 'orderitems.item', 'orderitems.sourceStore']);

        // 2. Inject 'stock_quantity' and 'source_store_name'
        $order->orderitems->each(function ($orderItem) use ($order) {
            
            // --- A. INJECT SOURCE STORE NAME ---
            if ($orderItem->sourceStore) {
                // If the item has a specific source store saved, use its name
                $orderItem->source_store_name = $orderItem->sourceStore->name;
            } elseif ($order->store) {
                // Fallback: If no specific source is set, it implies the Order's default store
                $orderItem->source_store_name = $order->store->name;
            } else {
                $orderItem->source_store_name = 'Unknown Store';
            }

            // --- B. STOCK QUANTITY LOGIC ---
            // Default to 0
            $orderItem->stock_quantity = 0;

            // Only fetch stock if the item exists and is linked to inventory (has product_id)
            if ($orderItem->item && $orderItem->item->product_id) {
                
                // Determine the context: Did this item come from a specific store or the default?
                $targetStoreId = $orderItem->source_store_id ?? $order->store_id;
                
                // Construct the dynamic column name (e.g., 'qty_1')
                $qtyColumn = 'qty_' . (int)$targetStoreId;

                // Query the inventory control table directly
                $stockRecord = DB::table('iv_productcontrol')
                    ->where('product_id', $orderItem->item->product_id)
                    ->select($qtyColumn)
                    ->first();

                // If record exists, assign the value to the object
                if ($stockRecord && isset($stockRecord->$qtyColumn)) {
                    $orderItem->stock_quantity = (float) $stockRecord->$qtyColumn;
                }
            }
        });

        return inertia('Billing/BilPosts/Edit', [
            'order' => $order,
            'fromstore' => SIV_Store::all(),             
            'priceCategories' => $this->fetchPriceCategories(),
            'facilityOptions' => FacilityOption::first(),
            'billinggroups' => PatientBillingGroup::all(),
            'billingsubgroups' => PatientBillingSubgroup::all(),   
        ]);
    }

    /**
     * Show the confirmation view before updating a saved order.
     */
    public function confirmUpdate(Request $request, BILOrder $order)
    {
        $orderData = $request->all();
        $orderData['id'] = $order->id; // Pass the order ID along

        return inertia('Billing/BilPosts/ConfirmOrderUpdate', [
            'orderData' => $orderData,
            'originalOrder' => $order->load('customer'), // Show original details for comparison
        ]);
    }

    /**
     * Update the specified order.
     */
    public function update(Request $request, BILOrder $order)
    {       
        // 1. Get the array of print instructions from the Trait
        $printData = $this->updateOrder($request, $order); 

        // 2. Redirect to the index page and flash the print instructions to the session
        return redirect()->route('billing1.index')->with('print_response', $printData);      
    }

    /**
     * Show the payment processing view for a new order.
     */
    public function confirmPayment(Request $request)
    {
    
        $validatedData = $request->validate([
            'billinggroup_id' => 'nullable|integer|exists:patient_billing_groups,id',
            'billingsubgroup_id' => 'nullable|integer|exists:patient_billing_subgroups,id',
            'billinggroupmembershipno' => 'nullable|string|max:255',
            'ward_id' => 'nullable|integer',
            'store_id' => 'required|integer|exists:siv_stores,id',
            'pricecategory_id' => 'required|string',
            'total' => 'required|numeric|min:0',
            'orderitems' => 'required|array|min:1',
            
            'orderitems.*.item_id' => 'required|integer|exists:bls_items,id',
            'orderitems.*.item_name' => 'required|string', 
            'orderitems.*.quantity' => 'required|numeric|min:0.01',
            'orderitems.*.price' => 'required|numeric|min:0',
            
            'orderitems.*.source_store_id' => 'nullable|integer',
            'orderitems.*.source_store_name' => 'nullable|string',
            'orderitems.*.price_ref' => 'nullable|string',
        ]);

        return inertia('Billing/BilPosts/ProcessPayment', [
            'orderData' => $validatedData,
            'facilityoption' => FacilityOption::first(),
            'paymentMethods' => BLSPaymentType::all(),
        ]);
    }

    /**
     * Show the payment view for an existing order.
     */
    public function confirmExistingPayment(Request $request, BILOrder $order)
    {      

        $orderData = $request->all();
        $orderData['id'] = $order->id;

        return inertia('Billing/BilPosts/ProcessExistingOrderPayment', [
            'orderData' => $orderData,
            'originalOrder' => $order->load('customer'),
            'paymentMethods' => BLSPaymentType::all(),
        ]);
    }
   
    /**
     * Processes the payment and handles Printing logic (Silent vs Preview).
     */
    public function processPayment(Request $request, BILOrder $order = null)
    {
        
        
        // 1. Manual ID Check (Same as before)
        if (!$order) {
            $orderId = $request->input('id') ?? $request->input('order');
            if ($orderId) {
                $order = BILOrder::find($orderId);
            }
        }
        
        //
        $facilityOption = FacilityOption::first();

        if ($facilityOption?->cash_payment_control_number) {  

            $controlService = new ControlNumberService();

            $controlResponse = $controlService->validatePaymentForOrder($order);            

            if (
                    !isset($controlResponse['status']) ||
                    $controlResponse['status'] !== 'success'
                ) {

                    $errorMessage = $controlResponse['message']
                        ?? 'API Error: Failed to validate payment.';

                    throw ValidationException::withMessages([
                        'api_error' => $errorMessage,
                        'customer'  => $errorMessage,
                    ]);
                }
        }

        // 2. Validation (Same as before)
        $validated = $request->validate([
            'orderitems' => 'required|array|min:1',
            'orderitems.*.id' => 'nullable|exists:bil_orderitems,id',
            'orderitems.*.item_id' => 'required|integer|exists:bls_items,id',
            'orderitems.*.quantity' => 'required|numeric|min:0.01',
            'orderitems.*.price' => 'required|numeric|min:0',
            
            'orderitems.*.source_store_id' => 'nullable|integer', 
            'orderitems.*.source_type' => 'nullable|string',
            'orderitems.*.source_id' => 'nullable|integer',

            'payment_method' => 'nullable|integer|exists:bls_paymenttypes,id',
            'paid_amount' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'customer_id' => 'required|integer|exists:bls_customers,id',
            'store_id' => 'required|integer|exists:siv_stores,id',
            
            'billinggroup_id' => 'nullable|integer|exists:patient_billing_groups,id',
            'billingsubgroup_id' => 'nullable|integer|exists:patient_billing_subgroups,id',
            'billinggroupmembershipno' => 'nullable|string|max:255',
            'ward_id' => 'nullable|integer',
        ]);

        try {
            // 3. Database Transaction (Save Sale)
            $sale = DB::transaction(function () use ($validated, $order) {                

                // A. Financial Posting (Existing Logic)
                $finalOrder = $this->createOrUpdateFinalOrder($validated, $order);
                $saleRecord = $this->postBills($validated, $finalOrder);

                // B. Clinical Linkage: Mark Source Items as PAID
                foreach ($validated['orderitems'] as $item) {
                    $this->updateClinicalSourceStatus($item);
                }

                return $saleRecord;
            });

            session(['latest_sale_id' => $sale->id]);

            // ============================================================
            // 4. PRINTING LOGIC START
            // ============================================================
            
            // Get Context: Current User Group & Machine Name
            $userGroupId = Auth::user()->usergroup_id;
            $machineName = gethostname(); 

            // Query Configuration
            // We look for a config for this Group + DocType + (Specific Machine OR Any Machine)
            $printerConfig = UserGroupPrinter::where('usergroup_id', $userGroupId)
                ->where('documenttypecode', 'invoice') 
                ->where('autoprint', true) // Must be set to Auto Print
                ->where(function ($query) use ($machineName) {
                    $query->where('machinename', $machineName)
                          ->orWhere('machinename', '')
                          ->orWhereNull('machinename');
                })
                // Order by length of machinename desc so specific matches ("PC-01") come before generic matches ("")
                ->orderByRaw('LENGTH(machinename) DESC') 
                ->first();

            $backendPrinted = false;
            $frontendAutoPrint = false;           
            $invoiceUrl = route('billing1.invoice_preview');// Default URL

            
             // IF Configuration exists
            if ($printerConfig) {
                
                // CASE 1: Silent Print Requested (!printtoscreen)
                if (!$printerConfig->printtoscreen) {
                    
                    // Attempt Backend Printing (SumatraPDF)
                    // This creates the PDF temporarily on the server
                    $tempPdfPath = $this->generateTempPdf($sale);
                    
                    if ($this->printToBackendPrinter($tempPdfPath, $printerConfig->printername)) {
                        // SUCCESS: Server printed it physically (Local Deployment)
                        $backendPrinted = true;
                        $receiptUrl = null; // No need to show PDF in browser
                    } else {
                        // FAIL: Server couldn't print (Cloud Deployment or missing EXE)
                        // Fallback: Tell Frontend to Auto-Print via Iframe
                        $frontendAutoPrint = true;
                    }

                } else {
                    // CASE 2: Preview Requested (printtoscreen = 1)
                    // Frontend will open New Tab
                    $frontendAutoPrint = false; 
                }
            }  
           
               
            // ============================================================
            // 5. RETURN RESPONSE
            // ============================================================

            $msg = 'Payment processed successfully.';
            if ($backendPrinted) {
                $msg .= ' Sent to server printer: ' . $printerConfig->printername;
            }

            return response()->json([
                'success' => true,
                'invoice_url' => $invoiceUrl,
                'auto_print' => $frontendAutoPrint, // True = Iframe, False = New Tab
                'backend_printed' => $backendPrinted, // True = Done on server
                'message' => $msg,
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // FIX: Re-throw validation exceptions so Laravel sends 422 JSON
            throw $e;
        } catch (\Exception $e) {
            // Only catch unexpected server errors here
            Log::error('Error payment:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'An unexpected error occurred: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Helper to update the payment_status in clinical tables
     */
    private function updateClinicalSourceStatus(array $item)
    {
        // Skip if no source info provided
        if (empty($item['source_type']) || empty($item['source_id'])) {
            return;
        }

        $id = $item['source_id'];

        try {
            switch ($item['source_type']) {
                case 'consultation':
                    // Updates OpdBooking
                    OpdBooking::where('id', $id)->update(['payment_status' => 'paid']);
                    break;

                case 'laboratory':
                    // Updates LabPrescription (Ready for Sample Collection)
                    LabPrescription::where('id', $id)->update(['payment_status' => 'paid']);
                    break;

                case 'radiology':
                    // Updates RadRequest (Ready for Imaging)
                    RadRequest::where('id', $id)->update(['payment_status' => 'paid']);
                    break;

                case 'pharmacy':
                    // Updates PharmacyPrescription (Ready for Dispensing)
                    PharmacyPrescription::where('id', $id)->update(['payment_status' => 'paid']);
                    break;

                case 'theatre':
                    // Updates TheatreBooking (Ready for Procedure)
                    TheatreBooking::where('id', $id)->update(['payment_status' => 'paid']);
                    break;
            }
        } catch (\Exception $e) {
            // Log error but don't fail the financial transaction if a status update fails
            Log::error("Failed to update clinical status for {$item['source_type']} #{$id}: " . $e->getMessage());
        }
    }

     /**
     * Tries to print using SumatraPDF. Returns TRUE if successful, FALSE if not found.
     */
    private function printToBackendPrinter($filePath, $printerName)
    {
        // 1. Check if SumatraPDF exists (Only exists on Local Windows Deployments)
        $printerExe = public_path('SumatraPDF.exe');
        
        if (!file_exists($printerExe) && strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            Log::warning("SumatraPDF.exe missing. Falling back to browser print.");
            return false;
        }

        // 2. Check for Linux 'lp' (Only exists on Linux servers with CUPS configured)
        // If on DigitalOcean without CUPS, this usually fails or does nothing useful for client printers
        if (strtoupper(substr(PHP_OS, 0, 3)) !== 'WIN') {
             // Optional: If you have a specific setup for Linux local servers
             // exec("lp ...", $output, $returnVar);
             // return $returnVar === 0;
             return false; // Default to Browser Print on Linux/Cloud
        }

        // 3. Execute Windows Print Command
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
     * Generates a temporary PDF file for backend printing
     */
    private function generateTempPdf($sale)
    {
        // A. Generate PDF
        $facility = FacilityOption::first();

        // 1. Define Custom Paper Size [0, 0, Width, Height] in points
        // 80mm = 226.77 points. 
        // We set height to 600-1000 points to accommodate long receipts.
        $customPaper = array(0, 0, 226.77, 1000);

        $pdf = Pdf::loadView('pdfs.sale_invoice', [
            'sale' => $sale,
            'facility' => $facility,
        ])->setPaper($customPaper, 'portrait'); // <--- APPLY HERE

        // B. Save to Temp File
        $fileName = 'invoice_' . $sale->id . '_' . time() . '.pdf';
        $directory = storage_path('app/public/temp_invoices');
        
        if (!file_exists($directory)) {
            mkdir($directory, 0755, true);
        }
        
        $filePath = $directory . '/' . $fileName;
        $pdf->save($filePath);
        
        return $filePath;
    }

    public function invoicePreview()
    {
        $saleId = session('latest_sale_id');
        if (!$saleId) {
            return redirect()->route('billing1.index')->with('error', 'No sale to display.');
        }

        $sale = BILSale::findOrFail($saleId);
        $facility = FacilityOption::first();

        $customPaper = array(0, 0, 226.77, 1000); 

        $pdf = Pdf::loadView('pdfs.sale_invoice', [
            'sale' => $sale,
            'facility' => $facility,
        ])->setPaper($customPaper, 'portrait');

        // Send PDF with correct headers so browser opens it
        return response($pdf->output(), 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="invoice_' . ($sale->invoiceno ?? $sale->receiptno) . '.pdf"');
    }

    /**
     * Renders the Control Number PDF to the browser for preview or frontend printing.
     */
    public function controlNumberPreview()
    {
        // 1. Retrieve the data saved in the session during createOrder/updateOrder
        $orderId = session('latest_order_id');
        $controlResponse = session('latest_control_response');

        if (!$orderId) {
            // Adjust the redirect route to match your application's flow
            return redirect()->back()->with('error', 'No control number to display.');
        }

        // 2. Fetch the Order and eager load relationships needed for the receipt
        $order = BILOrder::with(['customer', 'orderitems.item'])->findOrFail($orderId);
        
        // 3. Fetch Facility details for the header
        $facility = FacilityOption::first();

        // 4. Define Custom Paper Size [0, 0, Width, Height] in points
        // 80mm = 226.77 points. Height is long (1000) to act as a continuous roll.
        $customPaper = array(0, 0, 226.77, 1000); 

        // 5. Generate the PDF
        $pdf = Pdf::loadView('pdfs.control_number_receipt', [
            'order' => $order,
            'controlResponse' => $controlResponse,
            'facility' => $facility,
        ])->setPaper($customPaper, 'portrait');

        // 6. Return as inline PDF so the browser opens it in a preview/print tab
        return response($pdf->output(), 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="control_number_ORD-' . $order->id . '.pdf"');
    }

    //--------------------------------------------------------------------------
    // PRIVATE HELPER METHODS
    //--------------------------------------------------------------------------

    /**
     * Creates a new order or updates an existing one for the final payment stage.
     */
    private function createOrUpdateFinalOrder(array $validated, ?BILOrder $order): BILOrder
    {
        $calculatedTotal = collect($validated['orderitems'])->sum(fn($item) => $item['quantity'] * $item['price']);

        $orderData = [
            'customer_id' => $validated['customer_id'],
            'store_id' => $validated['store_id'],
            'stage' => 5, // Final "Posted" stage
            'total' => $calculatedTotal,
            'user_id' => Auth::id(),
        ];

        if ($order) {
            $order->update($orderData);
        } else {
            $order = BILOrder::create($orderData);
        }

        // Sync order items (add, update, delete)
        $incomingItemIds = collect($validated['orderitems'])->pluck('id')->filter()->all();
        $order->orderitems()->whereNotIn('id', $incomingItemIds)->delete();
        foreach ($validated['orderitems'] as $itemData) {
            $order->orderitems()->updateOrCreate(['id' => $itemData['id'] ?? null], $itemData);
        }

        return $order->fresh(); // Return a fresh instance with all relations
    }

    /**
     * Orchestrates all accounting and inventory posting after a sale is finalized.
     */
    private function postBills(array $data, BILOrder $order):BILSale
    {
        $transdate = Carbon::now();
        $totalDue = $data['total'];
        $paidAmount = $data['paid_amount'] ?? 0;
        $hasPayment = $paidAmount > 0;
        $isCreditSale = $paidAmount < $totalDue;

        // Generate unique numbers only if they are needed
        $receiptNo = $hasPayment ? $this->generateUniqueNumber(BILReceipt::class, 'receiptno', 'REC') : null;
        $invoiceNo = $isCreditSale ? $this->generateUniqueNumber(BILInvoice::class, 'invoiceno', 'INV') : null;
        

       
        $sale = $this->createSaleRecord($data, $transdate, $receiptNo, $invoiceNo);
        //$this->createInventoryRequisition($data, $transdate, $order->orderitems, $sale);
        $this->createOrders($data, $order->orderitems); // Pass the newly created sale items for accurate store linkage

        if ($isCreditSale) {
            $this->handleInvoicingAndDebtors($data, $transdate, $invoiceNo, $receiptNo);
        }

        if ($hasPayment && !$isCreditSale) {
            $this->createReceiptRecord($data, $transdate, $receiptNo);
        }

        if ($hasPayment) {
            $paymentSource = $isCreditSale ? PaymentSources::InvoicePayment->value : PaymentSources::CashSale->value;
            $this->createCollectionRecord($data, $transdate, $receiptNo, $paymentSource);
        }

        return $sale;
        
    }

    /**
     * Creates the primary sale record.
     */
    private function createSaleRecord(array $data, Carbon $transdate, ?string $receiptNo, ?string $invoiceNo):BILSale
    {           

        $sale = BILSale::create([
            'transdate' => $transdate,
            'customer_id' => $data['customer_id'],
            'billinggroup_id' => $data['billinggroup_id'],
            'billingsubgroup_id' => $data['billingsubgroup_id'],
            'billinggroupmembershipno' => $data['billinggroupmembershipno'],
            'ward_id' => $data['ward_id'], 
            'receiptno' => $receiptNo,
            'invoiceno' => $invoiceNo,
            'totaldue' => $data['total'],
            'totalpaid' => $data['paid_amount'] ?? 0,
            'changeamount' => max(0, ($data['paid_amount'] ?? 0) - $data['total']),
            'yearpart' => $transdate->year,
            'monthpart' => $transdate->month,
            'transtype' => BillingTransTypes::Sales->value,
            'user_id' => Auth::id(),
        ]);
        $sale->items()->createMany($data['orderitems']);
        return $sale;
    }

    /**
     * Modified: Creates inventory requisitions.
     * Logic: Automatic stock deduction (Stage 4) ONLY happens for the User's Default Store.
     * Items from other stores create a pending request (Stage 3).
     */
    
    private function createInventoryRequisition(array $data, Carbon $transdate, $orderItems, BILSale $sale): void
    {
        $inventoryService = new InventoryService();
        
        // 1. Get Global Config
        $facilityOptions = FacilityOption::first();
        $globalAutoIssue = $facilityOptions?->affectstockatcashier ?? true;
        $allowNegative = $facilityOptions?->allownegativestock ?? false;
        
        // 2. Get User's Default Store
        $userDefaultStoreId = Auth::user()->store_id;

        // Eager load relationships
        $orderItems->load('item.product');

        // 3. Group items by their source store
        $groupedItems = $orderItems->groupBy(function ($item) use ($data) {
            return $item->source_store_id ?? $data['store_id'];
        });

        foreach ($groupedItems as $storeId => $items) {            
           
            // --- Backend Stock Validation ---
            if (!$allowNegative) {
                // 1. Group items by product_id and sum the quantities
                // This handles cases where barcode scanning adds multiple lines for the same item
                $aggregatedItems = $items->groupBy(function ($item) {
                    return $item->item->product_id;
                })->map(function ($group) {
                    return [
                        'product_id' => $group->first()->item->product_id,
                        'item_name'  => $group->first()->item_name,
                        'total_qty'  => $group->sum('quantity')
                    ];
                });

                // 2. Validate the aggregated totals
                foreach ($aggregatedItems as $aggItem) {
                    // Skip service items (no product_id)
                    if (!$aggItem['product_id']) {
                        continue;
                    }

                    $qtyColumn = 'qty_' . (int)$storeId;
                    
                    // Fetch current stock
                    $currentStock = DB::table('iv_productcontrol')
                        ->where('product_id', $aggItem['product_id'])
                        ->value($qtyColumn);

                    $currentStock = (float)($currentStock ?? 0);
                    $requestedQty = (float)$aggItem['total_qty'];

                    if ($requestedQty > $currentStock) {
                        throw \Illuminate\Validation\ValidationException::withMessages([
                            'orderitems' => ["Insufficient stock for '{$aggItem['item_name']}'. Available: {$currentStock}, Requested Total: {$requestedQty}."]
                        ]);
                    }
                }
            }           
            // -------------------------------------

            // 4. Check if this group belongs to the User's Default Store
            $isDefaultStore = ($storeId == $userDefaultStoreId);

            // 5. Determine Stage
            $stage = 3; 
            if ($globalAutoIssue && $isDefaultStore) {
                $stage = 4;
            }

            // Create Requisition (Initial total 0)
            $requisition = IVRequistion::create([
                'sale_id' => $sale->id, 
                'transdate' => $transdate,
                'tostore_id' => $data['customer_id'],
                'tostore_type' => StoreType::Customer->value,
                'fromstore_id' => $storeId,
                'stage' => $stage, 
                'total' => 0,
                'user_id' => Auth::id(),
            ]);

            $requisitionItemsData = [];
            $calculatedTotal = 0; // Initialize Total Variable

            foreach ($items as $orderItem) {
                if ($product = $orderItem->item->product) {
                    
                    // Safe cast to float to ensure math works
                    $qty = (float) $orderItem->quantity;
                    $cost = (float) $product->costprice;

                    // Add to running total immediately
                    $calculatedTotal += ($qty * $cost);

                    $requisitionItemsData[] = [
                        'product_id' => $product->id,
                        'quantity' => $qty,
                        'price' => $cost, 
                    ];
                }
            }

            if (!empty($requisitionItemsData)) {
                $requisition->requistionitems()->createMany($requisitionItemsData);
                
                // Update with the calculated total from the loop
                $requisition->total = $calculatedTotal;
                $requisition->saveQuietly(); 

                // 6. Issue Stock Logic
                if ($globalAutoIssue && $isDefaultStore) {
                    $deliveryNo = $this->generateUniqueNumber(IVIssue::class, 'delivery_no', 'ISS');
                    $customer = BLSCustomer::find($data['customer_id']); 
                    $tostore_name = $customer ? ($customer->company_name ?? trim("{$customer->first_name} {$customer->surname}")) : 'Guest';
                    
                    $inventoryService->issue(
                        $storeId,
                        $data['customer_id'],
                        StoreType::Customer->value,
                        $tostore_name,
                        $requisitionItemsData,
                        $deliveryNo,
                        null 
                    );
                }
            }
        }
    }

    /**
     * Handles creation of invoices, debtor records, and all related logs for credit sales.
     */
    private function handleInvoicingAndDebtors(array $data, Carbon $transdate, string $invoiceNo, ?string $receiptNo): void
    {
        $paidAmount = $data['paid_amount'] ?? 0;
        $totalDue = $data['total'];
        $balance = $totalDue - $paidAmount;
        $userId = Auth::id();

        // 1. Create Invoice
        $invoice = BILInvoice::create([
            'transdate' => $transdate, 'customer_id' => $data['customer_id'], 'invoiceno' => $invoiceNo,
            'totaldue' => $totalDue, 'totalpaid' => $paidAmount, 'balancedue' => $balance,
            'status' => $balance <= 0 ? InvoiceStatus::Closed->value : InvoiceStatus::Open->value,
            'yearpart' => $transdate->year, 'monthpart' => $transdate->month, 'user_id' => $userId,
        ]);
        $invoice->items()->createMany($data['orderitems']);

        // 2. Create Invoice Logs
        BILInvoiceLog::create([
            'transdate' => $transdate, 'customer_id' => $data['customer_id'], 'reference' => $invoiceNo,
            'invoiceno' => $invoiceNo, 'debitamount' => $totalDue, 'creditamount' => 0,
            'transtype' => InvoiceTransTypes::NewInvoice->value, 'transdescription' => 'Sales', 'user_id' => $userId,
        ]);
        if ($receiptNo) {
            BILInvoiceLog::create([
                'transdate' => $transdate, 'customer_id' => $data['customer_id'], 'reference' => $receiptNo,
                'invoiceno' => $invoiceNo, 'debitamount' => 0, 'creditamount' => $paidAmount,
                'transtype' => InvoiceTransTypes::Payment->value, 'transdescription' => 'Payment', 'user_id' => $userId,
            ]);
        }

        // 3. Update Debtor Record
        $debtor = BILDebtor::firstOrCreate(
            ['customer_id' => $data['customer_id'], 'debtortype' => 'Individual'],
            ['transdate' => $transdate, 'balance' => 0, 'user_id' => $userId]
        );
        $debtor->increment('balance', $balance);

        // 4. Create Debtor Logs
        BILDebtorLog::create([
            'transdate' => $transdate, 'debtor_id' => $debtor->id, 'reference' => $invoiceNo, 'debtortype' => 'Individual',
            'debitamount' => $totalDue, 'creditamount' => 0, 'transtype' => BillingTransTypes::Invoice->value,
            'transdescription' => 'Sales', 'user_id' => $userId,
        ]);
        if ($receiptNo) {
            BILDebtorLog::create([
                'transdate' => $transdate, 'debtor_id' => $debtor->id, 'reference' => $receiptNo, 'debtortype' => 'Individual',
                'debitamount' => 0, 'creditamount' => $paidAmount, 'transtype' => BillingTransTypes::Payment->value,
                'transdescription' => 'Payment', 'user_id' => $userId,
            ]);
        }

        // 5. Create Invoice Payment Details
        if ($receiptNo) {
            BILInvoicePayment::create([
                'transdate' => $transdate, 'receiptno' => $receiptNo, 'customer_id' => $data['customer_id'],
                'totalpaid' => $paidAmount, 'yearpart' => $transdate->year, 'monthpart' => $transdate->month, 'user_id' => $userId,
            ]);
            BILInvoicePaymentDetail::create([
                'receiptno' => $receiptNo, 'invoiceno' => $invoiceNo, 'totaldue' => $totalDue, 'totalpaid' => $paidAmount,
            ]);
        }
    }

    /**
     * Creates a receipt record for a fully paid cash sale.
     */
    private function createReceiptRecord(array $data, Carbon $transdate, string $receiptNo): void
    {
        $receipt = BILReceipt::create([
            'transdate' => $transdate,
            'customer_id' => $data['customer_id'],
            'receiptno' => $receiptNo,
            'totaldue' => $data['total'],
            'totalpaid' => $data['paid_amount'] ?? 0,
            'changeamount' => max(0, ($data['paid_amount'] ?? 0) - $data['total']),
            'yearpart' => $transdate->year,
            'monthpart' => $transdate->month,
            'user_id' => Auth::id(),
        ]);
        $receipt->items()->createMany($data['orderitems']);
    }

    /**
     * Creates a collection record for any payment received.
     */
    private function createCollectionRecord(array $data, Carbon $transdate, string $receiptNo, string $paymentSource): void
    {
        if (empty($data['payment_method']) || empty($data['paid_amount'])) {
            return;
        }

        $paymentMethodColumn = 'paytype' . str_pad($data['payment_method'], 6, '0', STR_PAD_LEFT);

        BILCollection::create([
            'transdate' => $transdate,
            'receiptno' => $receiptNo,
            'paymentsource' => $paymentSource,
            'customer_id' => $data['customer_id'],
            'yearpart' => $transdate->year,
            'monthpart' => $transdate->month,
            'transtype' => BillingTransTypes::Payment->value,
            'user_id' => Auth::id(),
            $paymentMethodColumn => $data['paid_amount'],
        ]);
    }   
   

    public function getPendingBills(Request $request, BillingService $billingService)
    {
        $request->validate([
            'patient_code' => 'required|string',
            'discharge_date' => 'nullable|date',
        ]);        


        // 1. Fetch the Active Admission to calculate bed charges
        // We need this to define $admission for the logic below
        $admission = IpdAdmission::with(['ward.blsItem', 'patient'])
            ->where('patientcode', $request->patient_code)
            ->whereIn('status', ['Admitted', 'Discharge Pending'])// Only process for currently admitted patients
            ->first();       

        // -------------------------------------------------------------
        // 2. CATCH-UP BILLING: Charge for any unbilled days
        // -------------------------------------------------------------
        if ($admission && $admission->ward && $admission->ward->blsItem) {
            
            $startDate = Carbon::parse($admission->admission_date);
            // Use requested discharge date, or default to NOW if just checking status
            $endDate = $request->discharge_date ? Carbon::parse($request->discharge_date) : Carbon::now();
            
            // Sanity check: ensure we don't calculate into the future beyond reasonable scope if date is mistakenly set
            if ($endDate->gt(Carbon::now()->addDay())) {
                $endDate = Carbon::now();
            }

            $currentDate = $startDate->copy();
            
            // Loop until (and including) discharge/current date
            while ($currentDate->lte($endDate)) {
                $dateString = $currentDate->format('Y-m-d');

                // Check if charge exists for this specific date
                $exists = IpdBedCharge::where('ipd_admission_id', $admission->id)
                    ->where('charge_date', $dateString)
                    ->exists();

                if (!$exists) {
                    // A. Create Clinical Log
                    $charge = IpdBedCharge::create([
                        'ipd_admission_id' => $admission->id,
                        'charge_date' => $dateString,
                        'amount' => $admission->ward->blsItem->price1
                    ]);

                    // B. Push to Billing
                    $billingService->addToBill(
                        $admission->patientcode,
                        $admission->billinggroup_id,
                        $admission->billingsubgroup_id,
                        $admission->billinggroupmembershipno,
                        $admission->ward_id,
                        $admission->ward->blsItem->id, // Bill Item ID
                        1,                             // Quantity
                        'ipd_bed_charge',              // Source Type
                        $charge->id,                   // Source ID
                        $admission->pricecategory,
                        $admission->patient?->payment_category
                    );
                }

                $currentDate->addDay();
            }
        }
        // -------------------------------------------------------------

        // 3. Fetch Pending Bills
        $query = BILOrder::with(['customer', 'orderitems'])
            ->whereIn('stage', [3, 4]); // 3=Proforma, 4=Saved (Pending Payment)

        // Filter by patient_code
        if ($request->has('patient_code')) {
            $query->whereHas('customer', function($q) use ($request) {
                $q->where('patient_code', $request->patient_code);
            });
        } else {
            $query->limit(50);
        }

        $bills = $query->orderBy('created_at', 'desc')->get();

        // Transform for frontend display
        $bills->transform(function ($bill) {
            $bill->customer_name = $bill->customer ? $bill->customer->display_name : 'Walk-in / Unknown';
            // Optional: Calculate totals if not in DB
            $bill->total_amount = $bill->orderitems->sum(fn($item) => $item->qty * $item->price); 
            return $bill;
        });

        return response()->json($bills);
    }

    /**
     * Generate clinical orders based on billed items.
     * Handles Walk-in / Pass Buyers by auto-creating Patient & Booking.
     */
    public function createOrders(array $data, $orderItems)
    {
        // 1. Identify the Customer
        $customer = \App\Models\Billing\BLSCustomer::find($data['customer_id']);
        
        // --- LOGIC START: Handle Patient & Booking (Pass Buyer Support) ---
        
        $patientCode = $customer ? $customer->patient_code : null;
        $booking = null;

        // A. If Patient Code doesn't exist, Create a "Dummy/Walk-in" Patient
        if (!$patientCode) {
            
            // 1. Generate Unique Code
            do {
                $generatedCode = 'WALK-' . date('ymd') . '-' . mt_rand(100, 999);
            } while (\App\Models\Patient\Patient::where('code', $generatedCode)->exists());
            
            $patientCode = $generatedCode;

            // 2. Create Patient Record (Use defaults for unknown fields)
            \App\Models\Patient\Patient::create([
                'code'          => $patientCode,
                'first_name'    => $customer->first_name ?? 'Walk-in',
                'last_name'     => $customer->surname ?? 'Customer',
                'middle_name'   => $customer->other_names ?? null,
                'gender'        => 'Unknown', // Default for pass buyers
                'date_of_birth' => now()->subYears(18), // Default approx adult
                'phone_number'  => $customer->phone ?? '0000000000',
                'payment_category' => 'Cash',
                'address'       => 'N/A'
            ]);

            // 3. Update Customer to link to this new Patient Code
            if ($customer) {
                $customer->update(['patient_code' => $patientCode]);
            }
        }

        // B. Find Active Booking for Today
        $booking = \App\Models\Opd\OpdBooking::where('patientcode', $patientCode)
            ->whereDate('created_at', \Carbon\Carbon::today())
            ->latest()
            ->first();

        // C. If No Booking Exists, Create a "Dummy/Walk-in" Booking
        if (!$booking) {
            // Get Defaults for required fields
            $defaultPoint = \App\Models\Opd\OpdTreatmentPoint::first(); 
            $defaultGroup = PatientBillingGroup::where('name', 'Cash')->first();

            $booking = \App\Models\Opd\OpdBooking::create([
                'bookdate'           => now(),
                'patientcode'        => $patientCode,
                'treatmentpoint_id'  => $defaultPoint ? $defaultPoint->id : 1,
                'billinggroup_id'    => $defaultGroup ? $defaultGroup->id : 1,
                'user_id'            => \Illuminate\Support\Facades\Auth::id(), // Cashier ID
                'doctor_user_id'     => null, // No Doctor
                'wheretaken'         => 'Direct Billing',
                'DoctorName'         => 'Walk-in',
                'vitalsignstatus'    => 'Closed', // Skip vitals
                'consultation_status'=> 'Seen',   // Mark as completed immediately
                'visit_classification'=> 'Walk-in',
                'pricecategory'      => 'price1',
                'payment_status'     => 'paid'
            ]);
        }
        
        $bookingId = $booking->id;

        // --- LOGIC END: Patient & Booking Resolved ---


        // 2. Eager load definitions
        if (method_exists($orderItems, 'load')) {
            $orderItems->load(['item.labPanel', 'item.radProcedure', 'item.product', 'item.theatreProcedure']);
        }

        // 3. Create Clinical Records
        foreach ($orderItems as $lineItem) {
            
            $blsItem = $lineItem->item; 
            if (!$blsItem) continue;

            // --- Laboratory ---
            if ($blsItem->lab_panel_id) {
                $exists = \App\Models\Laboratory\LabPrescription::where('opd_booking_id', $bookingId)
                    ->where('lab_panel_id', $blsItem->lab_panel_id)
                    ->exists();

                if(!$exists) {
                    \App\Models\Laboratory\LabPrescription::create([
                        'opd_booking_id' => $bookingId,
                        'patientcode'    => $patientCode,
                        'doctor_user_id' => \Illuminate\Support\Facades\Auth::id(),
                        'lab_panel_id'   => $blsItem->lab_panel_id,
                        'status'         => 'Requested',
                        'payment_status' => 'paid'
                    ]);
                }
            }

            // --- Radiology ---
            elseif ($blsItem->rad_procedure_id) {
                $exists = \App\Models\Radiology\RadRequest::where('opd_booking_id', $bookingId)
                    ->where('rad_procedure_id', $blsItem->rad_procedure_id)
                    ->exists();

                if(!$exists) {
                    \App\Models\Radiology\RadRequest::create([
                        'opd_booking_id'   => $bookingId,
                        'patientcode'      => $patientCode,
                        'requested_by'     => \Illuminate\Support\Facades\Auth::id(),
                        'rad_procedure_id' => $blsItem->rad_procedure_id,
                        'status'           => 'Ordered',
                        'payment_status'   => 'paid',
                        'accession_number' => 'RAD-' . date('YmdHis') . '-' . rand(100, 999)
                    ]);
                }
            }

            // --- Pharmacy ---
            elseif ($blsItem->product_id) {
                $qty = $lineItem['quantity'] ?? 1;
                
                $exists = \App\Models\Pharmacy\PharmacyPrescription::where('opd_booking_id', $bookingId)
                    ->where('product_id', $blsItem->product_id)
                    ->exists();
                if(!$exists) {
                    \App\Models\Pharmacy\PharmacyPrescription::create([
                        'opd_booking_id'      => $bookingId,
                        'patientcode'         => $patientCode,
                        'doctor_user_id'      => \Illuminate\Support\Facades\Auth::id(),
                        'product_id'          => $blsItem->product_id,
                        'dosage'              => 'As Directed', 
                        'frequency'           => 'OD',
                        'duration'            => '1 Day',
                        'quantity_prescribed' => $qty,
                        'status'              => 'Prescribed',
                        'payment_status'      => 'paid'
                    ]);
                }
            }

            // --- Theatre ---
            elseif ($blsItem->theatre_procedure_id) {
                $exists = \App\Models\Theatre\TheatreBooking::where('opd_booking_id', $bookingId)
                    ->where('theatre_procedure_id', $blsItem->theatre_procedure_id)
                    ->exists();
                if(!$exists) {  
                    \App\Models\Theatre\TheatreBooking::firstOrCreate([
                        'opd_booking_id'       => $bookingId,
                        'theatre_procedure_id' => $blsItem->theatre_procedure_id,
                    ], [
                        'patientcode'    => $patientCode,
                        'doctor_user_id' => \Illuminate\Support\Facades\Auth::id(),
                        'scheduled_at'   => now(),
                        'status'         => 'Scheduled',
                        'payment_status' => 'paid'
                    ]);
                }
            }
        }
    }


}
