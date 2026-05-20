<?php

use Illuminate\Support\Facades\Route;
// Opd Controllers
use App\Http\Controllers\Hospital\Opd\OpdRegistrationController;
use App\Http\Controllers\Hospital\Opd\OpdAppointmentController;
// Authorization Controllers
use App\Http\Controllers\Hospital\Opd\OpdAuthorizationController;
use App\Http\Controllers\Hospital\Opd\OpdPostController;
use App\Http\Controllers\Hospital\Opd\OpdRegistrationPostBillsController;


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
use App\Http\Controllers\Hospital\Laboratory\LabHistoryController;

// Radiology Controllers
use App\Http\Controllers\Hospital\Radiology\RadRequestController;
use App\Http\Controllers\Hospital\Radiology\RadResultController;
use App\Http\Controllers\Hospital\Radiology\RadHistoryController;

// Pharmacy Controllers
use App\Http\Controllers\Hospital\Pharmacy\PharmacyDispenseController;  
use App\Http\Controllers\Hospital\Pharmacy\PharmacyPrescriptionController;
use App\Http\Controllers\Hospital\Pharmacy\PharmacyPostController;


// Theatre Controllers
use App\Http\Controllers\Hospital\Theatre\TheatreMinorController;
use App\Http\Controllers\Hospital\Theatre\TheatreSchedulingController;
use App\Http\Controllers\Hospital\Theatre\TheatreRecordController;
use App\Http\Controllers\Hospital\Theatre\TheatrePostOpController;

// Blood Bank Controllers
use App\Http\Controllers\BloodBank\BbDonorController;
use App\Http\Controllers\BloodBank\BbInventoryController;
use App\Http\Controllers\BloodBank\BbCrossmatchController;

// 1. Update the Import
use App\Http\Controllers\Hospital\Clinical\NursingMedicationController;

use App\Http\Controllers\Hospital\Consumables\ConsumablesDashboardController;

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
    
    // ==========================================
    // 1. STATIC ROUTES (MUST BE AT THE TOP)
    // ==========================================
    
    // Main Registration List
    Route::get('/', [OpdRegistrationController::class, 'index'])->name('index');      
    
    // Create & Store
    Route::get('/create', [OpdRegistrationController::class, 'create'])->name('create');
    Route::post('/', [OpdRegistrationController::class, 'store'])->name('store');

    // Patient Search
    Route::get('/search-patient', [OpdRegistrationController::class, 'searchPatient'])->name('search_patient');
    
    // Authorization Routes
    Route::get('/authorization/verify-card', [OpdAuthorizationController::class, 'verifyCard'])->name('auth.verify');
    Route::post('/authorization/request', [OpdAuthorizationController::class, 'requestAuthorization'])->name('auth.request');

    // ==========================================
    // 2. BILLING ROUTES (Use a sub-prefix)
    // ==========================================
    // These must also be ABOVE the /{id} wildcard because they start with /billing
    
    Route::prefix('billing')->name('billing.')->group(function() {
        // URL: /outpatient0/billing
        Route::get('/', [OpdRegistrationPostBillsController::class, 'index'])->name('index');
        
        // URL: /outpatient0/billing/create
        Route::get('/create', [OpdRegistrationPostBillsController::class, 'create'])->name('create');
        Route::post('/', [OpdRegistrationPostBillsController::class, 'store'])->name('store');
        
        // URL: /outpatient0/billing/{order}/edit
        Route::get('/{order}/edit', [OpdRegistrationPostBillsController::class, 'edit'])->name('edit');
        Route::put('/{order}', [OpdRegistrationPostBillsController::class, 'update'])->name('update');
        Route::delete('/{order}', [OpdRegistrationPostBillsController::class, 'destroy'])->name('destroy');

        // Confirmations
        Route::post('/confirm-save', [OpdRegistrationPostBillsController::class, 'confirmSave'])->name('confirmSave');
        Route::post('/confirm-payment', [OpdRegistrationPostBillsController::class, 'confirmPayment'])->name('confirmPayment');
        Route::get('/confirm-save', [OpdRegistrationPostBillsController::class, 'create'])->name('confirm.save');
        Route::get('/confirm-payment', [OpdRegistrationPostBillsController::class, 'create'])->name('confirm.payment');

        // Existing Order actions
        Route::post('/confirm-update/{order}', [OpdRegistrationPostBillsController::class, 'confirmUpdate'])->name('confirmUpdate');
        Route::post('/confirm-existing-payment/{order}', [OpdRegistrationPostBillsController::class, 'confirmExistingPayment'])->name('confirmExistingPayment');
        Route::get('/confirm-update/{order}', [OpdRegistrationPostBillsController::class, 'edit'])->name('confirm.update');
        Route::get('/confirm-existing-payment/{order}', [OpdRegistrationPostBillsController::class, 'edit'])->name('confirm.existing.payment');

        // Payment Handling
        Route::post('/pay', [OpdRegistrationPostBillsController::class, 'processPayment'])->name('pay');
        Route::put('/pay/{order}', [OpdRegistrationPostBillsController::class, 'processPayment'])->name('pay_update');
        Route::get('/invoice-preview', [OpdRegistrationPostBillsController::class, 'invoicePreview'])->name('invoice_preview');
    });

    // ==========================================
    // 3. DYNAMIC WILDCARD ROUTES (MUST BE LAST)
    // ==========================================
    // If you put these at the top, they will "eat" the /billing URL
    
    Route::get('/{id}/print-slip', [OpdRegistrationController::class, 'printSlip'])->name('print_slip');
    Route::get('/{id}/edit', [OpdRegistrationController::class, 'edit'])->name('edit');
    Route::put('/{id}', [OpdRegistrationController::class, 'update'])->name('update');
    
    // This catch-all route MUST be the very last one
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

// outpatient4: Post Bills routes
Route::prefix('outpatient4')->name('outpatient4.')->group(function () {
    Route::get('/', [OpdPostController::class, 'index'])->name('index');
    Route::get('/create', [OpdPostController::class, 'create'])->name('create');
    Route::get('/{order}/edit', [OpdPostController::class, 'edit'])->name('edit');

    // Confirmation Routes
    Route::post('/confirm-save', [OpdPostController::class, 'confirmSave'])->name('confirmSave');
    Route::post('/confirm-payment', [OpdPostController::class, 'confirmPayment'])->name('confirmPayment');
    Route::get('/confirm-save', [OpdPostController::class, 'create'])->name('confirm.save');
    Route::get('/confirm-payment', [OpdPostController::class, 'create'])->name('confirm.payment');

    Route::post('/confirm-update/{order}', [OpdPostController::class, 'confirmUpdate'])->name('confirmUpdate');
    Route::post('/confirm-existing-payment/{order}', [OpdPostController::class, 'confirmExistingPayment'])->name('confirmExistingPayment');
    Route::get('/confirm-update/{order}', [OpdPostController::class, 'edit'])->name('confirm.update');
    Route::get('/confirm-existing-payment/{order}', [OpdPostController::class, 'edit'])->name('confirm.existing.payment');

    Route::post('/', [OpdPostController::class, 'store'])->name('store');        
    Route::put('/{order}', [OpdPostController::class, 'update'])->name('update');
    Route::delete('/{order}', [OpdPostController::class, 'destroy'])->name('destroy');

    // Payment Handling
    Route::post('/pay', [OpdPostController::class, 'processPayment'])->name('pay');
    Route::put('/pay/{order}', [OpdPostController::class, 'processPayment'])->name('pay_update');

    Route::get('/invoice-preview', [OpdPostController::class, 'invoicePreview'])->name('invoice_preview');
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
    Route::get('/discharge-report/{admission}', [IpdDischargeController::class, 'printDischargeReport'])->name('print-report');
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

    // NEW: Vitals Route
    Route::post('/record-vitals', [NursingMedicationController::class, 'storeVitals'])->name('store_vitals');
});

// 2. The Route Group (Unchanged, just uses the new class)
Route::prefix('nursing1')->name('nursing1.')->group(function () {
    Route::get('/', [NursingMedicationController::class, 'index'])->name('index');
    Route::get('/{id}/{type}/administer', [NursingMedicationController::class, 'create'])->name('create');
    Route::post('/record', [NursingMedicationController::class, 'store'])->name('store');
    // *** ADD THIS MISSING ROUTE ***
    Route::post('/record-vitals', [NursingMedicationController::class, 'storeVitals'])->name('store_vitals');
});

//
Route::prefix('nursing4')->name('nursing4.')->group(function () {
// The Dashboard page 
    Route::get('/', [ConsumablesDashboardController::class, 'index'])->name('consumables.index');
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
    Route::delete('/order/{type}/{id}', [DoctorOpdController::class, 'destroyOrder'])->name('order.destroy');
});

// IPD Module (doctor1)
Route::prefix('doctor1')->name('doctor1.')->group(function () {
    Route::get('/', [DoctorIpdController::class, 'index'])->name('index');
    Route::get('/{admission}/round', [DoctorIpdController::class, 'create'])->name('create');
    Route::post('/{admission}', [DoctorIpdController::class, 'store'])->name('store');
    // Add this new route
    Route::post('/{admission}/discharge-initiate', [DoctorIpdController::class, 'initiateDischarge'])->name('initiate');
    Route::delete('/order/{type}/{id}', [DoctorIpdController::class, 'destroyOrder'])->name('order.destroy');
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

    Route::post('/{sample}/reject', [LabResultController::class, 'rejectSample'])->name('reject_sample');
});


// --- laboratory2: Test History ---
Route::prefix('laboratory2')->name('laboratory2.')->group(function () {
    // List of Completed/Verified Tests with Filters
    Route::get('/', [LabHistoryController::class, 'index'])->name('index');
});

Route::prefix('laboratory3')->name('laboratory3.')->group(function () {
// The Dashboard page 
    Route::get('/', [ConsumablesDashboardController::class, 'index'])->name('consumables.index');
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
    
    // Mark radRequest as "Image Taken" / Process
    Route::post('/{radRequest}/process', [RadRequestController::class, 'process'])->name('process');
    
    // Reject Request
    Route::post('/{radRequest}/reject', [RadRequestController::class, 'reject'])->name('reject');
});

// --- radiology1: Imaging Results (Reporting) ---
Route::prefix('radiology1')->name('radiology1.')->group(function () {
    // List of studies waiting for reporting
    Route::get('/', [RadResultController::class, 'index'])->name('index');
    
    // Reporting Form (Editor)
    Route::get('/{request}/report', [RadResultController::class, 'create'])->name('create');
    
    // Save Report
    Route::post('/{radRequest}', [RadResultController::class, 'store'])->name('store');
    
    // View Final Report
    Route::get('/{report}/view', [RadResultController::class, 'show'])->name('show');
});

// --- radiology2: Imaging History---
Route::prefix('radiology2')->name('radiology2.')->group(function () {
    //List of completed/finalized studies with filters
    Route::get('/', [RadHistoryController::class, 'index'])->name('index');
});

Route::prefix('radiology3')->name('radiology3.')->group(function () {
// The Dashboard page 
    Route::get('/', [ConsumablesDashboardController::class, 'index'])->name('consumables.index');
}); 



/*
|--------------------------------------------------------------------------
| Pharmacy Module Routes
|--------------------------------------------------------------------------
*/    

    // --- pharmacy0: Drug Dispensing (Counter) ---
    Route::prefix('pharmacy0')->name('pharmacy0.')->group(function () {
        
        // 1. Dashboard / Queue
        Route::get('/', [PharmacyDispenseController::class, 'index'])->name('index');

        // 2. STAGE 1: Generate Bill (For Cash Patients - Verify Qty & Push to Billing)
        // This is called when the Pharmacist clicks "Bill"
        Route::post('/dispense/{prescription}/bill', [PharmacyDispenseController::class, 'generateBill'])
            ->name('bill');
        
        Route::post('/dispense/{prescription}/pay', [PharmacyDispenseController::class, 'payBill'])
            ->name('pay');    

        // 3. STAGE 2: Dispensing Form (Physical Handover)
        // Only accessible if Paid or Insurance
        Route::get('/dispense/{prescription}', [PharmacyDispenseController::class, 'create'])->name('create');
        
        // 4. Save Dispensation (Deduct Stock)
        Route::post('/dispense/{prescription}', [PharmacyDispenseController::class, 'store'])->name('store');

        Route::get('/check-stock', [PharmacyDispenseController::class, 'checkStock'])->name('check_stock');

        // ==========================================
        // 2. BILLING ROUTES (Use a sub-prefix)
        // ==========================================
        // These must also be ABOVE the /{id} wildcard because they start with /billing
    
        Route::prefix('billing')->name('billing.')->group(function() {
            // URL: /outpatient0/billing
            Route::get('/', [PharmacyPostController::class, 'index'])->name('index');
            
            // URL: /outpatient0/billing/create
            Route::get('/create', [PharmacyPostController::class, 'create'])->name('create');
            Route::post('/', [PharmacyPostController::class, 'store'])->name('store');
            
            // URL: /outpatient0/billing/{order}/edit
            Route::get('/{order}/edit', [PharmacyPostController::class, 'edit'])->name('edit');
            Route::put('/{order}', [PharmacyPostController::class, 'update'])->name('update');
            Route::delete('/{order}', [PharmacyPostController::class, 'destroy'])->name('destroy');

            // Confirmations
            Route::post('/confirm-save', [PharmacyPostController::class, 'confirmSave'])->name('confirmSave');
            Route::post('/confirm-payment', [PharmacyPostController::class, 'confirmPayment'])->name('confirmPayment');
            Route::get('/confirm-save', [PharmacyPostController::class, 'create'])->name('confirm.save');
            Route::get('/confirm-payment', [PharmacyPostController::class, 'create'])->name('confirm.payment');

            // Existing Order actions
            Route::post('/confirm-update/{order}', [PharmacyPostController::class, 'confirmUpdate'])->name('confirmUpdate');
            Route::post('/confirm-existing-payment/{order}', [PharmacyPostController::class, 'confirmExistingPayment'])->name('confirmExistingPayment');
            Route::get('/confirm-update/{order}', [PharmacyPostController::class, 'edit'])->name('confirm.update');
            Route::get('/confirm-existing-payment/{order}', [PharmacyPostController::class, 'edit'])->name('confirm.existing.payment');

            // Payment Handling
            Route::post('/pay', [PharmacyPostController::class, 'processPayment'])->name('pay');
            Route::put('/pay/{order}', [PharmacyPostController::class, 'processPayment'])->name('pay_update');
            Route::get('/invoice-preview', [PharmacyPostController::class, 'invoicePreview'])->name('invoice_preview');
        });

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
        
        // 1. List & Calendar
        Route::get('/', [TheatreSchedulingController::class, 'index'])->name('index'); 
        
        // 2. Book New Surgery
        Route::get('/create', [TheatreSchedulingController::class, 'create'])->name('create'); 
        Route::post('/', [TheatreSchedulingController::class, 'store'])->name('store');

        // 3. ** NEW: Edit & Reschedule Routes **
        Route::get('/{booking}/edit', [TheatreSchedulingController::class, 'edit'])->name('edit');
        Route::put('/{booking}', [TheatreSchedulingController::class, 'update'])->name('update');

        // 4. ** UPDATED: Cancel Route **
        // Changed to DELETE to match the React 'router.delete' logic
        Route::delete('/{booking}/cancel', [TheatreSchedulingController::class, 'cancel'])->name('cancel');
    });

    // --- theatre2: Surgery Records (Intra-operative) ---
    Route::prefix('theatre2')->name('theatre2.')->group(function () {
        Route::get('/', [TheatreRecordController::class, 'index'])->name('index'); // Patients In Theatre
        Route::get('/{booking}/record', [TheatreRecordController::class, 'edit'])->name('edit'); // Intra-op form
        Route::put('/{booking}', [TheatreRecordController::class, 'update'])->name('update'); // Save surgical notes
        // NEW: Diagnosis Search Route
        Route::get('/diagnosis/search', [TheatreRecordController::class, 'searchDiagnosis'])->name('diagnosis.search');
    });

    // --- theatre3: Post-Operative Care (Recovery) ---
    Route::prefix('theatre3')->name('theatre3.')->group(function () {
        Route::get('/', [TheatrePostOpController::class, 'index'])->name('index'); // Recovery Room List
        Route::get('/{booking}/care', [TheatrePostOpController::class, 'create'])->name('create'); // Vitals/Notes form
        Route::post('/{booking}', [TheatrePostOpController::class, 'store'])->name('store'); // Save Post-op data
        Route::post('/{booking}/discharge', [TheatrePostOpController::class, 'discharge'])->name('discharge'); // Send to Ward
    });

    Route::prefix('theatre4')->name('theatre4.')->group(function () {
    // The Dashboard page 
        Route::get('/', [ConsumablesDashboardController::class, 'index'])->name('consumables.index');
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

    Route::post('/bloodbank/donations/{donation}/make-available', [BbDonorController::class, 'makeAvailable'])
    ->name('makeAvailable');
});

// --- bloodbank1: Blood Inventory ---
Route::prefix('bloodbank1')->name('bloodbank1.')->group(function () {
    // List Blood Stock (Grouped by Type/Group)
    Route::get('/', [BbInventoryController::class, 'index'])->name('index');
    
    // View Individual Bags List
    Route::get('/bags', [BbInventoryController::class, 'bags'])->name('bags');
    
    // Discard / Update Status of a Bag
    Route::post('/{bag}/discard', [BbInventoryController::class, 'discard'])->name('discard');

    Route::post('/bloodbank/inventory/receive-external', [App\Http\Controllers\BloodBank\BbInventoryController::class, 'receiveExternal'])
    ->name('receiveExternal');
});


// --- bloodbank2: Crossmatching & Issuing ---
Route::prefix('bloodbank2')->name('bloodbank2.')->group(function () {
    // Queue of pending requests from Doctors
    Route::get('/', [BbCrossmatchController::class, 'index'])->name('index');
    
    // The Crossmatch/Issue Form
    Route::get('/{request}/process', [BbCrossmatchController::class, 'create'])->name('create');
    
    // Save the Crossmatch Result & Issue Bag
    Route::post('/{bbIssueRequest}', [BbCrossmatchController::class, 'store'])->name('store');
});


Route::prefix('hospital')->name('hospital.')->group(function () {
    
    // The individual feature indexes (Make sure these exist)
    Route::get('/requisitions', function() { /* ... */ })->name('requisitions.index');
    Route::get('/receipts', function() { /* ... */ })->name('receipts.index');
    Route::get('/usage', function() { /* ... */ })->name('usage.index');
    Route::get('/disposals', function() { /* ... */ })->name('disposals.index');
});






