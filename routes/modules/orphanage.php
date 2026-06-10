<?php

// --- Orphanage Controllers ---
use App\Http\Controllers\Orphanage\OrpRegistrationController;
use App\Http\Controllers\Orphanage\OrpAdoptionController;
use App\Http\Controllers\Orphanage\OrpDischargeController;

/*
|--------------------------------------------------------------------------
| Orphanage Module Routes
|--------------------------------------------------------------------------
*/

// ---------------------------------------------------------------------
// orphanage0: Registration Records
// ---------------------------------------------------------------------
Route::prefix('orphanage0')->name('orphanage0.')->group(function () {

    Route::get('/', [OrpRegistrationController::class, 'index'])->name('index');

    Route::get('/create', [OrpRegistrationController::class, 'create'])->name('create');

    Route::post('/', [OrpRegistrationController::class, 'store'])->name('store');

    Route::get('/{registration}/edit', [OrpRegistrationController::class, 'edit'])->name('edit');

    Route::put('/{registration}', [OrpRegistrationController::class, 'update'])->name('update');

    Route::delete('/{registration}', [OrpRegistrationController::class, 'destroy'])->name('destroy');
});


// ---------------------------------------------------------------------
// orphanage1: Adoption Records
// ---------------------------------------------------------------------
Route::prefix('orphanage1')->name('orphanage1.')->group(function () {

    Route::get('/', [OrpAdoptionController::class, 'index'])->name('index');

    Route::get('/create', [OrpAdoptionController::class, 'create'])->name('create');

    Route::post('/', [OrpAdoptionController::class, 'store'])->name('store');

    Route::get('/{id}/edit', [OrpAdoptionController::class, 'edit'])->name('edit');

    Route::put('/{id}', [OrpAdoptionController::class, 'update'])->name('update');

    Route::delete('/{id}', [OrpAdoptionController::class, 'destroy'])->name('destroy');
});


Route::prefix('orphanage2')->name('orphanage2.')->group(function () {

    Route::get('/', [OrpDischargeController::class, 'index'])->name('index');

    Route::get('/create', [OrpDischargeController::class, 'create'])->name('create');

    Route::post('/', [OrpDischargeController::class, 'store'])->name('store');

    Route::get('/{discharge}/edit', [OrpDischargeController::class, 'edit'])->name('edit');

    Route::put('/{discharge}', [OrpDischargeController::class, 'update'])->name('update');

    Route::delete('/{discharge}', [OrpDischargeController::class, 'destroy'])->name('destroy');
});