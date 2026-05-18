<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Controllers
use App\Http\Controllers\SpecializeClinic\Rch\RchFamilyPlanningController;
use App\Http\Controllers\SpecializeClinic\Rch\RchAntenatalController;
use App\Http\Controllers\SpecializeClinic\Rch\RchPostnatalController;
use App\Http\Controllers\SpecializeClinic\Rch\RchChildHealthController;
use App\Http\Controllers\SpecializeClinic\Rch\RchImmunizationController;
use App\Http\Controllers\SpecializeClinic\Consumables\ConsumablesDashboardController;

// Main Hub
Route::prefix('rch')->name('rch.')->group(function () {
    Route::get('/', function () { 
        return Inertia::render('ModulesHub/Rch/Index'); 
    })->name('index');
});

// rch0: Family Planning
Route::prefix('rch0')->name('rch0.')->group(function () {
    Route::get('/', [RchFamilyPlanningController::class, 'index'])->name('index');
    Route::get('/create', [RchFamilyPlanningController::class, 'create'])->name('create');
    Route::post('/', [RchFamilyPlanningController::class, 'store'])->name('store');
    Route::get('/{visit}/edit', [RchFamilyPlanningController::class, 'edit'])->name('edit');
    Route::put('/{visit}', [RchFamilyPlanningController::class, 'update'])->name('update');
    Route::delete('/{visit}', [RchFamilyPlanningController::class, 'destroy'])->name('destroy');
    
    // Search/Patient Lookup for FP
    Route::get('/search-patient', [RchFamilyPlanningController::class, 'searchPatient'])->name('search');
});

// rch1: Antenatal Care (ANC)
Route::prefix('rch1')->name('rch1.')->group(function () {
    // List of Active Pregnancies / ANC Visits
    Route::get('/', [RchAntenatalController::class, 'index'])->name('index');
    
    // Register a New Pregnancy (The Folder)
    Route::get('/register', [RchAntenatalController::class, 'createPregnancy'])->name('register.create');
    Route::post('/register', [RchAntenatalController::class, 'storePregnancy'])->name('register.store');
    
    // View Visit History (The link to access Edit)
    Route::get('/pregnancy/{pregnancy}/history', [RchAntenatalController::class, 'history'])->name('history'); // <--- ADDED THIS

    // Record a Daily Visit
    Route::get('/visit/create', [RchAntenatalController::class, 'createVisit'])->name('visit.create');
    Route::post('/visit', [RchAntenatalController::class, 'storeVisit'])->name('visit.store');
    
    // Edit/Update
    Route::get('/{visit}/edit', [RchAntenatalController::class, 'edit'])->name('edit');
    Route::put('/{visit}', [RchAntenatalController::class, 'update'])->name('update');
    
    // Close Pregnancy (Delivery/Outcome)
    Route::post('/close-pregnancy/{pregnancy}', [RchAntenatalController::class, 'closePregnancy'])->name('close');
});


// rch2: Postnatal Care (PNC) & Delivery
Route::prefix('rch2')->name('rch2.')->group(function () {
    Route::get('/', [RchPostnatalController::class, 'index'])->name('index');
    
    // Delivery Records (Labor Ward)
    Route::get('/delivery/create', [RchPostnatalController::class, 'createDelivery'])->name('delivery.create');
    Route::post('/delivery', [RchPostnatalController::class, 'storeDelivery'])->name('delivery.store');
    
    // PNC Visits (Post-delivery checkups)
    Route::get('/visit/create', [RchPostnatalController::class, 'createVisit'])->name('visit.create');
    Route::post('/visit', [RchPostnatalController::class, 'storeVisit'])->name('visit.store');
    
    Route::get('/{visit}/edit', [RchPostnatalController::class, 'edit'])->name('edit');
    Route::put('/{visit}', [RchPostnatalController::class, 'update'])->name('update');
});

// rch3: Child Health (Growth Monitoring)
Route::prefix('rch3')->name('rch3.')->group(function () {
    Route::get('/', [RchChildHealthController::class, 'index'])->name('index');
    
    // Growth Log (Height/Weight/Z-Score)
    Route::get('/create', [RchChildHealthController::class, 'create'])->name('create');
    Route::post('/', [RchChildHealthController::class, 'store'])->name('store');
    
    Route::get('/{log}/edit', [RchChildHealthController::class, 'edit'])->name('edit');
    Route::put('/{log}', [RchChildHealthController::class, 'update'])->name('update');
    
    // View Child Growth Chart
    Route::get('/chart/{child}', [RchChildHealthController::class, 'viewChart'])->name('chart');
});

// rch4: Immunizations
Route::prefix('rch4')->name('rch4.')->group(function () {
    Route::get('/', [RchImmunizationController::class, 'index'])->name('index');
    
    // Administer Vaccine
    Route::get('/create', [RchImmunizationController::class, 'create'])->name('create');
    Route::post('/', [RchImmunizationController::class, 'store'])->name('store');
    
    Route::get('/{record}/edit', [RchImmunizationController::class, 'edit'])->name('edit');
    Route::put('/{record}', [RchImmunizationController::class, 'update'])->name('update');
    Route::delete('/{record}', [RchImmunizationController::class, 'destroy'])->name('destroy');
    
    // Bulk Entry (Optional helper)
    Route::post('/bulk', [RchImmunizationController::class, 'storeBulk'])->name('bulk.store');
});

Route::prefix('rch5')->name('rch5.')->group(function () {
    // The Dashboard page 
    Route::get('/', [ConsumablesDashboardController::class, 'index'])->name('consumables.index');
});