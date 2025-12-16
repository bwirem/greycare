<?php

namespace App\Http\Controllers\Hospital\Opd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Patient\PatientBillingGroup;

class OpdAuthorizationController extends Controller
{
    /**
     * Step 1: Verify Card (GetCardDetails)
     */
    public function verifyCard(Request $request)
    {
        $request->validate([
            'card_no' => 'required|string',
            'group_id' => 'required|exists:patient_billing_groups,id',
        ]);

        $group = PatientBillingGroup::find($request->group_id);

        if (!$group || !$group->url) {
            return response()->json(['error' => 'API URL is missing settings.'], 400);
        }

        try {
            $token = $this->getToken($group);
            if (!$token) return response()->json(['error' => 'Auth Failed: No Token'], 401);

            // Construct URL
            $baseUrl = rtrim($group->url, '/');
            if (!str_ends_with($baseUrl, 'breeze')) $baseUrl .= '/breeze';
            $endpoint = $baseUrl . '/verification/GetCardDetails';

            $response = Http::withToken($token)
                ->withoutVerifying()
                ->timeout(30)
                ->get($endpoint, ['CardNo' => $request->card_no]);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return $this->handleApiError($response, 'Verification Failed');

        } catch (\Exception $e) {
            Log::error("NHIF Verify Exception: " . $e->getMessage());
            return response()->json(['error' => 'Connection Error'], 500);
        }
    }

    /**
     * Step 2: Request Authorization (AuthorizeCard)
     */
    public function requestAuthorization(Request $request)
    {
        $request->validate([
            'card_no' => 'required|string',
            'group_id' => 'required|exists:patient_billing_groups,id',
            'visit_type_id' => 'required|integer', 
            'referral_no' => 'nullable|string',
            'remarks' => 'nullable|string',
        ]);

        $group = PatientBillingGroup::find($request->group_id);

        try {
            $token = $this->getToken($group);
            if (!$token) {
                return response()->json(['error' => 'Authentication Failed: Could not get Token'], 401);
            }
            
            $baseUrl = rtrim($group->url, '/');
            if (!str_ends_with($baseUrl, 'breeze')) {
                $baseUrl .= '/breeze';
            }
            $endpoint = $baseUrl . '/verification/AuthorizeCard';

            // --- FIX: Use "N/A" for Remarks instead of empty string ---
            // The API backend seems to drop empty strings, causing the SQL error.
            
            $queryParams = [
                'CardNo'      => $request->card_no,
                'VisitTypeID' => (int) $request->visit_type_id,
                'ReferralNo'  => $request->referral_no ?? '', // Keep empty for Referral
                'Remarks'     => $request->filled('remarks') ? $request->remarks : 'N/A', // Must have text
            ];
            
            //Log::info("NHIF Auth Request: $endpoint", $queryParams);

            $response = Http::withToken($token)
                ->timeout(60)
                ->withoutVerifying()
                ->get($endpoint, $queryParams);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['AuthorizationStatus']) && $data['AuthorizationStatus'] !== 'ACCEPTED') {
                     Log::warning("NHIF Auth Rejected: " . json_encode($data));
                }

                return response()->json($data);
            }

            //Log::error("NHIF Auth Http Error: " . $response->body());
            
            $errorMsg = $response->body();
            $jsonError = $response->json();
            if (isset($jsonError['Message'])) {
                $errorMsg = $jsonError['Message'];
            }

            return response()->json(['error' => 'Provider Error: ' . $errorMsg], $response->status());

        } catch (\Exception $e) {
            Log::error("NHIF Auth Exception: " . $e->getMessage());
            return response()->json(['error' => 'System Error: ' . $e->getMessage()], 500);
        }
    }
    /**
     * Helper: Get Bearer Token
     */
    private function getToken($group)
    {
        // Token URL is typically at root, not inside /breeze
        $baseUrl = rtrim($group->url, '/');
        $baseUrl = preg_replace('/\/breeze$/', '', $baseUrl); // Remove /breeze if present
        $tokenUrl = $baseUrl . '/Token';

        try {
            $response = Http::asForm()
                ->withoutVerifying()
                ->post($tokenUrl, [
                    'grant_type' => 'password',
                    'username' => $group->username,
                    'password' => $group->password,
                ]);

            if ($response->successful()) {
                return $response->json()['access_token'];
            }
            
            //Log::error("NHIF Token Error: " . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error("NHIF Token Exception: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Helper: Format Error Messages
     */
    private function handleApiError($response, $defaultMsg)
    {
        Log::error("NHIF API Error: " . $response->body());
        
        $errorMsg = $defaultMsg;
        $json = $response->json();
        
        if (isset($json['Message'])) {
            $errorMsg = $json['Message'];
        } elseif (isset($json['error_description'])) {
            $errorMsg = $json['error_description'];
        }

        return response()->json(['error' => $errorMsg], $response->status());
    }
}