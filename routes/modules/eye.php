<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\SpecializeClinic\Eye\EyeExaminationController;
use App\Http\Controllers\SpecializeClinic\Consumables\ConsumablesDashboardController;

Route::prefix('eye')->name('eye.')->group(function () {
    // Dashboard
    Route::get('/', function () { 
        return Inertia::render('SpecializeClinic/EyeExamination/Index'); 
    })->name('index');
});

// eye0: Therapy Sessions
Route::prefix('eye0')->name('eye0.')->group(function () {
    Route::get('/', [EyeExaminationController::class, 'index'])->name('index');
    Route::get('/create', [EyeExaminationController::class, 'create'])->name('create');
    Route::post('/', [EyeExaminationController::class, 'store'])->name('store');
    Route::get('/{session}/edit', [EyeExaminationController::class, 'edit'])->name('edit');
    Route::put('/{session}', [EyeExaminationController::class, 'update'])->name('update');
    Route::delete('/{session}', [EyeExaminationController::class, 'destroy'])->name('destroy');
    
    // Patient Search Helper
    Route::get('/search', [EyeExaminationController::class, 'searchPatient'])->name('search');
});

Route::prefix('eye2')->name('eye2.')->group(function () {
    // The Dashboard page 
    Route::get('/', [ConsumablesDashboardController::class, 'index'])->name('consumables.index');
});