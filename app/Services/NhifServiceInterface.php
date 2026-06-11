<?php

namespace App\Services\NHIF;

use App\Models\Store;
use App\Models\PractitionerLogin;
use App\Models\Folio;
use App\Models\PolicyPackage;
use App\Models\FormItem;
use App\Models\DiseaseCode;
use App\Jobs\NhifDeferredPractitionerLogoutJob;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

interface NhifServiceInterface
{
    public function authorization(string $url = ""): ?object;
    public function getAllVisitTypes(): \Illuminate\Support\Collection;
    public function practitionerLogin(string $nationalId, string $practitionerNo, string $biometricMethod, string $fpCode = "", string $imageData = ""): array;
    public function createPractitionerLogin(array $dto): ?object;
    public function getDoctorLoginBySessionNo(string $sessionNo): ?object;
    public function getDoctorLoginByHospitalNo(string $hospitalId): ?object;
    public function getDoctorLoginByPractitioner(string $practitionerId): ?object;
    public function getDoctorLoginsByHospital(string $hospitalId, bool $activeOnly = false): \Illuminate\Support\Collection;
    public function practitionerLogout(string $practitionerId): array;
    public function getCardDetails(string $card): ?object;
    public function cardVerification(string $card, string $visitTypeId, string $remarks, string $referral = ""): ?object;
    public function getPackagePrice(string $facilityCode = "07730", string $url = "ocs/api/Packages/GetPricePackage"): \Illuminate\Support\Collection;
    public function processOrder(\Illuminate\Support\Collection $order, string $id): \Illuminate\Support\Collection;
    public function createForm2AB(array $form): array;
    public function getAllFormsAsDtos(string $insurance = "NHIF"): array;
    public function getFormAsDto(string $id, string $insurance = "NHIF"): ?array;
    public function getFormAB(string $id, string $insurance = "NHIF"): ?array;
    public function deleteForm2AB(string $id): array;
    public function submitFolio(string $formId): array;
    public function claimReconciliation(int $year = 2025, int $month = 10): array;
    public function syncDiseasesFromNhif(): bool;
}

class NhifService implements NhifServiceInterface
{
    private const MAX_UNAUTHORIZED_RETRIES = 3;
    private const TOKEN_CACHE_PREFIX = "nhif_token";
    private const MINIMUM_LOGOUT_DURATION_HOURS = 1;

    public ?object $config = null;

    public function __construct()
    {
        $this->initializeSettings();
    }

    private function initializeSettings(): void
    {
        try {
            $user = Auth::user();
            if (!$user || !$user->store_id) {
                return;
            }

            $storeId = $user->store_id;

            // Cache configuration retrieval to avoid DB overhead on every request
            $store = Cache::remember("nhif_config_{$storeId}", now()->addDays(7), function () use ($storeId) {
                return Store::with('nhifConfig')->find($storeId);
            });

            if ($store && $store->nhifConfig) {
                $this->config = $store->nhifConfig;
            }
        } catch (\Exception $ex) {
            report($ex);
        }
    }

    private function ensureInitialized(): void
    {
        if (!$this->config) {
            $this->initializeSettings();

            if (!$this->config) {
                throw new \Exception("NHIF service is not properly configured. Please ensure NHIF settings are configured in your store settings.");
            }
        }
    }

    public function authorization(string $url = ""): ?object
    {
        $this->ensureInitialized();

        $tokenEndpoint = $url ?: $this->config->authorization_token_end_point;
        if (empty($tokenEndpoint)) {
            throw new \Exception("Token endpoint is not configured.");
        }

        $cacheKey = $this->buildTokenCacheKey($tokenEndpoint);

        $token = Cache::remember($cacheKey, now()->addDays(3), function () use ($tokenEndpoint) {
            return $this->authorize($tokenEndpoint);
        });

        if (!$token || empty($token->access_token)) {
            throw new \Exception("Failed to obtain a valid NHIF access token.");
        }

        return $token;
    }

    private function authorize(string $tokenEndpoint): ?object
    {
        // Adjust array structure based on exact token auth strategy (OAuth2 form-data commonly)
        $response = Http::asForm()->post($tokenEndpoint, [
            'username' => $this->config->username,
            'password' => $this->config->secret_key, // Depending on backend, may be 'client_secret'
            'client_id' => $this->config->facility_code,
            'grant_type' => 'password',
        ]);

        if ($response->successful()) {
            return $response->object();
        }

        throw new \Exception("Something went wrong try again");
    }

    private function buildTokenCacheKey(string $tokenEndpoint): string
    {
        $scope = Auth::user()?->store_id ?? $this->config?->facility_code ?? 'default';
        return self::TOKEN_CACHE_PREFIX . ":{$scope}:{$tokenEndpoint}";
    }

    /**
     * Reusable HTTP executor handling token attachments, retries, and cache invalidation.
     */
    private function executeWithAuthorizationRetry(string $tokenEndpoint, callable $requestExecutor): array
    {
        for ($attempt = 0; $attempt <= self::MAX_UNAUTHORIZED_RETRIES; $attempt++) {
            $tokenData = $this->authorization($tokenEndpoint);
            if (!$tokenData || empty($tokenData->access_token)) {
                return [null, null];
            }

            $baseUrl = $this->config->is_development ? $this->config->dev_url : $this->config->base_url;

            $client = Http::baseUrl($baseUrl)
                ->withToken($tokenData->access_token)
                ->acceptJson()
                ->asJson();

            $response = $requestExecutor($client);

            if (!in_array($response->status(), [401, 403])) {
                return [$response, $tokenData];
            }

            Cache::forget($this->buildTokenCacheKey($tokenEndpoint));
        }

        return [null, null];
    }

    public function getAllVisitTypes(): \Illuminate\Support\Collection
    {
        $this->ensureInitialized();

        [$response, $tokenData] = $this->executeWithAuthorizationRetry(
            $this->config->authorization_token_end_point,
            fn($client) => $client->get("servicehub/api/Verification/GetVisitTypes")
        );

        if ($response && $response->successful()) {
            return collect($response->json());
        }

        return collect();
    }

    public function cardVerification(string $card, string $visitTypeId, string $remarks, string $referral = ""): ?object
    {
        $this->ensureInitialized();

        $payload = [
            'cardNo' => $card,
            'visitTypeID' => $visitTypeId,
            'referralNo' => $referral,
            'remarks' => $remarks,
        ];

        [$response, $tokenData] = $this->executeWithAuthorizationRetry(
            $this->config->authorization_token_end_point,
            fn($client) => $client->post("servicehub/api/Verification/AuthorizeCard", $payload)
        );

        if (!$response) throw new \Exception("Failed to obtain authorization token.");
        
        if ($response->successful()) {
            return $response->object();
        }

        $errorMessage = $response->json('message') ?? $response->json('Message') ?? $response->reason() ?? "Authorization failed";
        throw new \Exception("Authorization failed: {$errorMessage}");
    }

    public function getCardDetails(string $card): ?object
    {
        $this->ensureInitialized();

        [$response, $tokenData] = $this->executeWithAuthorizationRetry(
            $this->config->authorization_token_end_point,
            fn($client) => $client->get("servicehub/api/Verification/GetCardDetails", ['cardNo' => $card])
        );

        if (!$response) throw new \Exception("Failed to obtain authorization token.");
        
        if ($response->successful()) return $response->object();

        throw new \Exception($response->reason());
    }

    public function practitionerLogin(string $nationalId, string $practitionerNo, string $biometricMethod, string $fpCode = "", string $imageData = ""): array
    {
        try {
            $this->ensureInitialized();

            $payload = [
                'nationalID' => $nationalId,
                'practitionerNo' => $practitionerNo,
                'biometricMethod' => $biometricMethod,
                'fpCode' => $fpCode,
                'imageData' => $imageData
            ];

            [$response, $tokenData] = $this->executeWithAuthorizationRetry(
                $this->config->authorization_token_end_point,
                fn($client) => $client->post("servicehub/api/Attendance/LoginPractitioner", $payload)
            );

            if (!$response) return [false, "Failed to obtain authorization token from NHIF service.", null];

            if (in_array($response->status(), [401, 403]) && !$tokenData) {
                return [false, "Authorization failed after refreshing token. Please verify your NHIF credentials and try again.", null];
            }

            if ($response->successful()) {
                $data = $response->object();
                if (!$data) return [false, "Invalid response from NHIF server. Please try again.", null];

                if (!empty($data->LoginTime) && !empty($data->LogoutTime) && empty($data->SessionNo)) {
                    $loginTime = Carbon::parse($data->LoginTime)->format('h:i A');
                    $logoutTime = Carbon::parse($data->LogoutTime)->format('h:i A');
                    return [true, "Already authorized successfully at {$loginTime}.\nPlease wait till {$logoutTime} to logout.", $data];
                }

                if (($data->StatusID ?? 0) != 1) {
                    return [false, "Authorization failed with status {$data->StatusID}. Please verify your credentials.", $data];
                }

                if (empty($data->SessionNo)) {
                    return [false, "No session number received from NHIF. Please try again.", $data];
                }

                $msg = "Authorized successfully. With session: {$data->SessionNo}";
                return [true, $msg, $data];
            }

            return [false, $this->getErrorMessage($response), null];
        } catch (\Exception $ex) {
            return [false, "Authorization failed: {$ex->getMessage()}", null];
        }
    }

    public function getDoctorLoginBySessionNo(string $sessionNo): ?object
    {
        $login = PractitionerLogin::with('practitioner')->where('session_no', $sessionNo)->where('is_deleted', false)->firstOrFail();
        return $this->mapDoctorLoginDto($login);
    }

    public function getDoctorLoginByHospitalNo(string $hospitalId): ?object
    {
        $login = PractitionerLogin::with('practitioner')
            ->where('is_deleted', false)
            ->where(function ($q) use ($hospitalId) {
                $q->where('hospital_id', $hospitalId)
                  ->orWhereHas('practitioner', fn($query) => $query->where('hospital_id', $hospitalId));
            })
            ->orderByDesc('is_active')
            ->orderByDesc('login_time')
            ->firstOrFail();

        return $this->mapDoctorLoginDto($login);
    }

    public function getDoctorLoginByPractitioner(string $practitionerId): ?object
    {
        $login = PractitionerLogin::with('practitioner')
            ->where('practitioner_id', $practitionerId)
            ->where('is_deleted', false)
            ->orderByDesc('is_active')
            ->orderByDesc('login_time')
            ->first();

        return $login ? $this->mapDoctorLoginDto($login) : null;
    }

    public function getDoctorLoginsByHospital(string $hospitalId, bool $activeOnly = false): \Illuminate\Support\Collection
    {
        $query = PractitionerLogin::with('practitioner')
            ->where('is_deleted', false)
            ->where(function ($q) use ($hospitalId) {
                $q->where('hospital_id', $hospitalId)
                  ->orWhereHas('practitioner', fn($query) => $query->where('hospital_id', $hospitalId));
            });

        if ($activeOnly) {
            $query->where('is_active', true);
        }

        return $query->orderByDesc('is_active')
            ->orderByDesc('login_time')
            ->get()
            ->map(fn($login) => $this->mapDoctorLoginDto($login));
    }

    public function createPractitionerLogin(array $dto): ?object
    {
        DB::beginTransaction();
        try {
            // Auto-logout previous session
            PractitionerLogin::where('practitioner_id', $dto['practitioner_id'])
                ->where('is_active', true)
                ->whereNull('logout_time')
                ->update([
                    'logout_time' => now(),
                    'is_active' => false,
                    'status_id' => $dto['status_id'] ?? null
                ]);

            $newLogin = PractitionerLogin::create([
                'practitioner_id' => $dto['practitioner_id'],
                'user_id' => $dto['user_id'] ?? null,
                'hospital_id' => $dto['hospital_id'] ?? null,
                'practitioner_name' => $dto['practitioner_name'] ?? null,
                'practitioner_no' => $dto['practitioner_no'] ?? null,
                'national_id' => $dto['national_id'] ?? null,
                'session_no' => $dto['session_no'] ?? null,
                'biometric_method' => $dto['biometric_method'] ?? null,
                'status_id' => $dto['status_id'] ?? null,
                'login_time' => $dto['login_time'] ?? now(),
                'is_active' => true,
                'is_deleted' => false,
            ]);

            DB::commit();
            return $this->mapDoctorLoginDto($newLogin->load('practitioner'));
        } catch (\Exception $ex) {
            DB::rollBack();
            throw new \Exception("Failed to create doctor login record: " . $ex->getMessage());
        }
    }

    public function practitionerLogout(string $practitionerId): array
    {
        $activeLogin = PractitionerLogin::with('practitioner')
            ->where('practitioner_id', $practitionerId)
            ->where('is_active', true)
            ->whereNull('logout_time')
            ->where('is_deleted', false)
            ->first();

        if (!$activeLogin) {
            return [false, "No active NHIF practitioner session found for this doctor.", false, null];
        }

        $practitionerNo = $activeLogin->practitioner_no ?? $activeLogin->practitioner?->mct_number;
        if (empty($practitionerNo)) {
            return [false, "Practitioner number is missing for this NHIF session.", false, null];
        }

        $this->ensureInitialized();

        $minLogoutTime = Carbon::parse($activeLogin->login_time)->copy()->addHours(self::MINIMUM_LOGOUT_DURATION_HOURS);
        if (now()->lessThan($minLogoutTime)) {
            $this->queueDeferredLogout($activeLogin, $practitionerNo, $minLogoutTime);
            return [true, "NHIF requires at least one hour after sign-in. Automatic logout scheduled for {$minLogoutTime->format('h:i A')}.", true, $minLogoutTime];
        }

        $url = "servicehub/api/Attendance/LogoutPractitioner?practitionerNo={$practitionerNo}&facilityCode={$this->config->facility_code}";

        [$response, $tokenData] = $this->executeWithAuthorizationRetry(
            $this->config->authorization_token_end_point,
            fn($client) => $client->post($url)
        );

        if ($response && $response->successful()) {
            $activeLogin->update(['logout_time' => now(), 'is_active' => false]);
            return [true, "Successfully logged out.", false, null];
        }

        if ($response && $response->status() === 400 && $this->isMinimumSessionRestriction($response->body())) {
            $fallback = now()->addHours(1);
            $this->queueDeferredLogout($activeLogin, $practitionerNo, $fallback);
            return [true, "NHIF requires at least one hour after sign-in. Automatic logout scheduled for {$fallback->format('h:i A')}.", true, $fallback];
        }

        return [false, $response ? $this->getErrorMessage($response) : "Unknown Error", false, null];
    }

    private function queueDeferredLogout(PractitionerLogin $login, string $practitionerNo, Carbon $scheduledAt): void
    {
        // Using Laravel Jobs
        NhifDeferredPractitionerLogoutJob::dispatch([
            'practitioner_login_id' => $login->id,
            'practitioner_no' => $practitionerNo,
            'facility_code' => $this->config->facility_code,
            'token_endpoint' => $this->config->authorization_token_end_point,
            'base_url' => $this->config->is_development ? $this->config->dev_url : $this->config->base_url,
            'username' => $this->config->username,
            'client_secret' => $this->config->secret_key
        ])->delay($scheduledAt);
    }

    private function isMinimumSessionRestriction(string $content): bool
    {
        $message = strtolower(json_decode($content)->message ?? $content);
        return Str::contains($message, ['saa 1', 'one hour', '1 hour']);
    }

    private function mapDoctorLoginDto(PractitionerLogin $login): object
    {
        $sessionDuration = null;
        if ($login->login_time) {
            $endTime = $login->logout_time ? Carbon::parse($login->logout_time) : now();
            $startTime = Carbon::parse($login->login_time);
            if ($endTime->greaterThanOrEqualTo($startTime)) {
                $sessionDuration = $startTime->diff($endTime)->format('%H:%I:%S');
            }
        }

        return (object)[
            'Id' => $login->id,
            'PractitionerId' => $login->practitioner_id,
            'UserId' => $login->user_id ?? $login->practitioner?->user_id,
            'HospitalId' => $login->hospital_id ?? $login->practitioner?->hospital_id,
            'UserName' => $login->practitioner?->email,
            'UserFullName' => $login->practitioner_name ?? $login->practitioner?->name,
            'NationalID' => $login->national_id ?? $login->practitioner?->nida,
            'PractitionerNo' => $login->practitioner_no ?? $login->practitioner?->mct_number,
            'SessionNo' => $login->session_no,
            'BiometricMethod' => $login->biometric_method,
            'StatusID' => $login->status_id,
            'LoginTime' => $login->login_time,
            'LogoutTime' => $login->logout_time,
            'IsActive' => $login->is_active,
            'SessionDuration' => $sessionDuration,
        ];
    }

    public function createForm2AB(array $form): array
    {
        if (empty($form['visit_id'])) return [$form['id'] ?? null, "VisitId is required", 'Pending'];
        if (empty($form['payment_mode'])) return [$form['id'] ?? null, "PaymentMode is required", 'Pending'];

        $hospitalId = Auth::user()->store_id;
        $username = Auth::user()->username ?? 'system';

        $existingFolio = Folio::where('insurance', $form['payment_mode'])
            ->where(function ($q) use ($form) {
                $q->where('visit_id', $form['visit_id']);
                if (!empty($form['id'])) {
                    $q->orWhere('id', $form['id']);
                }
            })->first();

        if ($existingFolio) {
            $existingData = $existingFolio->data ?? [];
            $form['folio_no'] = $existingData['folio_no'] ?? null;
            $form['bill_no'] = $existingData['bill_no'] ?? null;
            $form['audit_status'] = 'Audited';
            $form['last_modified'] = now();
            $form['last_modified_by'] = $username;

            $existingFolio->update([
                'insurance' => $form['payment_mode'],
                'visit_id' => $form['visit_id'],
                'folio_no' => $form['folio_no'],
                'facility_code' => $form['facility_code'] ?? null,
                'status' => $form['claim_status'] ?? 'Pending',
                'data' => $form
            ]);
            return [$existingFolio->id, "Form Updated Succesfully!", 'Audited'];
        }

        // Generate sequences logic (Stubbed method)
        $form['folio_no'] = $this->generateSequenceNumber('Folio', $hospitalId);
        $form['bill_no'] = $this->generateSequenceNumber('BillNo', $hospitalId);
        $form['audit_status'] = 'Audited';
        $form['date_created'] = now();
        $form['created_by'] = $username;

        $folio = Folio::create([
            'id' => $form['id'] ?? (string) Str::uuid(),
            'insurance' => $form['payment_mode'],
            'visit_id' => $form['visit_id'],
            'folio_no' => $form['folio_no'],
            'facility_code' => $form['facility_code'] ?? null,
            'status' => 'Pending',
            'data' => $form
        ]);

        return [$folio->id, "Folio Created Succesfully!", 'Audited'];
    }

    private function generateSequenceNumber(string $type, string $hospitalId): string
    {
        // Implementation for sequence numbering
        return strtoupper(Str::random(8));
    }

    public function deleteForm2AB(string $id): array
    {
        if (empty($id)) return [false, "Form ID is required."];

        $form = Folio::find($id);
        if (!$form) return [false, "Form not found."];

        $form->delete();
        return [true, "Form deleted successfully."];
    }

    public function getAllFormsAsDtos(string $insurance = "NHIF"): array
    {
        $facilityCode = $this->config?->facility_code;
        $folios = Folio::where('insurance', $insurance)->where('facility_code', $facilityCode)->get();

        return $folios->map(function ($folio) {
            return $this->mapFolioToDto($folio);
        })->filter()->values()->toArray();
    }

    public function getFormAsDto(string $id, string $insurance = "NHIF"): ?array
    {
        $folio = Folio::where('id', $id)->orWhere(function ($q) use ($insurance, $id) {
            $q->where('insurance', $insurance)->where('folio_no', $id);
        })->first();

        if (!$folio) return null;

        return $this->mapFolioToDto($folio);
    }

    public function getFormAB(string $id, string $insurance = "NHIF"): ?array
    {
        $folio = Folio::where('id', $id)->orWhere(function ($q) use ($insurance, $id) {
            $q->where('insurance', $insurance)->where('folio_no', $id);
        })->first();

        return $folio ? $folio->data : null;
    }

    private function mapFolioToDto(Folio $folio): ?array
    {
        $f = $folio->data;
        if (!$f) return null;

        return [
            'FormID' => $folio->id,
            'FacilityCode' => $f['facility_code'] ?? null,
            'ClaimYear' => $f['claim_year'] ?? null,
            'ClaimMonth' => $f['claim_month'] ?? null,
            'FolioNo' => (int)($f['folio_no'] ?? 1),
            'BillNo' => $f['bill_no'] ?? null,
            'AuthorizationNo' => $f['authorization_number'] ?? null,
            'CardNo' => $f['card_number'] ?? null,
            'FirstName' => $f['first_name'] ?? null,
            'LastName' => $f['last_name'] ?? null,
            'Gender' => ($f['gender'] ?? '') === 'M' ? 'Male' : 'Female',
            'DateOfBirth' => $f['date_of_birth'] ?? null,
            'TelephoneNo' => $f['patient_phone_number'] ?? null,
            'PatientFileNo' => $f['file_number'] ?? null,
            'PatientTypeCode' => $f['patient_type_code'] ?? null,
            'PatientId' => $f['patient_id'] ?? null,
            'VisitId' => $f['visit_id'] ?? null,
            'AttendanceDate' => $f['attendance_date'] ?? null,
            'DateAdmitted' => ($f['patient_type_code'] ?? '') === 'OUT' ? null : ($f['attendance_date'] ?? null),
            'DateDischarged' => ($f['patient_type_code'] ?? '') === 'OUT' ? null : ($f['date_discharged'] ?? null),
            'VisitTypeID' => (int)($f['visit_type_id'] ?? 0),
            'ClinicalNotes' => $f['remarks'] ?? 'All went fine.',
            'AttendingPractitioners' => [$f['registration_number'] ?? null],
            'AmountClaimed' => $f['amount_claimed'] ?? 0,
            'ClaimStatus' => $f['claim_status'] ?? 'Pending',
            'FolioDiseases' => collect($f['folio_diseases'] ?? [])->map(fn($d) => [
                'DiseaseCode' => $d['disease_code'] ?? null,
                'Status' => $d['status'] ?? null,
                'Remarks' => $d['remarks'] ?? null
            ])->toArray(),
            'FolioItems' => collect($f['form_items'] ?? [])->map(fn($i) => [
                'ItemCode' => $i['item_code'] ?? null,
                'ItemName' => $i['item_name'] ?? null,
                'ItemTypeID' => (int)($i['item_type_id'] ?? 1),
                'UnitPrice' => $i['unit_price'] ?? 0,
                'ItemQuantity' => max((int)($i['quantity'] ?? 1), 1),
                'AmountClaimed' => (int)($i['amount'] ?? 0)
            ])->toArray()
        ];
    }

    public function getPackagePrice(string $facilityCode = "07730", string $url = "ocs/api/Packages/GetPricePackage"): \Illuminate\Support\Collection
    {
        $policyPackage = PolicyPackage::where('insurance', 'NHIF')->first();
        if ($policyPackage && !empty($policyPackage->data)) {
            return collect($policyPackage->data);
        }

        $this->ensureInitialized();

        [$response, $token] = $this->executeWithAuthorizationRetry(
            $this->config->authorization_token_end_point,
            fn($client) => $client->get($url, ['facilityCode' => $facilityCode])
        );

        if ($response && $response->successful()) {
            $packages = $response->json();
            if (empty($packages)) throw new \Exception("No packages received");

            if ($policyPackage) {
                $policyPackage->update(['data' => $packages]);
            } else {
                PolicyPackage::create(['insurance' => 'NHIF', 'data' => $packages]);
            }

            return collect($packages);
        }

        throw new \Exception("Failed to retrieve packages: " . ($response ? $response->body() : 'Unknown Error'));
    }

    public function processOrder(\Illuminate\Support\Collection $order, string $id): \Illuminate\Support\Collection
    {
        // Eloquent relation assumption
        $items = FormItem::whereHas('form2AB', fn($q) => $q->where('visit_type_id', $id))->get();

        if ($items->isNotEmpty()) {
            $targetItem = $items->firstWhere(fn($i) => in_array($i->code, ['SP', 'DC']));
            $orderItem = $order->firstWhere(fn($i) => in_array($i['code'] ?? null, ['SP', 'DC']));

            if ($targetItem && $orderItem) {
                $targetItem->doctor_id = $orderItem['doctor_id'] ?? null;
                $targetItem->doctor = $orderItem['doctor'] ?? null;
            }

            foreach ($items as $item) {
                $order = $order->reject(fn($o) => strtolower(trim($o['description'] ?? '')) === strtolower(trim($item->description ?? '')));
            }

            return $items->concat($order);
        }

        return $order;
    }

    public function submitFolio(string $formId): array
    {
        try {
            $this->ensureInitialized();

            $data = $this->getFormAsDto($formId);
            if (!$data) return [false, "Form not found.", null];

            $folio = Folio::where('id', $formId)->where('insurance', 'NHIF')
                ->orWhere(fn($q) => $q->where('insurance', 'NHIF')->where('folio_no', $formId))
                ->first();

            $existingForm = $folio->data;

            if (($existingForm['claim_status'] ?? '') === 'Claimed' && !empty($existingForm['confirmation_code'])) {
                return [false, "Form already submitted with confirmation code: {$existingForm['confirmation_code']}", null];
            }

            [$response, $token] = $this->executeWithAuthorizationRetry(
                $this->config->authorization_token_end_point,
                fn($client) => $client->post("ocs/api/Claims/SubmitFolio", $data)
            );

            if (!$response) return [false, "Failed to obtain authorization token.", null];

            if ($response->successful()) {
                $nhifResponse = $response->object();

                $existingForm['claim_status'] = 'Claimed';
                $existingForm['submission_id'] = $nhifResponse->SubmissionID ?? null;
                $existingForm['submission_no'] = $nhifResponse->SubmissionNo ?? null;
                $existingForm['confirmation_code'] = now()->format('Ymd\THis');
                $existingForm['id'] = $folio->id; // Guarantee ID is passed back

                [$returnedFormId, $msg, $status] = $this->createForm2AB($existingForm);

                return [true, "Folio submitted successfully. Confirmation Code: {$existingForm['confirmation_code']}. $msg", (array)$nhifResponse];
            }

            return [false, $this->getErrorMessage($response), null];
        } catch (\Exception $e) {
            return [false, "Error: " . $e->getMessage(), null];
        }
    }

    public function claimReconciliation(int $year = 2025, int $month = 10): array
    {
        try {
            $this->ensureInitialized();
            $facilityCode = $this->config->facility_code;

            [$response, $token] = $this->executeWithAuthorizationRetry(
                $this->config->authorization_token_end_point,
                fn($client) => $client->get("ocs/api/Claims/GetSubmittedClaims", [
                    'facilityCode' => $facilityCode,
                    'claimYear' => $year,
                    'claimMonth' => $month
                ])
            );

            if (!$response) return [false, "Failed to obtain token.", null];

            if ($response->successful()) {
                $claims = collect($response->json())->sortByDesc('DateSubmitted')->values()->toArray();
                return [true, "Successfully retrieved claims for $month/$year.", $claims];
            }

            return [false, $this->getErrorMessage($response), null];
        } catch (\Exception $e) {
            return [false, "Unexpected error: " . $e->getMessage(), null];
        }
    }

    public function syncDiseasesFromNhif(): bool
    {
        try {
            $this->ensureInitialized();

            [$response, $token] = $this->executeWithAuthorizationRetry(
                $this->config->authorization_token_end_point,
                fn($client) => $client->get("ocs/api/Reference/GetDiseases")
            );

            if ($response && $response->successful()) {
                $diseases = $response->json();
                if (empty($diseases)) return false;

                DB::transaction(function () use ($diseases) {
                    DiseaseCode::truncate();
                    // Insert in chunks to avoid max binding limits on large datasets
                    collect($diseases)->chunk(500)->each(function ($chunk) {
                        DiseaseCode::insert($chunk->toArray());
                    });
                });

                return true;
            }

            return false;
        } catch (\Exception $e) {
            report($e);
            return false;
        }
    }

    private function getErrorMessage($response): string
    {
        $status = $response->status();
        $content = $response->body();

        return match ($status) {
            400 => "Invalid request: {$content}",
            401 => "Authentication failed. Please check credentials.",
            403 => "Access forbidden. Insufficient permissions.",
            404 => "NHIF endpoint not found.",
            502 => "NHIF server is temporarily unavailable.",
            500 => "NHIF server error: {$content}",
            412 => "Precondition failed: {$content}",
            default => "Submission failed with status {$status}: {$content}"
        };
    }
}