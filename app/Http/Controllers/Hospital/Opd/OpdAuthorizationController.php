<?php

namespace App\Http\Controllers\Hospital\Opd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Models\Patient\PatientBillingGroup;
use App\Models\Patient\Patient;

class OpdAuthorizationController extends Controller
{
    /**
     * Extract base URL from NHIF endpoint
     */
    private function getBaseUrl($url)
    {
        if (empty($url)) return '';

        $position = stripos($url, '/api');

        if ($position !== false) {
            return rtrim(substr($url, 0, $position), '/');
        }

        return rtrim($url, '/');
    }

    /**
     * Step 0: Fetch and Cache Access Token
     * POST /authserver/connect/token
     */
    private function getAccessToken($group, $baseUrl)
    {
        $cacheKey = 'nhif_access_token_' . $group->id;

        // Return cached token if it exists and is still valid
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        $endpoint = $baseUrl . '/authserver/connect/token';

        // Fallback to hardcoded credentials if the DB values are empty
        $clientId = $group->facility_code ?: '00038';
        $clientSecret = $group->secret_key ?: 'uViitGoULBuwTpDW11yC6g==';
        $username = $group->username ?: 'default_user';             
        $password = $group->password ?: 'default_password';

        Log::info("NHIF Requesting New Access Token", ['endpoint' => $endpoint]);

        try {
            $response = Http::asForm()                
                ->post($endpoint, [
                    'username' => $username,
                    //'password' => $password,
                    'client_secret' => $clientSecret,
                    'client_id' => $clientId,
                    //'grant_type' => 'password',
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $token = $data['access_token'];
                
                // Cache the token. Subtract 60 seconds from expires_in to be safe.
                $expiresIn = isset($data['expires_in']) ? ((int)$data['expires_in'] - 60) : 3500;
                
                Cache::put($cacheKey, $token, now()->addSeconds($expiresIn));

                return $token;
            }

            Log::error("NHIF Token Fetch Failed: " . $response->body());
            throw new \Exception("Failed to fetch NHIF access token.");

        } catch (\Exception $e) {
            Log::error("NHIF Token Exception: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Step 1: Verify NHIF Card
     * GET /api/Verification/GetCardDetails
     */
    public function verifyCard(Request $request)
    {
        $request->validate([
            'card_no' => 'required|string',
            'group_id' => 'required|exists:patient_billing_groups,id',
        ]);

        $group = PatientBillingGroup::find($request->group_id);

        if (!$group || !$group->verification_url) {
            return response()->json(['error' => 'API URL missing in settings'], 400);
        }

        try {
            $baseUrl = $this->getBaseUrl($group->verification_url);
            $endpoint = $baseUrl . '/api/Verification/GetCardDetails';
            
            // 1. Get the Bearer Token
            $token = $this->getAccessToken($group, $baseUrl);

            Log::info("NHIF Verify Request", [
                'endpoint' => $endpoint,
                'cardNo' => $request->card_no
            ]);

            // 2. Make the request using the Bearer Token
            $response = Http::timeout(30)
                ->withoutVerifying()
                ->acceptJson()
                ->withToken($token) // Adds Authorization: Bearer {token}
                ->withHeaders([
                    // Username might still be required by their API logic, keep it if so
                    'Username' => $group->username, 
                ])
                ->get($endpoint, [
                    'cardNo' => $request->card_no
                ]);

            Log::info("NHIF Verify Response", [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            if ($response->successful()) {
                $data = $response->json();

                $localPatientCode = Patient::where('insurance_member_no', $request->card_no)->value('code');
                $data['existing_patient_code'] = $localPatientCode ?? '';

                return response()->json($data);
            }

            return $this->handleApiError($response, 'Card Verification Failed');

        } catch (\Exception $e) {
            Log::error("NHIF Verify Exception: " . $e->getMessage());
            return response()->json([
                'error' => 'NHIF Connection Error',
                'message' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Step 2: Request Authorization
     * POST /api/Verification/VerifyCard
     */
    public function requestAuthorization(Request $request)
    {
        $request->validate([
            'card_no' => 'required|string',
            'group_id' => 'required|exists:patient_billing_groups,id',
            'visit_type_id' => 'required|integer',
            'referral_no' => 'nullable|string',
            'remarks' => 'nullable|string',
            'verifier_id' => 'nullable|string',
        ]);

        $group = PatientBillingGroup::find($request->group_id);

        if (!$group || !$group->verification_url) {
            return response()->json(['error' => 'API URL missing in settings'], 400);
        }

        try {
            $baseUrl = $this->getBaseUrl($group->verification_url);
            $endpoint = $baseUrl . '/api/Verification/VerifyCard';

            // 1. Get the Bearer Token
            $token = $this->getAccessToken($group, $baseUrl);

            $payload = [
                'cardNo'      => $request->card_no,
                'visitTypeID' => (int) $request->visit_type_id,
                'referralNo'  => $request->referral_no ?? null,
                'remarks'     => $request->filled('remarks') ? $request->remarks : 'N/A',
            ];

            if ($request->filled('verifier_id')) {
                $payload['verifierID'] = $request->verifier_id;
            }

            Log::info("NHIF Authorization Request", $payload);

            // 2. Make the request using the Bearer Token
            $response = Http::timeout(60)
                ->withoutVerifying()
                ->acceptJson()
                ->withToken($token) // Adds Authorization: Bearer {token}
                ->post($endpoint, $payload);

            Log::info("NHIF Authorization Response", [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            if ($response->successful()) {
                $data = $response->json();

                if (isset($data['authorizationStatus']) && $data['authorizationStatus'] !== 'ACCEPTED') {
                    Log::warning("NHIF Authorization Rejected", $data);
                }

                return response()->json($data);
            }

            return $this->handleApiError($response, 'Authorization Failed');

        } catch (\Exception $e) {
            Log::error("NHIF Authorization Exception: " . $e->getMessage());
            return response()->json([
                'error' => 'System Error',
                'message' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * API Error Handler
     */
    private function handleApiError($response, $defaultMsg)
    {
        Log::error("NHIF API Error Status[{$response->status()}]: " . $response->body());

        $errorMsg = $defaultMsg;
        $json = $response->json();

        if (isset($json['Message'])) {
            $errorMsg = $json['Message'];
        } elseif (isset($json['error_description'])) {
            $errorMsg = $json['error_description'];
        } elseif (isset($json['title'])) {
            $errorMsg = $json['title'];
        }

        return response()->json([
            'error' => $errorMsg,
            'details' => $json ?? $response->body()
        ], $response->status());
    }
}