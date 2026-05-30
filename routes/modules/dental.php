<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\SpecializeClinic\Dental\DentalExaminationController;
use App\Http\Controllers\SpecializeClinic\Consumables\ConsumablesDashboardController;

Route::prefix('dental')->name('dental.')->group(function () {
    // Dashboard
    Route::get('/', function () { 
        return Inertia::render('SpecializeClinic/Dental/Index'); 
    })->name('index');
});

// dental0: Therapy Sessions
Route::prefix('dental0')->name('dental0.')->group(function () {
    Route::get('/', [DentalExaminationController::class, 'index'])->name('index');
    Route::get('/create', [DentalExaminationController::class, 'create'])->name('create');
    Route::post('/', [DentalExaminationController::class, 'store'])->name('store');
    Route::get('/{session}/edit', [DentalExaminationController::class, 'edit'])->name('edit');
    Route::put('/{session}', [DentalExaminationController::class, 'update'])->name('update');
    Route::delete('/{session}', [DentalExaminationController::class, 'destroy'])->name('destroy');
    
    // Patient Search Helper
    Route::get('/search', [DentalExaminationController::class, 'searchPatient'])->name('search');
});

Route::prefix('dental2')->name('dental2.')->group(function () {
    // The Dashboard page 
    Route::get('/', [ConsumablesDashboardController::class, 'index'])->name('consumables.index');
});