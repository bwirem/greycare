<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Physiotherapy\PhysiotherapyController;

Route::prefix('physiotherapy')->name('physiotherapy.')->group(function () {
    // Dashboard
    Route::get('/', function () { 
        return Inertia::render('Hospital/Physiotherapy/Index'); 
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