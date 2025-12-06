<?php

namespace App\Http\Controllers\BloodBank;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\BloodBank\BbComponentType;
use App\Models\BloodBank\BbDeferralReason;

class BloodBankSetupController extends Controller
{
    public function index()
    {
        return Inertia::render('SystemConfiguration/BloodBankSetup/Index', [
            'counts' => [
                'components' => BbComponentType::count(),
                'deferrals' => BbDeferralReason::count(),                
            ]
        ]);
    }
}