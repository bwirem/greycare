<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Procurement\PROTenderController;
use App\Http\Controllers\Procurement\PROPurchaseController;

// Main Hub
Route::prefix('procurement')->name('procurement.')->group(function () {
    Route::get('/', function () { return Inertia::render('ModulesHub/Procurement/Index'); })->name('index');
});

// procurements0: Tender routes
Route::prefix('procurements0')->name('procurements0.')->group(function () {
    Route::get('/', [PROTenderController::class, 'index'])->name('index');
    Route::get('/create', [PROTenderController::class, 'create'])->name('create');
    Route::post('/', [PROTenderController::class, 'store'])->name('store');
    Route::put('award/{tender}', [PROTenderController::class, 'award'])->name('award');  
    Route::get('/{tender}/edit', [PROTenderController::class, 'edit'])->name('edit');
    Route::put('/{tender}', [PROTenderController::class, 'update'])->name('update');
    Route::put('quotation/{tender}', [PROTenderController::class, 'quotation'])->name('quotation');   
    Route::put('/{tender}/return', [PROTenderController::class, 'return'])->name('return');            
    Route::delete('/{tender}', [PROTenderController::class, 'destroy'])->name('destroy');
});

// procurements1: Purchase routes
Route::prefix('procurements1')->name('procurements1.')->group(function () {
    Route::get('/', [PROPurchaseController::class, 'index'])->name('index');
    Route::get('/create', [PROPurchaseController::class, 'create'])->name('create');
    Route::post('/', [PROPurchaseController::class, 'store'])->name('store');
    Route::get('/{purchase}/edit', [PROPurchaseController::class, 'edit'])->name('edit');
    Route::put('/{purchase}', [PROPurchaseController::class, 'update'])->name('update');
    Route::put('approve/{purchase}', [PROPurchaseController::class, 'approve'])->name('approve');
    Route::put('dispatch/{purchase}', [PROPurchaseController::class, 'dispatch'])->name('dispatch');
    Route::put('receive/{purchase}', [PROPurchaseController::class, 'receive'])->name('receive');
    Route::delete('/{purchase}', [PROPurchaseController::class, 'destroy'])->name('destroy');
    Route::get('/{purchase}/show', [PROPurchaseController::class, 'show'])->name('show');
});