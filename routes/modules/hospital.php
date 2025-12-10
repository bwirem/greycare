<?php

use Illuminate\Support\Facades\Route;
// Opd Controllers
use App\Http\Controllers\Hospital\Opd\OpdRegistrationController;
use App\Http\Controllers\Hospital\Opd\OpdAppointmentController;
// Ipd Controllers
use App\Http\Controllers\Hospital\Ipd\IpdAdmissionController;
use App\Http\Controllers\Hospital\Ipd\IpdDischargeController;
use App\Http\Controllers\Hospital\Ipd\IpdTransferController;

// Nursing Controllers
use App\Http\Controllers\Hospital\Clinical\NursingController;

// Doctor Controllers
use App\Http\Controllers\Hospital\Doctor\DoctorOpdController;
use App\Http\Controllers\Hospital\Doctor\DoctorIpdController;   

// Laboratory Controllers
use App\Http\Controllers\Hospital\Laboratory\LabRequestController;
use App\Http\Controllers\Hospital\Laboratory\LabResultController;

// Radiology Controllers
use App\Http\Controllers\Hospital\Radiology\RadRequestController;
use App\Http\Controllers\Hospital\Radiology\RadResultController;

// Pharmacy Controllers
use App\Http\Controllers\Hospital\Pharmacy\PharmacyDispenseController;  
use App\Http\Controllers\Hospital\Pharmacy\PharmacyPrescriptionController;

// Theatre Controllers
use App\Http\Controllers\Hospital\Theatre\TheatreMinorController;
use App\Http\Controllers\Hospital\Theatre\TheatreSchedulingController;
use App\Http\Controllers\Hospital\Theatre\TheatreRecordController;
use App\Http\Controllers\Hospital\Theatre\TheatrePostOpController;

// Blood Bank Controllers
use App\Http\Controllers\BloodBank\BbDonorController;
use App\Http\Controllers\BloodBank\BbInventoryController;

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

 
/*|--------------------------------------------------------------------------
| Inpatient Module Routes   
|--------------------------------------------------------------------------
*/

// --- inpatient0: Admissions ---
Route::prefix('inpatient0')->name('inpatient0.')->group(function () {
    Route::get('/', [IpdAdmissionController::class, 'index'])->name('index'); // List of active admissions
    Route::get('/create', [IpdAdmissionController::class, 'create'])->name('create'); // Search patient to admit
    Route::post('/', [IpdAdmissionController::class, 'store'])->name('store'); // Save Admission
});

// --- inpatient1: Discharges ---
Route::prefix('inpatient1')->name('inpatient1.')->group(function () {
    Route::get('/', [IpdDischargeController::class, 'index'])->name('index'); // Pending discharges
    Route::get('/{admission}/process', [IpdDischargeController::class, 'create'])->name('create'); // Discharge form
    Route::post('/{admission}', [IpdDischargeController::class, 'store'])->name('store'); // Finalize discharge
});

// --- inpatient2: Transfer Wards ---
Route::prefix('inpatient2')->name('inpatient2.')->group(function () {
    Route::get('/', [IpdTransferController::class, 'index'])->name('index'); // Transfer list
    Route::get('/{admission}/transfer', [IpdTransferController::class, 'create'])->name('create'); // Transfer form
    Route::post('/{admission}', [IpdTransferController::class, 'store'])->name('store'); // Execute transfer
});

/*|--------------------------------------------------------------------------
| Nursing Module Routes
|--------------------------------------------------------------------------
*/

// --- NURSING MODULE (nursing0) ---
Route::prefix('nursing0')->name('nursing0.')->group(function () {
    
    // The Queue (List of patients waiting for vitals)
    Route::get('/', [NursingController::class, 'index'])->name('index');
    
    // The Form
    Route::get('/{booking}/take-vitals', [NursingController::class, 'create'])->name('create');
    
    // Save Action
    Route::post('/{booking}', [NursingController::class, 'store'])->name('store');
});

/*
|--------------------------------------------------------------------------
| Doctor Module Routes
|--------------------------------------------------------------------------
*/

// OPD Module (doctor0)
Route::prefix('doctor0')->name('doctor0.')->group(function () {
    Route::get('/', [DoctorOpdController::class, 'index'])->name('index');
    Route::get('/{booking}/consult', [DoctorOpdController::class, 'create'])->name('create');
    Route::post('/{booking}', [DoctorOpdController::class, 'store'])->name('store');
});

// IPD Module (doctor1)
Route::prefix('doctor1')->name('doctor1.')->group(function () {
    Route::get('/', [DoctorIpdController::class, 'index'])->name('index');
    Route::get('/{admission}/round', [DoctorIpdController::class, 'create'])->name('create');
    Route::post('/{admission}', [DoctorIpdController::class, 'store'])->name('store');
});

// --- doctor2: Prescriptions (Standalone) ---
// Usually handled inside the visit, but this route is for refills/direct scripts
Route::prefix('doctor2')->name('prescriptions.')->group(function () {
    Route::get('/', [DoctorOpdController::class, 'prescriptionIndex'])->name('index');
});



/*
|--------------------------------------------------------------------------
| Laboratory Module Routes
|--------------------------------------------------------------------------
*/

// --- laboratory0: Test Requests ---
Route::prefix('laboratory0')->name('laboratory0.')->group(function () {
    // List Pending Requests (Waiting for Sample Collection or Processing)
    Route::get('/', [LabRequestController::class, 'index'])->name('index');
    
    // Collect Sample Form
    Route::get('/{prescription}/collect', [LabRequestController::class, 'create'])->name('create');
    
    // Save Sample Collection (Generates Sample ID)
    Route::post('/{prescription}/collect', [LabRequestController::class, 'store'])->name('store');
    
    // Reject Request
    Route::post('/{prescription}/reject', [LabRequestController::class, 'reject'])->name('reject');
});

// --- laboratory1: Test Results ---
Route::prefix('laboratory1')->name('laboratory1.')->group(function () {
    // List Samples Ready for Result Entry
    Route::get('/', [LabResultController::class, 'index'])->name('index');
    
    // Result Entry Form (Grid View for Parameters)
    Route::get('/{sample}/enter', [LabResultController::class, 'create'])->name('create');
    
    // Save Results
    Route::post('/{sample}', [LabResultController::class, 'store'])->name('store');
    
    // Verify/Approve Results
    Route::post('/{sample}/verify', [LabResultController::class, 'verify'])->name('verify');
});



/*
|--------------------------------------------------------------------------
| Radiology Module Routes
|--------------------------------------------------------------------------
*/

// --- radiology0: Imaging Requests ---
Route::prefix('radiology0')->name('radiology0.')->group(function () {
    // Queue of requests waiting for imaging
    Route::get('/', [RadRequestController::class, 'index'])->name('index');
    
    // Mark request as "Image Taken" / Process
    Route::post('/{request}/process', [RadRequestController::class, 'process'])->name('process');
    
    // Reject Request
    Route::post('/{request}/reject', [RadRequestController::class, 'reject'])->name('reject');
});

// --- radiology1: Imaging Results (Reporting) ---
Route::prefix('radiology1')->name('radiology1.')->group(function () {
    // List of studies waiting for reporting
    Route::get('/', [RadResultController::class, 'index'])->name('index');
    
    // Reporting Form (Editor)
    Route::get('/{request}/report', [RadResultController::class, 'create'])->name('create');
    
    // Save Report
    Route::post('/{request}', [RadResultController::class, 'store'])->name('store');
    
    // View Final Report
    Route::get('/{report}/view', [RadResultController::class, 'show'])->name('show');
});


/*
|--------------------------------------------------------------------------
| Pharmacy Module Routes
|--------------------------------------------------------------------------
*/

    // --- pharmacy0: Drug Dispensing (Counter) ---
    Route::prefix('pharmacy0')->name('pharmacy0.')->group(function () {
        // List Pending Prescriptions (Waiting for Dispensing)
        Route::get('/', [PharmacyDispenseController::class, 'index'])->name('index');
        
        // Dispensing Form (Process Prescription)
        Route::get('/{prescription}/dispense', [PharmacyDispenseController::class, 'create'])->name('create');
        
        // Save Dispensation
        Route::post('/{prescription}', [PharmacyDispenseController::class, 'store'])->name('store');
    });

    // --- pharmacy1: Prescription Management (History/Corrections) ---
    Route::prefix('pharmacy1')->name('pharmacy1.')->group(function () {
        // List All Prescriptions (History)
        Route::get('/', [PharmacyPrescriptionController::class, 'index'])->name('index');
        
        // View Details
        Route::get('/{prescription}', [PharmacyPrescriptionController::class, 'show'])->name('show');
        
        // Void/Cancel Prescription
        Route::post('/{prescription}/cancel', [PharmacyPrescriptionController::class, 'cancel'])->name('cancel');
    });


/*
|--------------------------------------------------------------------------
| Theatre Module Routes
|--------------------------------------------------------------------------
*/

    // --- theatre0: Minor Theatre (Walk-in procedures) ---
    Route::prefix('theatre0')->name('theatre0.')->group(function () {
        Route::get('/', [TheatreMinorController::class, 'index'])->name('index'); // Queue
        Route::get('/create', [TheatreMinorController::class, 'create'])->name('create'); // New Minor Booking
        Route::post('/', [TheatreMinorController::class, 'store'])->name('store');
        Route::post('/{booking}/complete', [TheatreMinorController::class, 'complete'])->name('complete');
    });

    // --- theatre1: Surgery Scheduling (Major) ---
    Route::prefix('theatre1')->name('theatre1.')->group(function () {
        Route::get('/', [TheatreSchedulingController::class, 'index'])->name('index'); // Calendar/List
        Route::get('/create', [TheatreSchedulingController::class, 'create'])->name('create'); // Book Surgery
        Route::post('/', [TheatreSchedulingController::class, 'store'])->name('store');
        Route::post('/{booking}/cancel', [TheatreSchedulingController::class, 'cancel'])->name('cancel');
    });

    // --- theatre2: Surgery Records (Intra-operative) ---
    Route::prefix('theatre2')->name('theatre2.')->group(function () {
        Route::get('/', [TheatreRecordController::class, 'index'])->name('index'); // Patients In Theatre
        Route::get('/{booking}/record', [TheatreRecordController::class, 'edit'])->name('edit'); // Intra-op form
        Route::put('/{booking}', [TheatreRecordController::class, 'update'])->name('update'); // Save surgical notes
    });

    // --- theatre3: Post-Operative Care (Recovery) ---
    Route::prefix('theatre3')->name('theatre3.')->group(function () {
        Route::get('/', [TheatrePostOpController::class, 'index'])->name('index'); // Recovery Room List
        Route::get('/{booking}/care', [TheatrePostOpController::class, 'create'])->name('create'); // Vitals/Notes form
        Route::post('/{booking}', [TheatrePostOpController::class, 'store'])->name('store'); // Save Post-op data
        Route::post('/{booking}/discharge', [TheatrePostOpController::class, 'discharge'])->name('discharge'); // Send to Ward
    });





/*
|--------------------------------------------------------------------------
| Blood Bank Module Routes
|--------------------------------------------------------------------------
*/

// --- bloodbank0: Donor Management ---
Route::prefix('bloodbank0')->name('bloodbank0.')->group(function () {
    // List Donors
    Route::get('/', [BbDonorController::class, 'index'])->name('index');
    
    // Register New Donor Form
    Route::get('/create', [BbDonorController::class, 'create'])->name('create');
    
    // Save New Donor
    Route::post('/', [BbDonorController::class, 'store'])->name('store');
    
    // Show Donor Profile (Donation History)
    Route::get('/{donor}', [BbDonorController::class, 'show'])->name('show');
    
    // Add Donation Record (Bleeding)
    Route::post('/{donor}/donate', [BbDonorController::class, 'donate'])->name('donate');
});

// --- bloodbank1: Blood Inventory ---
Route::prefix('bloodbank1')->name('bloodbank1.')->group(function () {
    // List Blood Stock (Grouped by Type/Group)
    Route::get('/', [BbInventoryController::class, 'index'])->name('index');
    
    // View Individual Bags List
    Route::get('/bags', [BbInventoryController::class, 'bags'])->name('bags');
    
    // Discard / Update Status of a Bag
    Route::post('/{bag}/discard', [BbInventoryController::class, 'discard'])->name('discard');
});






