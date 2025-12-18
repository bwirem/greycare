<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Inventory\IVRequistionController;
use App\Http\Controllers\Inventory\IVIssueController;
use App\Http\Controllers\Inventory\IVReceiveController;
use App\Http\Controllers\Inventory\IVNormalAdjustmentController;
use App\Http\Controllers\Inventory\IVPhysicalInventoryController;

use App\Models\Inventory\IVNormalAdjustment;
use App\Models\Inventory\IVPhysicalInventory;

// Main Hub & Material Conversion Hub
Route::prefix('inventory')->name('inventory.')->group(function () {
    Route::get('/', function () { return Inertia::render('ModulesHub/Inventory/Index'); })->name('index');
});
Route::prefix('materialconversion')->name('materialconversion.')->group(function () {
    Route::get('/', function () { return Inertia::render('ModulesHub/MaterialConversion/Index'); })->name('index');
});

// inventory0: Requistion routes
Route::prefix('inventory0')->name('inventory0.')->group(function () {
    Route::get('/', [IVRequistionController::class, 'index'])->name('index');
    Route::get('/create', [IVRequistionController::class, 'create'])->name('create');
    Route::post('/', [IVRequistionController::class, 'store'])->name('store');
    Route::get('/{requistion}/edit', [IVRequistionController::class, 'edit'])->name('edit');
    Route::put('/{requistion}', [IVRequistionController::class, 'update'])->name('update');
    Route::delete('/{requistion}', [IVRequistionController::class, 'destroy'])->name('destroy');
});

// inventory1: Issue routes
Route::prefix('inventory1')->name('inventory1.')->group(function () {
    Route::get('/', [IVIssueController::class, 'index'])->name('index');
    Route::get('/create', [IVIssueController::class, 'create'])->name('create');
    Route::post('/', [IVIssueController::class, 'store'])->name('store');
    Route::get('/{requistion}/edit', [IVIssueController::class, 'edit'])->name('edit');
    Route::post('/{requistion}/approve', [IVIssueController::class, 'approve'])->name('approve');
    Route::post('/{requistion}/reject', [IVIssueController::class, 'reject'])->name('reject');
    Route::get('/{requistion}/return', [IVIssueController::class, 'return'])->name('return');        
    Route::put('/{requistion}', [IVIssueController::class, 'update'])->name('update');
    Route::delete('/{requistion}', [IVIssueController::class, 'destroy'])->name('destroy');
});

// inventory2: Receive routes
Route::prefix('inventory2')->name('inventory2.')->group(function () {
    Route::get('/', [IVReceiveController::class, 'index'])->name('index');
    Route::get('/create', [IVReceiveController::class, 'create'])->name('create');
    Route::post('/', [IVReceiveController::class, 'store'])->name('store');
    Route::get('/{receive}/edit', [IVReceiveController::class, 'edit'])->name('edit');
    Route::put('/{receive}', [IVReceiveController::class, 'update'])->name('update');
    Route::delete('/{receive}', [IVReceiveController::class, 'destroy'])->name('destroy');
});

// inventory3: Reconciliation
Route::prefix('inventory3')->name('inventory3.')->group(function () {
    
    Route::get('/', function () {
        return Inertia::render('Inventory/IvReconciliation/Index', [
            'normalAdjustmentCount'      => IVNormalAdjustment::count(),
            'physicalInventoryCount'   => IVPhysicalInventory::count(),                
        ]);
    })->name('index');

    // Normal Adjustment
    Route::prefix('normal-adjustment')->name('normal-adjustment.')->group(function () {
        Route::get('/', [IVNormalAdjustmentController::class, 'index'])->name('index');
        Route::get('/create', [IVNormalAdjustmentController::class, 'create'])->name('create');
        Route::post('/', [IVNormalAdjustmentController::class, 'store'])->name('store');
        Route::get('/{normaladjustment}/edit', [IVNormalAdjustmentController::class, 'edit'])->name('edit');
        Route::put('/{normaladjustment}', [IVNormalAdjustmentController::class, 'update'])->name('update');
    });

    // Physical Inventory
    Route::prefix('physical-inventory')->name('physical-inventory.')->group(function () {
        Route::get('/', [IVPhysicalInventoryController::class, 'index'])->name('index');
        Route::get('/create', [IVPhysicalInventoryController::class, 'create'])->name('create');
        Route::post('/', [IVPhysicalInventoryController::class, 'store'])->name('store');
        Route::get('/{physicalinventory}/edit', [IVPhysicalInventoryController::class, 'edit'])->name('edit');
        Route::put('/{physicalinventory}', [IVPhysicalInventoryController::class, 'update'])->name('update');
        Route::put('/{physicalinventory}/commit', [IVPhysicalInventoryController::class, 'commit'])->name('commit');
    });
});