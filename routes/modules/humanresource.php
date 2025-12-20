<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Employee Controllers
use App\Http\Controllers\HumanResource\Employee\HrmEmployeeController;
use App\Http\Controllers\HumanResource\Employee\HrmEmployeeContactController;
use App\Http\Controllers\HumanResource\Employee\HrmEmployeeJobController;
use App\Http\Controllers\HumanResource\Employee\HrmEmployeeBankingController;

// Attendance Controllers
use App\Http\Controllers\HumanResource\Attendance\HrmAttendanceController;

// Loan Controllers
use App\Http\Controllers\HumanResource\Loan\PayEmployeeLoanController;

// Payroll Controllers
use App\Http\Controllers\HumanResource\Payroll\PayPayrollController;
use App\Http\Controllers\HumanResource\Payroll\PaySlipController;

// Leave Controllers
use App\Http\Controllers\HumanResource\Leave\HrmLeaveRequestController;

// -----------------------------------------------------------------------------
// MAIN HUB
// -----------------------------------------------------------------------------
Route::prefix('humanresource')->name('humanresource.')->group(function () {
    Route::get('/', function () { 
        return Inertia::render('ModulesHub/HumanResource/Index'); 
    })->name('index');
});

// -----------------------------------------------------------------------------
// MODULE 0: EMPLOYEE RECORDS (humanresurces0)
// -----------------------------------------------------------------------------
Route::prefix('humanresurces0')->name('humanresurces0.')->group(function () {
    
    // 1. Employee Bio Data (Main CRUD)
    Route::get('/', [HrmEmployeeController::class, 'index'])->name('index');
    Route::get('/create', [HrmEmployeeController::class, 'create'])->name('create');
    Route::post('/', [HrmEmployeeController::class, 'store'])->name('store');
    Route::get('/{employee}/edit', [HrmEmployeeController::class, 'edit'])->name('edit');
    Route::put('/{employee}', [HrmEmployeeController::class, 'update'])->name('update');
    Route::delete('/{employee}', [HrmEmployeeController::class, 'destroy'])->name('destroy');
    Route::get('/search', [HrmEmployeeController::class, 'search'])->name('search');

    // 2. Job Details Management (Nested)
    Route::prefix('{employee}/jobs')->name('jobs.')->group(function () {
        Route::post('/', [HrmEmployeeJobController::class, 'store'])->name('store');
        Route::put('/{job}', [HrmEmployeeJobController::class, 'update'])->name('update');
    });

    // 3. Banking Details (Nested)
    Route::prefix('{employee}/banking')->name('banking.')->group(function () {
        Route::post('/', [HrmEmployeeBankingController::class, 'store'])->name('store');
        Route::put('/{banking}', [HrmEmployeeBankingController::class, 'update'])->name('update');
    });

    // 4. Contacts / Next of Kin (Nested)
    Route::prefix('{employee}/contacts')->name('contacts.')->group(function () {
        Route::post('/', [HrmEmployeeContactController::class, 'store'])->name('store');
        Route::delete('/{contact}', [HrmEmployeeContactController::class, 'destroy'])->name('destroy');
    });
});

// -----------------------------------------------------------------------------
// MODULE 1: ATTENDANCE (humanresurces1)
// -----------------------------------------------------------------------------
Route::prefix('humanresurces1')->name('humanresurces1.')->group(function () {
    Route::get('/', [HrmAttendanceController::class, 'index'])->name('index');
    
    // Manual Entry by Admin
    Route::get('/create', [HrmAttendanceController::class, 'create'])->name('create');
    Route::post('/', [HrmAttendanceController::class, 'store'])->name('store');
    
    // Bulk Actions / Upload
    Route::get('/import', [HrmAttendanceController::class, 'showImportForm'])->name('import.show');
    Route::post('/import', [HrmAttendanceController::class, 'import'])->name('import.store');
    
    // Clock In/Out Actions (If using system time)
    Route::post('/clock-in', [HrmAttendanceController::class, 'clockIn'])->name('clock_in');
    Route::post('/clock-out', [HrmAttendanceController::class, 'clockOut'])->name('clock_out');
});

// -----------------------------------------------------------------------------
// MODULE 2: LOANS & ADVANCES (humanresurces2)
// -----------------------------------------------------------------------------
Route::prefix('humanresurces2')->name('humanresurces2.')->group(function () {
    Route::get('/', [PayEmployeeLoanController::class, 'index'])->name('index');
    Route::get('/create', [PayEmployeeLoanController::class, 'create'])->name('create');
    Route::post('/', [PayEmployeeLoanController::class, 'store'])->name('store');
    Route::get('/{loan}/edit', [PayEmployeeLoanController::class, 'edit'])->name('edit');
    Route::put('/{loan}', [PayEmployeeLoanController::class, 'update'])->name('update');
    Route::delete('/{loan}', [PayEmployeeLoanController::class, 'destroy'])->name('destroy');
    
    // Loan Repayment / Tracking
    Route::get('/{loan}/schedule', [PayEmployeeLoanController::class, 'viewSchedule'])->name('schedule');
    Route::post('/{loan}/stop', [PayEmployeeLoanController::class, 'stopDeduction'])->name('stop');
});

// -----------------------------------------------------------------------------
// MODULE 3: PAYROLL PROCESSING (humanresurces3)
// -----------------------------------------------------------------------------
Route::prefix('humanresurces3')->name('humanresurces3.')->group(function () {
    
    // 1. Payroll Periods
    Route::get('/', [PayPayrollController::class, 'index'])->name('index');
    Route::get('/create', [PayPayrollController::class, 'create'])->name('create');
    Route::post('/', [PayPayrollController::class, 'store'])->name('store');
    
    // 2. Processing Actions
    Route::get('/{period}/manage', [PayPayrollController::class, 'manage'])->name('manage'); // View details
    Route::post('/{period}/generate', [PayPayrollController::class, 'generatePayslips'])->name('generate'); // Run Calc
    Route::post('/{period}/approve', [PayPayrollController::class, 'approve'])->name('approve'); // Lock
    Route::post('/{period}/pay', [PayPayrollController::class, 'markAsPaid'])->name('pay'); // Disburse
    
    // 3. Payroll Reports for specific period
    Route::get('/{period}/bank-file', [PayPayrollController::class, 'exportBankFile'])->name('export.bank');
    Route::get('/{period}/tax-report', [PayPayrollController::class, 'exportTaxReport'])->name('export.tax');
});

// -----------------------------------------------------------------------------
// MODULE 4: PAYSLIPS (humanresurces4)
// -----------------------------------------------------------------------------
Route::prefix('humanresurces4')->name('humanresurces4.')->group(function () {
    Route::get('/', [PaySlipController::class, 'index'])->name('index'); // Employee personal view or Admin list
    Route::get('/{slip}', [PaySlipController::class, 'show'])->name('show');
    Route::get('/{slip}/print', [PaySlipController::class, 'print'])->name('print');
    Route::get('/{slip}/email', [PaySlipController::class, 'email'])->name('email');
});

// -----------------------------------------------------------------------------
// MODULE 5: LEAVE MANAGEMENT (humanresurces5)
// -----------------------------------------------------------------------------
Route::prefix('humanresurces5')->name('humanresurces5.')->group(function () {   

    Route::get('/', [HrmLeaveRequestController::class, 'index'])->name('index');
    Route::get('/create', [HrmLeaveRequestController::class, 'create'])->name('create');
    Route::post('/', [HrmLeaveRequestController::class, 'store'])->name('store');
    
    Route::get('/{leave}/edit', [HrmLeaveRequestController::class, 'edit'])->name('edit');
    Route::put('/{leave}', [HrmLeaveRequestController::class, 'update'])->name('update');
    Route::delete('/{leave}', [HrmLeaveRequestController::class, 'destroy'])->name('destroy');

    // Approval Actions
    Route::post('/{leave}/approve', [HrmLeaveRequestController::class, 'approve'])->name('approve');
    Route::post('/{leave}/reject', [HrmLeaveRequestController::class, 'reject'])->name('reject');
});