<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\SpecializeClinic\Physiotherapy\PhysiotherapyController;
use App\Http\Controllers\SpecializeClinic\Consumables\ConsumablesDashboardController;

Route::prefix('physiotherapy')->name('physiotherapy.')->group(function () {
    // Dashboard
    Route::get('/', function () { 
        return Inertia::render('SpecializeClinic/Physiotherapy/Index'); 
    })->name('index');
});

// physiotherapy0: Therapy Sessions
Route::prefix('physiotherapy0')->name('physiotherapy0.')->group(function () {
    Route::get('/', [PhysiotherapyController::class, 'index'])->name('index');
    Route::get('/create', [PhysiotherapyController::class, 'create'])->name('create');
    Route::post('/', [PhysiotherapyController::class, 'store'])->name('store');
    Route::get('/{session}/edit', [PhysiotherapyController::class, 'edit'])->name('edit');
    Route::put('/{session}', [PhysiotherapyController::class, 'update'])->name('update');
    Route::delete('/{session}', [PhysiotherapyController::class, 'destroy'])->name('destroy');
    
    // Patient Search Helper
    Route::get('/search', [PhysiotherapyController::class, 'searchPatient'])->name('search');
});

Route::prefix('physiotherapy2')->name('physiotherapy2.')->group(function () {
    // The Dashboard page 
    Route::get('/', [ConsumablesDashboardController::class, 'index'])->name('consumables.index');
});