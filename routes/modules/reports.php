<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Reports\SalesBillingController;
use App\Http\Controllers\Reports\SalesReportsController;
use App\Http\Controllers\Reports\ProcurementReportsController;
use App\Http\Controllers\Reports\InventoryReportsController;
use App\Http\Controllers\Reports\HumanResourceReportsController;

// --- Reporting Hubs (reporting0 - reporting7) ---

// reporting0: Sales
Route::prefix('reporting0')->name('reporting0.')->group(function () {
    Route::get('/', function () { return Inertia::render('Reports/Sales/Index'); })->name('index');
}); 

// reporting1: Procurement
Route::prefix('reporting1')->name('reporting1.')->group(function () {
    Route::get('/', function () { return Inertia::render('Reports/Procurement/Index'); })->name('index');
}); 

// reporting2: Inventory
Route::prefix('reporting2')->name('reporting2.')->group(function () {
    Route::get('/', function () { return Inertia::render('Reports/Inventory/Index'); })->name('index');
}); 

// reporting3: Material Conversion
Route::prefix('reporting3')->name('reporting3.')->group(function () {
    Route::get('/', function () { return Inertia::render('Reports/MaterialConversion/Index'); })->name('index');
}); 

// reporting4: Expenses
Route::prefix('reporting4')->name('reporting4.')->group(function () {
    Route::get('/', function () { return Inertia::render('Reports/Expenses/Index'); })->name('index');
}); 

// reporting5: HR
Route::prefix('reporting5')->name('reporting5.')->group(function () {
    Route::get('/', function () { return Inertia::render('Reports/HumanResource/Index'); })->name('index');
}); 

// reporting6: Fixed Assets
Route::prefix('reporting6')->name('reporting6.')->group(function () {
    Route::get('/', function () { return Inertia::render('Reports/FixedAssets/Index'); })->name('index');
}); 

// reporting7: Accounting
Route::prefix('reporting7')->name('reporting7.')->group(function () {
    Route::get('/', function () { return Inertia::render('Reports/Accounting/Index'); })->name('index');
}); 


// --- Report Data Routes ---

Route::prefix('reports')->name('reports.')->group(function () {
    Route::get('/sales/daily', [SalesReportsController::class, 'daily'])->name('sales.daily');
    Route::get('/sales/summary', [SalesReportsController::class, 'summary'])->name('sales.summary');        
    Route::get('/sales/cashiersession', [SalesReportsController::class, 'cashierSession'])->name('sales.cashiersession');
    Route::get('/sales/by-item', [SalesReportsController::class, 'salesByItem'])->name('sales.by_item');
    Route::get('/payments/methods', [SalesReportsController::class, 'paymentMethods'])->name('payments.methods');        
    Route::get('/customer/history', [SalesReportsController::class, 'customerHistory'])->name('customer.history');
    Route::get('/eod/summary', [SalesReportsController::class, 'eodSummary'])->name('eod.summary');
    Route::get('/custom/builder', [SalesReportsController::class, 'customBuilder'])->name('custom.builder');

    Route::prefix('procurement')->name('procurement.')->group(function () {
        Route::get('/po-history', [ProcurementReportsController::class, 'purchaseOrderHistory'])->name('po_history');
        Route::get('/supplier-performance', [ProcurementReportsController::class, 'supplierPerformance'])->name('supplier_performance');
        Route::get('/item-history', [ProcurementReportsController::class, 'itemPurchaseHistory'])->name('item_history');
        Route::get('/spend-analysis', [ProcurementReportsController::class, 'spendAnalysis'])->name('spend_analysis');
        Route::get('/grn-summary', [ProcurementReportsController::class, 'grnSummary'])->name('grn_summary');
        Route::get('/invoice-payment', [ProcurementReportsController::class, 'invoicePaymentReport'])->name('invoice_payment');
        Route::get('/cycle-time', [ProcurementReportsController::class, 'cycleTimeReport'])->name('cycle_time');
        Route::match(['get', 'post'], '/custom', [ProcurementReportsController::class, 'customProcurementReport'])->name('custom');
    });

    Route::prefix('inventory')->name('inventory.')->group(function () {
        Route::get('/stock-on-hand', [InventoryReportsController::class, 'stockOnHand'])->name('stock_on_hand');
        Route::get('/valuation', [InventoryReportsController::class, 'valuation'])->name('valuation');
        Route::get('/movement-history', [InventoryReportsController::class, 'movementHistory'])->name('movement_history');
        Route::get('/ageing', [InventoryReportsController::class, 'ageing'])->name('ageing');
        Route::get('/reorder', [InventoryReportsController::class, 'reorderLevel'])->name('reorder');
        Route::get('/expiring-items', [InventoryReportsController::class, 'expiringItems'])->name('expiring_items');
        Route::get('/slow-moving', [InventoryReportsController::class, 'slowMoving'])->name('slow_moving');
        Route::match(['get', 'post'],'/custom', [InventoryReportsController::class, 'customInventoryReport'])->name('custom');
        Route::get('/product-list', [InventoryReportsController::class, 'productList'])->name('product-list');
        Route::get('/product-list/export-pdf', [InventoryReportsController::class, 'exportProductListPdf'])->name('product-list.pdf');
        Route::get('/product-list/export-excel', [InventoryReportsController::class, 'exportProductListExcel'])->name('product-list.excel');
    });
   
    Route::prefix('hr')->name('hr.')->group(function () {
        Route::get('/employee-list', [HumanResourceReportsController::class, 'employeeList'])->name('employee_list');
        Route::get('/payroll-summary', [HumanResourceReportsController::class, 'payrollSummary'])->name('payroll_summary');
        Route::get('/leave-report', [HumanResourceReportsController::class, 'leaveReport'])->name('leave_balances');
        Route::get('/attendance-summary', [HumanResourceReportsController::class, 'attendanceSummary'])->name('attendance_summary');
        
        // Stubs for future implementation if needed
        Route::get('/turnover', function() { return back(); })->name('turnover');
        Route::get('/recruitment', function() { return back(); })->name('recruitment_pipeline');
        Route::get('/demographics', function() { return back(); })->name('demographics');
        Route::get('/custom', function() { return back(); })->name('custom');
    });
});