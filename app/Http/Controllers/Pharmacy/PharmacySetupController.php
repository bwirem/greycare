<?php

namespace App\Http\Controllers\Pharmacy;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class PharmacySetupController extends Controller
{
    public function index()
    {
        return Inertia::render('SystemConfiguration/PharmacySetup/Index');
    }
}