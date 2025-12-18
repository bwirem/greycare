<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Accounting\ACCMakePaymentController;
use App\Http\Controllers\Accounting\ACCReceivePaymentController;
use App\Http\Controllers\Accounting\ACCJournalEntryController;

// Main Hub
Route::prefix('accounting')->name('accounting.')->group(function () {
    Route::get('/', function () { return Inertia::render('ModulesHub/Accounting/Index'); })->name('index');
});

// accounting0: Receive Payment
Route::prefix('accounting0')->name('accounting0.')->group(function () {
    Route::get('/', [ACCReceivePaymentController::class, 'index'])->name('index');
    Route::get('/create', [ACCReceivePaymentController::class, 'create'])->name('create');
    Route::post('/', [ACCReceivePaymentController::class, 'store'])->name('store');
    Route::get('/{payment}', [ACCReceivePaymentController::class, 'show'])->name('show');
    Route::get('/{payment}/edit', [ACCReceivePaymentController::class, 'edit'])->name('edit');
    Route::put('/{payment}', [ACCReceivePaymentController::class, 'update'])->name('update');
    Route::delete('/{payment}', [ACCReceivePaymentController::class, 'destroy'])->name('destroy');
    
    Route::get('/search/payers', [ACCReceivePaymentController::class, 'searchPayers'])->name('search.payers');
    Route::get('/search/receivables', [ACCReceivePaymentController::class, 'searchReceivables'])->name('search.receivables');
});

// accounting1: Make Payment
Route::prefix('accounting1')->name('accounting1.')->group(function () {
    Route::get('/', [ACCMakePaymentController::class, 'index'])->name('index');
    Route::get('/create', [ACCMakePaymentController::class, 'create'])->name('create');
    Route::post('/', [ACCMakePaymentController::class, 'store'])->name('store');
    Route::get('/{payment}', [ACCMakePaymentController::class, 'show'])->name('show');
    Route::get('/{payment}/edit', [ACCMakePaymentController::class, 'edit'])->name('edit');
    Route::put('/{payment}', [ACCMakePaymentController::class, 'update'])->name('update');
    Route::delete('/{payment}', [ACCMakePaymentController::class, 'destroy'])->name('destroy');

    Route::get('/{payment}/approve-confirm', [ACCMakePaymentController::class, 'showApproveConfirm'])->name('approve.confirm');
    Route::get('/{payment}/pay-confirm', [ACCMakePaymentController::class, 'showPayConfirm'])->name('pay.confirm');
    Route::patch('/{payment}/approve', [ACCMakePaymentController::class, 'approve'])->name('approve');
    Route::patch('/{payment}/pay', [ACCMakePaymentController::class, 'pay'])->name('pay');
    
    Route::get('/search/recipients', [ACCMakePaymentController::class, 'searchRecipients'])->name('search.recipients');
    Route::get('/search/payables', [ACCMakePaymentController::class, 'searchPayables'])->name('search.payables');
});

// accounting2: Journal Entry
Route::prefix('accounting2')->name('accounting2.')->group(function () {
    Route::get('/', [ACCJournalEntryController::class, 'index'])->name('index');
    Route::get('/create', [ACCJournalEntryController::class, 'create'])->name('create');
    Route::post('/', [ACCJournalEntryController::class, 'store'])->name('store');
    Route::get('/{journalEntry}/edit', [ACCJournalEntryController::class, 'edit'])->name('edit');
    Route::put('/{journalEntry}', [ACCJournalEntryController::class, 'update'])->name('update');
    Route::delete('/{journalEntry}', [ACCJournalEntryController::class, 'destroy'])->name('destroy');
    Route::get('/search/accounts', [ACCJournalEntryController::class, 'searchAccounts'])->name('search.accounts');
});