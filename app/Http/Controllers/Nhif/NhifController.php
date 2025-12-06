<?php

namespace App\Http\Controllers\Nhif;

use App\Services\NhifService;

class NhifController extends Controller
{
    protected NhifService $nhif;

    public function __construct(NhifService $nhif)
    {
        $this->nhif = $nhif;
    }

    /**
     * Returns NHIF price package list
     */
    public function getPricePackages()
    {
        try {
            $data = $this->nhif->getPricePackages();

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $ex) {
            return response()->json([
                'success' => false,
                'message' => $ex->getMessage(),
            ], 500);
        }
    }
}
