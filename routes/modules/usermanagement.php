<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserGroupController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserPermissionController;
use App\Http\Controllers\UserGroupPrinterController;

Route::prefix('usermanagement')->name('usermanagement.')->group(function () {

    Route::get('/', function () { return Inertia::render('UserManagement/Index'); })->name('index');

    Route::prefix('usergroups')->name('usergroups.')->group(function () {
        Route::get('/', [UserGroupController::class, 'index'])->name('index');
        Route::get('/create', [UserGroupController::class, 'create'])->name('create');
        Route::post('/', [UserGroupController::class, 'store'])->name('store');
        Route::get('/{usergroup}/edit', [UserGroupController::class, 'edit'])->name('edit');
        Route::put('/{usergroup}', [UserGroupController::class, 'update'])->name('update'); 
        Route::delete('/{usergroup}', [UserGroupController::class, 'destroy'])->name('destroy');
        Route::get('/search', [UserGroupController::class, 'search'])->name('search');
    });   

    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::get('/create', [UserController::class, 'create'])->name('create');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::get('/{user}/edit', [UserController::class, 'edit'])->name('edit');
        Route::put('/{user}', [UserController::class, 'update'])->name('update');           
        Route::post('/{user}/resetPassword', [UserController::class, 'resetPassword'])->name('resetPassword');
        Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy');
    });  
    
    Route::prefix('userpermission')->name('userpermission.')->group(function () {
        Route::get('/', [UserPermissionController::class, 'index'])->name('index');         
        Route::get('/{userGroup}/permissions', [UserPermissionController::class, 'getPermissions'])->name('getPermissions');
        Route::post('/{userGroup}/permissions', [UserPermissionController::class, 'storePermissions'])->name('storePermissions');
        Route::get('/modules-and-items', [UserPermissionController::class, 'getModulesAndItems'])->name('modulesAndItems');
    });   

    Route::prefix('usergroupprinters')->name('usergroupprinters.')->group(function () {
        Route::get('/', [UserGroupPrinterController::class, 'index'])->name('index');
        Route::get('/create', [UserGroupPrinterController::class, 'create'])->name('create');
        Route::post('/', [UserGroupPrinterController::class, 'store'])->name('store');
        Route::get('/{usergroupprinter}/edit', [UserGroupPrinterController::class, 'edit'])->name('edit');
        Route::put('/{usergroupprinter}', [UserGroupPrinterController::class, 'update'])->name('update');
        Route::delete('/{usergroupprinter}', [UserGroupPrinterController::class, 'destroy'])->name('destroy');
    });
});