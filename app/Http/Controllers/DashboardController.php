<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

// --- Imported Models ---
use App\Models\BILSale;             // Sales
use App\Models\PROPurchase;         // Procurement
use App\Models\SPR_Supplier;        // Suppliers
use App\Models\SIV_Store;           // Stores
use App\Models\SIV_Product;         // Products
use App\Models\User;                // Users/HR

class DashboardController extends Controller
{
    /**
     * 1. Main Launchpad
     * Renders the main menu with the 4 module cards.
     */
    public function index()
    {
        return Inertia::render('Dashboard/Index');
    }

    /**
     * 2. Hospital Services Dashboard
     * Fetches clinical data (OPD, IPD, Doctors, Mortuary).
     */
    public function hospitalStats()
    {
        $today = Carbon::today();
        
        // Note: Using DB::table() here as placeholders. 
        // Replace 'opd_registrations' etc. with your actual Clinical Models when ready.
        
        // Count OPD Registrations for today
        $opdCount = 0;
        try {
            $opdCount = DB::table('opd_registrations') // Replace with your table name
                ->whereDate('created_at', $today)
                ->count();
        } catch (\Exception $e) {
            // Table might not exist yet
            $opdCount = 0; 
        }

        // Count Active Admissions
        $admissionCount = 0;
        try {
            $admissionCount = DB::table('ipd_admissions') // Replace with your table name
                ->where('status', 'active') 
                ->count();
        } catch (\Exception $e) {
            $admissionCount = 0;
        }

        return Inertia::render('Dashboard/Hospital', [
            'opdRegistrationsToday' => $opdCount,
            'activeAdmissionsCount' => $admissionCount,            
        ]);
    }

    /**
     * 3. Sales & Finance Dashboard
     * Fetches Billing, Revenue, and Expense data.
     */
    public function financeStats()
    {
        $today = Carbon::today();

        // Calculate Today's Sales Count (excluding voided)
        $salesTodayCount = BILSale::whereDate('transdate', $today)
            ->where('voided', '!=', 1)
            ->count();
            
        // Calculate Today's Revenue (excluding voided)
        $salesTodayValue = BILSale::whereDate('transdate', $today)
            ->where('voided', '!=', 1)
            ->sum('totalpaid'); 

        return Inertia::render('Dashboard/Finance', [
            'stats' => [
                'salesTodayCount' => $salesTodayCount,
                'salesTodayValue' => (float) $salesTodayValue,
            ]
        ]);
    }

    /**
     * 4. Resource & Asset Dashboard
     * Fetches Procurement (POs) and Inventory (Low Stock, Values).
     */
    public function resourceStats()
    {
        // --- Procurement Data ---
        // Pending Purchase Orders (Assuming stage 1 is pending)
        $pendingPOCount = PROPurchase::where('stage', 1)->count(); 
        
        // Active Suppliers
        $activeSuppliersCount = SPR_Supplier::count();

        // --- Inventory Data ---
        $storeIds = SIV_Store::pluck('id'); // Get all store IDs
        
        $lowStockItemCount = 0;
        $totalStockValue = 0;

        // Only run inventory queries if stores exist
        if ($storeIds->isNotEmpty()) {
            
            // Construct the SQL for dynamic quantity columns (e.g., "qty_1 + qty_2 + qty_3")
            // This sums up stock across ALL stores defined in the database.
            $sumOfQuantities = $storeIds->map(fn($id) => "pc.qty_$id")->join(' + ');

            // 1. Calculate Low Stock Items
            // Joins Product Control (Stock levels) with Product Master (Reorder levels)
            $lowStockItemCount = DB::table('iv_productcontrol as pc')
                ->join('siv_products as p', 'pc.product_id', '=', 'p.id')
                ->whereNotNull('p.reorderlevel')
                ->where(DB::raw("($sumOfQuantities)"), '<=', DB::raw('p.reorderlevel'))
                ->count('p.id');

            // 2. Calculate Total Stock Value
            // Sums (Total Qty * Cost Price)
            $totalStockValue = DB::table('iv_productcontrol as pc')
                ->join('siv_products as p', 'pc.product_id', '=', 'p.id')
                ->select(DB::raw("SUM(($sumOfQuantities) * p.costprice) as total_value"))
                ->value('total_value');
        }

        return Inertia::render('Dashboard/Resources', [
            'stats' => [
                'pendingPOCount' => $pendingPOCount,
                'activeSuppliersCount' => $activeSuppliersCount,
                'lowStockItemCount' => $lowStockItemCount,
                'totalStockValue' => (float) $totalStockValue,
            ]
        ]);
    }

    /**
     * 5. Human Resource Dashboard
     * Fetches Employee and User statistics.
     */
    public function hrStats()
    {
        // Total Users in the system
        $totalEmployees = User::count(); 
        
        // Placeholder for Leave Logic (requires Leave model)
        $onLeave = 0; 

        return Inertia::render('Dashboard/HumanResource', [
            'stats' => [
                'totalEmployees' => $totalEmployees,
                'onLeave' => $onLeave,
            ]
        ]);
    }

    // Add these methods to the class

    /**
     * 6. Reporting Dashboard
     */
    public function reportStats()
    {
        // You can redirect to a specific reporting hub or render a menu
        return Inertia::render('ModulesHub/Reports/Index'); 
        // OR if you don't have a hub yet, redirect to the first report module:
        // return redirect()->route('reporting0.index');
    }

    /**
     * 7. System Admin Dashboard
     */
    public function adminStats()
    {
        // Redirect to User Management or System Configuration
        return Inertia::render('UserManagement/Index'); 
    }

    /**
     * 8. Specialized Care Dashboard
     */
    public function specializedStats()
    {
        // Fetch stats specific to these departments
        // Use try-catch to avoid errors if tables don't exist yet
        
        $mortuaryCount = 0;
        // try { $mortuaryCount = DB::table('mortuary_records')->where('status', 'admitted')->count(); } catch(\Exception $e){}

        $physioCount = 0;
        // try { $physioCount = DB::table('physio_sessions')->whereDate('created_at', today())->count(); } catch(\Exception $e){}

        return Inertia::render('Dashboard/Specialized', [
            'mortuaryOccupancy' => $mortuaryCount,
            'physioSessionsToday' => $physioCount,
            // Add RCH and HIV stats here as needed
        ]);
    }
}