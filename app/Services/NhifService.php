<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class NhifService
{
    protected string $username;
    protected string $password;
    protected string $facilityCode;
    protected string $tokenUrl;
    protected string $serviceUrl;

    public function __construct()
    {
        $this->username     = urlencode(config('services.nhif.username'));
        $this->password     = urlencode(config('services.nhif.password'));
        $this->facilityCode = urlencode(config('services.nhif.facility_code'));

        $this->tokenUrl  = config('services.nhif.token_url');
        $this->serviceUrl = config('services.nhif.service_url');
    }

    /**
     * Build NHIF authentication header
     */
    private function authHeader()
    {
        $token = base64_encode($this->username . ":" . $this->password);
        return 'Authorization: Basic ' . $token;
    }

    /**
     * Fetch price packages from NHIF
     */
    public function getPricePackages()
    {
        $url = $this->serviceUrl .
            'Packages/GetPricePackageWithExcludedServices?FacilityCode=' .
            $this->facilityCode;

        $response = Http::withHeaders([
            'Authorization' => 'Basic ' . base64_encode($this->username . ":" . $this->password),
        ])->timeout(90)->get($url);

        return $response->json();
    }
}
