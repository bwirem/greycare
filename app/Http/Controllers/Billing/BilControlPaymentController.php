<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Inertia\Inertia;

// Models
use App\Models\Billing\BILControlNumber; // Assuming this model exists based on C# clsBill
use App\Models\Facility\FacilityOption;
use App\Models\Patient\Patient;

class BilControlPaymentController extends Controller
{
    /**
     * Display a listing of control numbers / payments.
     */
    public function index(Request $request)
    {
        $query = BILControlNumber::with(['user']);

        // Filter by Patient Name/Code
        if ($request->filled('search')) {
            $query->where('patient_name', 'like', '%' . $request->search . '%')
                  ->orWhere('patient_code', 'like', '%' . $request->search . '%')
                  ->orWhere('controlno', 'like', '%' . $request->search . '%');
        }

        // Filter by Status (Recorded, Paid, Closed)
        if ($request->filled('status')) {
            $query->where('numberstatus', $request->status);
        }

        $payments = $query->orderBy('created_at', 'desc')->paginate(10);

        return inertia('Billing/Payments/Index', [
            'payments' => $payments,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Logic: C# "if (Convert.ToInt16(...) == 1 && ... != "0")"
     * Checks DB for existing Control Number. If not found, calls API to generate one.
     */
    public function requestControlNumber(Request $request)
    {
        $request->validate([
            'patient_id'   => 'required',
            'patient_name' => 'required',
            'amount'       => 'required|numeric|min:1',
            'description'  => 'nullable|string',
            'mobile_number'=> 'required|string',
            'payment_ref'  => 'required|string', // Internal Reference
        ]);

        $transDate = Carbon::today();
        
        // 1. Check Local Database (Equivalent to pMdtBilling.View_ControlNumber)
        $existingBill = BILControlNumber::where('patient_code', $request->patient_id)
            ->where('numberstatus', 'recorded')
            ->whereDate('created_at', $transDate) 
            ->first();

        if ($existingBill) {
            return response()->json([
                'status'        => 'success',
                'control_no'    => $existingBill->controlno,
                'amount'        => $existingBill->amount,
                'description'   => $existingBill->paymentdescription,
                'number_status' => $existingBill->numberstatus,
                'message'       => 'Existing valid control number found.'
            ]);
        } 

        // 2. If no local record, call external API (The #region Save logic)
        return $this->generateApiControlNumber($request);
    }

    /**
     * Logic: C# "Save()" Region
     * Connects to external Gateway to get Control Number
     */
    private function generateApiControlNumber(Request $request)
    {
        $setup = FacilitySetup::first();

        if (!$setup) {
            return response()->json(['status' => 'error', 'message' => 'Facility setup/Configuration missing.'], 500);
        }

        // Prepare Payload
        $payload = [
            'service'            => 'ADD',
            'corporate_id'       => $setup->corporateid,
            'corporate_id2'      => '',
            'corporate_name'     => $setup->facilitydescription,
            'customer_name'      => $request->patient_name,
            'paymentReference'   => $request->payment_ref,
            'branch_name'        => $setup->facilitydescription,
            'paymentDescription' => $request->description ?? 'Medical Services',
            'paymentType'        => $setup->crdbpaymenttype, 
            'mobile_number'      => $request->mobile_number,
            'token_id'           => $setup->tokenid,
            'currency'           => 'TZS',
            'amount'             => (string)$request->amount,
            'expired'            => '0',
            'expire_Date'        => '',
            'amountType'         => 'FIXED',
            'notification_url'   => '',
            'notify_method'      => ''
        ];

        try {
            // Make Request
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'ACCESS_TOKEN' => $setup->accesstoken
            ])->post($setup->registrationurl, $payload);

            if ($response->successful()) {
                $data = $response->json();
                
                // Check API specific status code (C# logic: dictObj["status"].ToString() == "200")
                if (isset($data['status']) && $data['status'] == "200") {
                    
                    // Save to Local DB (Equivalent to pMdtBilling.Add_ControlNumber)
                    $newBill = BILControlNumber::create([
                        'transdate'          => now(),
                        'patient_code'       => $request->patient_id,                       
                        'controlno'          => $request->payment_ref, // API field assumption
                        'amount'             => $request->amount,                       
                        'paymentdescription' => $request->description,  
                        'numberstatus'       => 'recorded',                  
                        'user_id'            => Auth::id()
                    ]);

                    return response()->json([
                        'status'        => 'success',
                        'message'       => $data['statusDesc'] ?? 'Control Number Generated',
                        'control_no'    => $newBill->controlno,
                        'number_status' => 'recorded'
                    ]);
                } else {
                    return response()->json([
                        'status'  => 'error', 
                        'message' => $data['statusDesc'] ?? 'API Error'
                    ], 400);
                }
            }

            return response()->json(['status' => 'error', 'message' => 'Gateway Error: ' . $response->status()], $response->status());

        } catch (\Exception $e) {
            Log::error("Control Number Gen Error: " . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'System Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Logic: C# "Edit()" Region
     * Checks if the customer has paid via the external gateway
     */
    public function checkPaymentStatus(Request $request)
    {
        $request->validate(['payment_ref' => 'required']);

        $setup = FacilitySetup::first();
        if (!$setup) return response()->json(['status' => 'error', 'message' => 'Setup missing'], 500);

        // Prepare Payload (C# passed an array for paymentReference)
        $payload = [
            'paymentReference' => [$request->payment_ref],
            'corporate_id'     => $setup->corporateid,
        ];

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'ACCESS_TOKEN' => $setup->accesstoken
            ])->post($setup->checkpaymenturl, $payload);

            if ($response->successful()) {
                // Handle the nested JSON response logic from C#
                // C# Logic: extracted 'data', removed quotes/brackets, parsed again.
                // PHP Logic: Access 'data', check if it's a string needing decoding.
                
                $body = $response->json();
                $data = $body['data'] ?? null;

                // Handle double-encoded JSON if API returns it as a string
                if (is_string($data)) {
                    $data = json_decode($data, true);
                }

                // If result is an array of transactions, take the first one
                if (is_array($data) && isset($data[0])) {
                    $data = $data[0];
                }

                if (!$data) {
                    return response()->json(['status' => 'info', 'message' => 'No Data Returned from Gateway']);
                }

                $transactionRef = $data['transactionRef'] ?? '';
                $receipt = $data['receipt'] ?? '';

                // C# Logic: Check empty strings
                if (empty($transactionRef) && empty($receipt)) {
                    return response()->json([
                        'status'         => 'info', 
                        'message'        => 'No Payment Reflected Yet',
                        'control_status' => 'closed' // or waiting
                    ]);
                } 
                else {
                    // Payment Confirmed
                    
                    // Update Local DB
                    BILControlNumber::where('payment_reference', $request->payment_ref)
                        ->update([
                            'numberstatus'    => 'paid',
                            'transaction_ref' => $transactionRef,
                            'receipt_no'      => $receipt,
                            'updated_at'      => now(),
                            'user_id'         => Auth::id() // Who verified it
                        ]);

                    return response()->json([
                        'status'         => 'success', 
                        'message'        => 'Payment Confirmed',
                        'control_status' => 'paid',
                        'receipt'        => $receipt
                    ]);
                }
            }

            return response()->json(['status' => 'error', 'message' => 'Gateway Error: ' . $response->status()]);

        } catch (\Exception $e) {
            Log::error("Check Payment Error: " . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}