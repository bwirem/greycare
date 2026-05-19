<?php

// --- Mortuary Controllers ---
use App\Http\Controllers\Mortuary\MortuaryRecordController;
use App\Http\Controllers\Mortuary\MortuaryReleaseController;

/*
|--------------------------------------------------------------------------
| Mortuary Module Routes
|--------------------------------------------------------------------------
*/

// --- mortuary0: Deceased Records ---
Route::prefix('mortuary0')->name('mortuary0.')->group(function () {
    Route::get('/', [MortuaryRecordController::class, 'index'])->name('index');
    Route::get('/create', [MortuaryRecordController::class, 'create'])->name('create');
    Route::post('/', [MortuaryRecordController::class, 'store'])->name('store');

    // New Routes for Ward assignment:
    Route::get('/{record}/edit', [MortuaryRecordController::class, 'edit'])->name('edit');
    Route::put('/{record}', [MortuaryRecordController::class, 'update'])->name('update');
});

// --- mortuary1: Release Management ---
Route::prefix('mortuary1')->name('mortuary1.')->group(function () {
    Route::get('/', [MortuaryReleaseController::class, 'index'])->name('index');
    Route::get('/{record}/release', [MortuaryReleaseController::class, 'create'])->name('create');
    Route::post('/{record}', [MortuaryReleaseController::class, 'store'])->name('store');
});