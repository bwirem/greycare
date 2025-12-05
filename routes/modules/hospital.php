<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Hospital\Opd\OpdRegistrationController;
use App\Http\Controllers\Hospital\Opd\OpdAppointmentController;

use App\Http\Controllers\Hospital\Clinical\NursingController;

/*
|--------------------------------------------------------------------------
| Hospital / Clinical Routes
|--------------------------------------------------------------------------
|
| This file handles OPD, IPD, Nursing, Doctor, and other clinical
| operations.
|
*/

// inventory0: Requistion routes
Route::prefix('outpatient0')->name('outpatient0.')->group(function () {        
    // Registrations List
    Route::get('/', [OpdRegistrationController::class, 'index'])
        ->name('index');      
    Route::get('/create', [OpdRegistrationController::class, 'create'])
        ->name('create');
    Route::post('/', [OpdRegistrationController::class, 'store'])
        ->name('store');

    // ** NEW: Patient Search Route **
    Route::get('/search-patient', [OpdRegistrationController::class, 'searchPatient'])
        ->name('search_patient');
    
    // ** NEW ROUTES **
    
    // 1. Edit Form
    Route::get('/{id}/edit', [OpdRegistrationController::class, 'edit'])->name('edit');
    
    // 2. Update Action
    Route::put('/{id}', [OpdRegistrationController::class, 'update'])->name('update');
    
    // 3. Print Visit Slip (The "Send to Triage" action)
    Route::get('/{id}/print-slip', [OpdRegistrationController::class, 'printSlip'])->name('print_slip');
    
    // 4. View Details
    Route::get('/{id}', [OpdRegistrationController::class, 'show'])->name('show');    
});


// --- APPOINTMENTS MODULE (outpatient1) ---
Route::prefix('outpatient1')->name('outpatient1.')->group(function () {
    
    // Calendar View
    Route::get('/', [OpdAppointmentController::class, 'index'])->name('index');
    
    // Create / Update
    Route::post('/', [OpdAppointmentController::class, 'store'])->name('store');
    Route::put('/{id}', [OpdAppointmentController::class, 'update'])->name('update');
    
    // The "Check-In" Action (Converts Appointment -> Visit)
    Route::post('/{id}/checkin', [OpdAppointmentController::class, 'checkIn'])->name('checkin');
});

    // --- IPD Module (Future) ---
    // Route::prefix('ipd')->group(function() { ... });



// --- NURSING MODULE (nursing0) ---
Route::prefix('nursing0')->name('nursing0.')->group(function () {
    
    // The Queue (List of patients waiting for vitals)
    Route::get('/', [NursingController::class, 'index'])->name('index');
    
    // The Form
    Route::get('/{booking}/take-vitals', [NursingController::class, 'create'])->name('create');
    
    // Save Action
    Route::post('/{booking}', [NursingController::class, 'store'])->name('store');
});

