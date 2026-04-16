<?php

namespace App\Http\Controllers\Hospital\Consumables;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;

// Assuming you have these models, import them here:
use App\Models\Requisition;
use App\Models\Receipt;
use App\Models\Usage;
use App\Models\Disposal;

class ConsumablesDashboardController extends Controller
{
    /**
     * Display the hospital consumables dashboard.
     */
    public function index(Request $request)
    {
        // Fetch counts for the dashboard statistics. 
        // You can add scopes/where clauses (e.g., ->where('status', 'pending')) if you only want to count specific records.
        $requisitionsCount = 0;//Requisition::count();
        $receiptsCount = 0;//Receipt::count();
        $usageCount = 0;//Usage::count();
        $disposalsCount = 0;//Disposal::count();

        return Inertia::render('Hospital/Consumables/Index', [
            'requisitionsCount' => $requisitionsCount,
            'receiptsCount' => $receiptsCount,
            'usageCount' => $usageCount,
            'disposalsCount' => $disposalsCount,
        ]);
    }
}