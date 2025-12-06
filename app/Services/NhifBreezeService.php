<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class NhifBreezeService
{
    protected string $username;
    protected string $password;
    protected string $tokenUrl;
    protected string $serviceUrl;

    public function __construct()
    {
        $this->username   = urlencode(config('services.nhif_breeze.username'));
        $this->password   = urlencode(config('services.nhif_breeze.password'));
        $this->tokenUrl   = config('services.nhif_breeze.token_url');
        $this->serviceUrl = config('services.nhif_breeze.service_url');
    }

    /**
     * Builds NHIF Basic Auth header
     */
    private function authHeader()
    {
        return [
            'Authorization' => 'Basic ' . base64_encode($this->username . ':' . $this->password)
        ];
    }

    /**
     * Authorize NHIF card
     */
    public function authorizeCard(string $cardNo, int $visitTypeId, ?string $ref = null, ?string $remarks = null)
    {
        $url = $this->serviceUrl .
            'verification/AuthorizeCard?CardNo=' . urlencode($cardNo)
            . '&VisitTypeID=' . urlencode($visitTypeId)
            . '&ReferralNo=' . ($ref ?? 'null')
            . '&Remarks=' . ($remarks ?? 'null');

        $response = Http::withHeaders($this->authHeader())
            ->timeout(30)
            ->get($url);

        return $response->json();
    }
}
