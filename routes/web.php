<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Models\Facility\FacilityOption;

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// --- Public Routes ---
Route::get('/', function () {
    $showRegisterButton = true;
    $options = FacilityOption::first();
    if($options){
        $showRegisterButton = $options->show_register_button === 1;
    } 

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register') && $showRegisterButton,        
    ]);
});

require __DIR__.'/auth.php';

// --- Authenticated Routes ---
Route::middleware(['auth', 'verified'])->group(function () {

    // 1. MAIN ENTRY (The Launchpad)
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    // 2. HOSPITAL SERVICES (Clinical Stats)
    Route::get('/dashboard/hospital', [DashboardController::class, 'hospitalStats'])
        ->name('dashboard.hospital');
    
     // Add this new route
    Route::get('/dashboard/specialized', [DashboardController::class, 'specializedStats'])
        ->name('dashboard.specialized');  
    
     // Add this new route
    Route::get('/dashboard/mortuary', [DashboardController::class, 'mortuaryStats'])
        ->name('dashboard.mortuary');  
        
    Route::get('/dashboard/orphanage', [DashboardController::class, 'orphanageStats'])
        ->name('dashboard.orphanage');

    // 3. RESOURCE & ASSET MANAGEMENT (Procurement & Inventory Stats)
    Route::get('/dashboard/resources', [DashboardController::class, 'resourceStats'])
        ->name('dashboard.resources');

    // 4. SALES & FINANCE MANAGEMENT (Billing & Revenue Stats)
    Route::get('/dashboard/finance', [DashboardController::class, 'financeStats'])
        ->name('dashboard.finance');

    // 5. HUMAN RESOURCE MANAGEMENT (HR Stats)
    Route::get('/dashboard/hr', [DashboardController::class, 'hrStats'])
        ->name('dashboard.hr');

    // Add these 2 lines to your dashboard group
    Route::get('/dashboard/reports', [DashboardController::class, 'reportStats'])->name('dashboard.reports');
    Route::get('/dashboard/admin', [DashboardController::class, 'adminStats'])->name('dashboard.admin');


    // --- Profile Management ---
    
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

   
    Route::get('/price-packages', [NhifController::class, 'getPricePackages']);
    Route::post('/authorize-card', [NhifController::class, 'authorizeCard']);


    // --- Load Modules (Keep strict ordering if necessary) ---
    require __DIR__.'/modules/hospital.php';

    require __DIR__.'/modules/billing.php';
    require __DIR__.'/modules/procurement.php';
    require __DIR__.'/modules/inventory.php';
    require __DIR__.'/modules/accounting.php';
    require __DIR__.'/modules/expenses.php';
    require __DIR__.'/modules/humanresource.php';
    require __DIR__.'/modules/rch.php';
    require __DIR__.'/modules/physiotherapy.php';
    require __DIR__.'/modules/reports.php';
    require __DIR__.'/modules/configuration.php'; // For systemconfiguration0...
    require __DIR__.'/modules/usermanagement.php';
    require __DIR__.'/modules/mortuary.php';
    require __DIR__.'/modules/dental.php';
    require __DIR__.'/modules/eye.php';
    require __DIR__.'/modules/orphanage.php'; // For orphanage0...  

});
