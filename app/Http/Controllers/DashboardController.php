<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

// --- Imported Models ---
use App\Models\Billing\BILSale;             // Sales
use App\Models\Procurement\PROPurchase;         // Procurement

use App\Models\Inventory\SPR_Supplier;        // Suppliers
use App\Models\Inventory\SIV_Store;           // Stores
use App\Models\Inventory\SIV_Product;         // Products
use App\Models\User;                // Users/HR

// --- HR Models ---
use App\Models\HumanResource\HrmEmployee;
use App\Models\HumanResource\HrmAttendance;
use App\Models\HumanResource\HrmLeaveRequest;
use App\Models\HumanResource\PayEmployeeLoan;

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
            $opdCount = DB::table('opd_bookings') // Replace with your table name
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
                ->where('status', 'Admitted') 
                ->count();
        } catch (\Exception $e) {
            $admissionCount = 0;
        }


        $surgeriesCount = 0;
        try {
            $surgeriesCount = DB::table('theatre_bookings') // Replace with your table name
                ->where('status', 'Scheduled') 
                ->count();
        } catch (\Exception $e) {
            $surgeriesCount = 0;
        }

        $pendingLabCount = 0;
        try {
            $pendingLabCount = DB::table('lab_results') // Replace with your table name
                ->where('status', 'Requested')
                ->whereDate('created_at', $today) 
                ->count();
        } catch (\Exception $e) {
            $pendingLabCount = 0;
        }

        $pendingRadCount = 0;
        try {
            $pendingRadCount = DB::table('rad_requests') // Replace with your table name
                ->where('status', 'Ordered') 
                ->whereDate('created_at', $today)
                ->count();
        } catch (\Exception $e) {
            $pendingRadCount = 0;
        }         
       
        
        $pendingPrescriptionCount = 0;
        try {
            $pendingPrescriptionCount = DB::table('pharmacy_prescriptions') // Replace with your table name
                ->where('status', 'Prescribed') 
                ->whereDate('created_at', $today)
                ->count();
        } catch (\Exception $e) {
            $pendingPrescriptionCount = 0;
        } 

        return Inertia::render('Dashboard/Hospital', [
            'opdRegistrationsToday' => $opdCount,
            'activeAdmissionsCount' => $admissionCount,   
            'pendingSurgeries' =>  $surgeriesCount, 
            'pendingLabTests' =>  $pendingLabCount,
            'pendingRadTests' =>  $pendingRadCount,
            'pendingPrescriptions' =>  $pendingPrescriptionCount,
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
        $today = Carbon::today();

        // 1. Total Employees registered in HR
        $totalEmployees = HrmEmployee::count();
        
        // 2. Active Employees (Excluding terminated/resigned)
        $activeEmployees = HrmEmployee::where('status', 'Active')->count();

        // 3. Attendance: Present Today (Present or Late)
        $presentToday = HrmAttendance::whereDate('attendance_date', $today)
            ->whereIn('status', ['Present', 'Late'])
            ->count();

        // 4. On Leave Today (Approved requests overlapping today)
        $onLeave = HrmLeaveRequest::where('status', 'Approved')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->count();

        // 5. Active Loans (Currently deducting)
        $pendingLoans = PayEmployeeLoan::where('is_active', true)->count();

        return Inertia::render('Dashboard/HumanResource', [
            'stats' => [
                'totalEmployees'  => $totalEmployees,
                'activeEmployees' => $activeEmployees,
                'presentToday'    => $presentToday,
                'onLeave'         => $onLeave,
                'pendingLoans'    => $pendingLoans,
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
        return Inertia::render('Dashboard/Report', [
            // Add any relevant reporting stats here
        ]); 
        // OR if you don't have a hub yet, redirect to the first report module:
        // return redirect()->route('reporting0.index');
    }

    /**
     * 7. System Admin Dashboard
     */
    public function adminStats()
    {
        // Redirect to User Management or System Configuration
        return Inertia::render('Dashboard/SystemAndUser', [
            // Add any relevant admin stats here
        ]); 
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

    /**
     * 9. Mortuary Dashboard
     */
    public function mortuaryStats()
    {
        // Fetch Mortuary stats (e.g., occupancy, admissions)
        $mortuaryOccupancy = 0;
        // try { $mortuaryOccupancy = DB::table('mortuary_records')->where('status', 'admitted')->count(); } catch(\Exception $e){}     
        return Inertia::render('Dashboard/Mortuary', [
            'occupancy' => $mortuaryOccupancy,
            // Add more stats as needed
        ]);
    }  
    
    /**
     * 10. Orphanage Dashboard
     */
    public function orphanageStats()
    {
        // Fetch Orphanage stats (e.g., current children, admissions)
        $currentChildren = 0;
        // try { $currentChildren = DB::table('orphanage_records')->where('status', 'active')->count(); } catch(\Exception $e){}     
        return Inertia::render('Dashboard/Orphanage', [
            'currentChildren' => $currentChildren,
            // Add more stats as needed
        ]);
    }
}