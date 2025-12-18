<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Expenses\ExpPostController;
use App\Http\Controllers\Expenses\ExpApprovalController;
use App\Http\Controllers\Expenses\ExpHistoryController;

// Main Hub
Route::prefix('expenses')->name('expenses.')->group(function () {
    Route::get('/', function () { return Inertia::render('ModulesHub/Expenses/Index'); })->name('index');
});

// expenses0: Post
Route::prefix('expenses0')->name('expenses0.')->group(function () {
    Route::get('/', [ExpPostController::class, 'index'])->name('index');
    Route::get('/create', [ExpPostController::class, 'create'])->name('create');
    Route::post('/', [ExpPostController::class, 'store'])->name('store');
    Route::get('/{post}/edit', [ExpPostController::class, 'edit'])->name('edit');
    Route::put('/{post}', [ExpPostController::class, 'update'])->name('update');
    Route::delete('/{post}', [ExpPostController::class, 'destroy'])->name('destroy');
});

// expenses1: Approval
Route::prefix('expenses1')->name('expenses1.')->group(function () {   
    Route::get('/', [ExpApprovalController::class, 'index'])->name('index');
    Route::get('/{approval}/edit', [ExpApprovalController::class, 'edit'])->name('edit');
    Route::put('/{approval}', [ExpApprovalController::class, 'update'])->name('update');
    Route::delete('/{approval}', [ExpApprovalController::class, 'destroy'])->name('destroy');
});

// expenses2: History   
Route::prefix('expenses2')->name('expenses2.')->group(function () {   
    Route::get('/', [ExpHistoryController::class, 'index'])->name('index');
    Route::get('/{history}/edit', [ExpHistoryController::class, 'edit'])->name('edit');        
});