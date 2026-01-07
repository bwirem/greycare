<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Billing\BilOrderController;
use App\Http\Controllers\Billing\BilPostController;
use App\Http\Controllers\Billing\BilPayController;
use App\Http\Controllers\Billing\BilSalesHistoryController;
use App\Http\Controllers\Billing\BilRepaymentHistoryController;
use App\Http\Controllers\Billing\BilVoidHistoryController;

// Main Hub
Route::prefix('billing')->name('billing.')->group(function () {
    Route::get('/', function () { return Inertia::render('ModulesHub/Sales/Index'); })->name('index');
});

// billing0: Order routes
Route::prefix('billing0')->name('billing0.')->group(function () {
    Route::get('/', [BilOrderController::class, 'index'])->name('index');
    Route::get('/create', [BilOrderController::class, 'create'])->name('create');
    Route::post('/', [BilOrderController::class, 'store'])->name('store');
    Route::get('/{order}/edit', [BilOrderController::class, 'edit'])->name('edit');
    Route::put('/{order}', [BilOrderController::class, 'update'])->name('update');
    Route::delete('/{order}', [BilOrderController::class, 'destroy'])->name('destroy');
});

// billing1: Post Bills routes
Route::prefix('billing1')->name('billing1.')->group(function () {
    Route::get('/', [BilPostController::class, 'index'])->name('index');
    Route::get('/create', [BilPostController::class, 'create'])->name('create');
    Route::get('/{order}/edit', [BilPostController::class, 'edit'])->name('edit');

    // Confirmation Routes
    Route::post('/confirm-save', [BilPostController::class, 'confirmSave'])->name('confirmSave');
    Route::post('/confirm-payment', [BilPostController::class, 'confirmPayment'])->name('confirmPayment');
    Route::get('/confirm-save', [BilPostController::class, 'create'])->name('confirm.save');
    Route::get('/confirm-payment', [BilPostController::class, 'create'])->name('confirm.payment');

    Route::post('/confirm-update/{order}', [BilPostController::class, 'confirmUpdate'])->name('confirmUpdate');
    Route::post('/confirm-existing-payment/{order}', [BilPostController::class, 'confirmExistingPayment'])->name('confirmExistingPayment');
    Route::get('/confirm-update/{order}', [BilPostController::class, 'edit'])->name('confirm.update');
    Route::get('/confirm-existing-payment/{order}', [BilPostController::class, 'edit'])->name('confirm.existing.payment');

    Route::post('/', [BilPostController::class, 'store'])->name('store');        
    Route::put('/{order}', [BilPostController::class, 'update'])->name('update');
    Route::delete('/{order}', [BilPostController::class, 'destroy'])->name('destroy');

    // Payment Handling
    Route::post('/pay', [BilPostController::class, 'processPayment'])->name('pay');
    Route::put('/pay/{order}', [BilPostController::class, 'processPayment'])->name('pay_update');

    Route::get('/invoice-preview', [BilPostController::class, 'invoicePreview'])->name('invoice_preview');

    Route::get('/api/pending-bills', [BilPostController::class, 'getPendingBills'])->name('api.pending');
});

// billing2: Pay Bills routes
Route::prefix('billing2')->name('billing2.')->group(function () {
    Route::get('/', [BilPayController::class, 'index'])->name('index');        
    Route::get('/{debtor}/edit', [BilPayController::class, 'edit'])->name('edit');
    Route::post('/pay', [BilPayController::class, 'pay'])->name('pay');
    Route::put('/pay/{debtor}', [BilPayController::class, 'pay'])->name('pay_update');
    // --- ADD THIS LINE ---
    Route::get('/receipt-preview', [BilPayController::class, 'receiptPreview'])->name('receipt_preview');
});

// billing3: Sales History
Route::prefix('billing3')->name('billing3.')->group(function () {
    Route::get('/', [BilSalesHistoryController::class, 'saleHistory'])->name('salehistory'); 
    Route::get('/{sale}/preview', [BilSalesHistoryController::class, 'previewSale'])->name('preview');
    Route::put('/{sale}', [BilSalesHistoryController::class, 'postVoidSale'])->name('voidsale');  
    Route::get('/{sale}/print-invoice', [BilSalesHistoryController::class, 'printInvoice'])->name('print.invoice');
    Route::get('/{sale}/print-delivery', [BilSalesHistoryController::class, 'printDeliveryNote'])->name('print.delivery');
});

// billing4: Repayment History
Route::prefix('billing4')->name('billing4.')->group(function () {
    Route::get('/', [BilRepaymentHistoryController::class, 'repaymentHistory'])->name('repaymenthistory'); 
    Route::get('/{repayment}/preview', [BilRepaymentHistoryController::class, 'previewRepayment'])->name('preview');
    Route::put('/repayments/{repayment}/void', [BilRepaymentHistoryController::class, 'postVoidRepayment'])->name('void');
});

// billing5: Void History
Route::prefix('billing5')->name('billing5.')->group(function () {
    Route::get('/', [BilVoidHistoryController::class, 'voidHistory'])->name('voidsalehistory'); 
    Route::get('/{voidsale}/preview', [BilVoidHistoryController::class, 'previewVoid'])->name('preview');
    Route::get('/refunds/{voidsale}/create', [BilVoidHistoryController::class, 'createRefund'])->name('refund.create');  
    Route::post('/refunds/{voidsale}/store', [BilVoidHistoryController::class, 'storeRefund'])->name('refund.store');      
});