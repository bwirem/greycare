<?php

namespace App\Services\Billing;

use App\Models\Billing\BILControlNumber;
use App\Models\Billing\BLSCustomer;
use App\Models\Facility\FacilityOption;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ControlNumberService
{
    /**
     * Get Facility API setup
     */
    public function getFacilitySetup()
    {
        $setup = FacilityOption::first();

        if (!$setup) {
            throw new \Exception("Facility API setup is missing.");
        }

        return $setup;
    }

    /**
     * Generate a new control number (or return existing one if valid)
     */
    public function generateControlNumber(array $data)
    {        
        $setup = $this->getFacilitySetup();
        $today = Carbon::today();

        // 1️⃣ Check local DB for an existing control number
        $existing = BILControlNumber::where('patient_code', $data['patient_id'])
            ->where('numberstatus', 'recorded')
            ->whereDate('created_at', $today)
            ->first();

        if ($existing) {
            return[
                // 🔥 CHANGE THIS from 'success' to 'error' or 'duplicate'
                'status' => 'duplicate', 
                'control_no' => $existing->controlno,
                'amount' => $existing->amount,
                'description' => $existing->paymentdescription,
                'number_status' => $existing->numberstatus,
                'message' => 'Existing valid control number(' . $existing->controlno . ')found for this patient.' // This will show in the toast
            ];
        }

        // 2️⃣ Prepare payload for external API
        $payload = [
            'service' => 'ADD',
            'corporate_id' => $setup->corporate_id,
            'corporate_id2' => '',
            'corporate_name' => $setup->name,
            'customer_name' => $data['patient_name'],
            'paymentReference' => $data['payment_ref'],
            'branch_name' => $setup->name,
            'paymentDescription' => $data['description'] ?? 'Medical Services',
            'paymentType' => $setup->crdb_payment_type ?? '1',
            'mobile_number' =>$data['mobile_number'],
            'token_id' => $setup->token_id,
            'currency' => 'TZS',
            'amount' => (string) $data['amount'],
            'expired' => '0',
            'expire_Date' => '',
            'amountType' => 'FIXED',
            'notification_url' => '',
            'notify_method' => '',
        ];

        try {
            // Log the request payload
            Log::info("Control Number API Request", ['payload' => $payload]);

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'ACCESS_TOKEN' => $setup->access_token,
            ])
            ->post($setup->registration_url, $payload);

            // Log the API response
            Log::info("Control Number API Response", [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            // if (!$response->successful()) {
            //     return [
            //         'status' => 'error',
            //         'message' => 'Gateway Error: ' . $response->status()
            //     ];
            // }

            $resData = $response->json();

            Log::info("Control Number API Parsed Response", ['data' => $resData]);

            // Handle duplicate request gracefully
            if (!isset($resData['status']) || !in_array($resData['status'], ['200', '201'])) {
                return [
                    'status' => 'error',
                    'message' => $resData['statusDesc'] ?? 'API Error: Could not generate control number'
                ];
            }

            // Determine the control number
            $controlNumber = $resData['control_number'] ?? $data['payment_ref'];

            // Save control number locally only if status is 200
            if ($resData['status'] == '200') {
                $bill = BILControlNumber::create([
                    'transdate' => now(),
                    'patient_code' => $data['patient_id'],
                    'patient_name' => $data['patient_name'],
                    'payment_reference' => $data['payment_ref'],
                    'controlno' => $controlNumber,
                    'amount' => $data['amount'],
                    'paymentdescription' => $data['description'] ?? 'Medical Services',
                    'numberstatus' => 'recorded',
                    'user_id' => Auth::id(),
                ]);

                return [
                    'status' => 'success',
                    'message' => $resData['statusDesc'] ?? 'Control Number Generated Successfully',
                    'control_no' => $bill->controlno,
                    'number_status' => 'recorded',
                ];
            }

            // If duplicate, return info without creating a new record
            if ($resData['status'] == '201') {
                return [
                    'status' => 'duplicate',
                    'message' => $resData['statusDesc'] ?? 'Duplicate Control Number Request',
                    'control_no' => $controlNumber,
                    'number_status' => 'duplicate',
                ];
            }

        } catch (\Exception $e) {
            Log::error("Control Number Generation Error: " . $e->getMessage());
            return [
                'status' => 'error',
                'message' => 'System Error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Check if payment has been made for a specific bill
     */    

    public function checkPayment(?BILControlNumber $bill)
    {
        if (!$bill) {
            return [
                'status' => 'error',
                'message' => 'No recorded control number found for this patient today.'
            ];
        }
    
        // 1. Exit early if already paid (saves API calls and DB writes)
        if ($bill->numberstatus === 'paid') {
            return [
                'status' => 'info',
                'message' => 'Payment already confirmed.',
                'control_status' => 'paid',
                'receipt' => $bill->receipt_no,
            ];
        }

        Log::info("Checking payment for Bill ID: {$bill->id}, Payment Ref: {$bill->payment_reference}");

        $setup = $this->getFacilitySetup();

        $payload = [
            'paymentReference' => [$bill->payment_reference],
            'corporate_id' => $setup->corporate_id,
        ];

        try {
            // Laravel automatically adds 'Content-Type' => 'application/json' when passing an array
            $response = Http::withHeaders([
                'ACCESS_TOKEN' => $setup->access_token,
            ])->post($setup->check_payment_url, $payload);

            Log::info("Check Payment API Response", [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            // 2. Safely check if the API request actually succeeded
            if ($response->failed()) {
                return [
                    'status' => 'error',
                    'message' => 'Payment provider is currently unavailable. Please try again later.',
                ];
            }

            // 3. Safely extract JSON to avoid "Trying to access array offset on null" errors
            $json = $response->json();
            $data = $json['data'] ?? null;

            // 4. Handle weird API behaviors (Stringified JSON or Array wrapping)
            if (is_string($data)) {
                $data = json_decode($data, true);
            }

            if (is_array($data) && isset($data[0])) {
                $data = $data[0];
            }

            // 5. Check if payment is actually reflected
            if (!$data || (empty($data['transactionRef']) && empty($data['receipt']))) {
                return [
                    'status' => 'info',
                    'message' => 'No Payment Reflected Yet',
                    'control_status' => $bill->numberstatus,
                ];
            }

            // 6. Payment confirmed, update local DB
            $bill->update([
                'numberstatus' => 'paid',
                'transaction_ref' => $data['transactionRef'] ?? null,
                'receipt_no' => $data['receipt'] ?? null,
                // Fallback to existing user_id if Auth::id() is null (e.g. during a Cron job)
                'user_id' => Auth::id() ?? $bill->user_id, 
            ]);

            return [
                'status' => 'success',
                'message' => 'Payment Confirmed',
                'control_status' => 'paid',
                'receipt' => $data['receipt'] ?? null,
            ];

        } catch (\Exception $e) {
            Log::error("Check Payment Error: " . $e->getMessage());
            return [
                'status' => 'error',
                'message' => 'System Error: ' . $e->getMessage(),
            ];
        }
    }
    

    public function validatePaymentForOrder($order)
    {
        $today = Carbon::today();

        // Safe access to customer_id
        $customerId = $order?->customer_id;

        if (!$customerId) {

            return [
                'status' => 'error',
                'message' => 'No recorded control number found for this patient today.'
            ];
        }

        $customer = BLSCustomer::find($customerId);

        if (!$customer) {

            return [
                'status' => 'error',
                'message' => 'No recorded control number found for this patient today.'
            ];
        }

        $patientCode = $customer?->patient_code;

        $bill = BILControlNumber::where('patient_code', $patientCode)
            ->where('numberstatus', 'recorded')
            ->whereDate('created_at', $today)
            ->first();

        return $this->checkPayment($bill);
    }
}