<?php

namespace App\Http\Controllers\Nhif;

use App\Services\NhifBreezeService;
use Illuminate\Http\Request;

class NhifBreezeController extends Controller
{
    protected NhifBreezeService $nhif;

    public function __construct(NhifBreezeService $nhif)
    {
        $this->nhif = $nhif;
    }

    /**
     * POST /nhif/authorize-card
     */
    public function authorizeCard(Request $request)
    {
        $request->validate([
            'card_no'      => 'required|string',
            'visit_type_id'=> 'required|integer',
            'referral_no'  => 'nullable|string',
            'remarks'      => 'nullable|string',
        ]);

        try {
            $result = $this->nhif->authorizeCard(
                $request->card_no,
                $request->visit_type_id,
                $request->referral_no,
                $request->remarks
            );

            return response()->json([
                'success' => true,
                'data'    => $result
            ]);
        } catch (\Exception $ex) {
            return response()->json([
                'success' => false,
                'message' => $ex->getMessage()
            ], 500);
        }
    }
}
