<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
// Billing Controllers
use App\Http\Controllers\BLSItemGroupController;
use App\Http\Controllers\BLSItemController;
use App\Http\Controllers\BLSCurrencyController;
use App\Http\Controllers\BLSPaymentTypeController;
use App\Http\Controllers\BLSPriceCategoryController;
use App\Http\Controllers\BLSCustomerController;
// Expense Controllers
use App\Http\Controllers\SEXPItemGroupController;
use App\Http\Controllers\SEXPItemController;
// Inventory Controllers
use App\Http\Controllers\SIV_StoreController;
use App\Http\Controllers\SIV_ProductCategoryController;
use App\Http\Controllers\SIV_ProductController;
use App\Http\Controllers\SIV_PackagingController;
use App\Http\Controllers\SIV_AdjustmentReasonController;
use App\Http\Controllers\SPR_SupplierController;
// Account Controllers
use App\Http\Controllers\ChartOfAccountController;
use App\Http\Controllers\ChartOfAccountMappingController;
// Location Controllers
use App\Http\Controllers\LOCCountryController;
use App\Http\Controllers\LOCRegionController;
use App\Http\Controllers\LOCDistrictController;
use App\Http\Controllers\LOCWardController;
use App\Http\Controllers\LOCStreetController;
// Facility Controllers
use App\Http\Controllers\FacilityOptionController;


// systemconfiguration0: Billing Setup
Route::prefix('systemconfiguration0')->name('systemconfiguration0.')->group(function () {
    Route::get('/', function () { return Inertia::render('SystemConfiguration/BillingSetup/Index'); })->name('index');

    Route::prefix('currencies')->name('currencies.')->group(function () {
        Route::get('/', [BLSCurrencyController::class, 'index'])->name('index');
        Route::get('/create', [BLSCurrencyController::class, 'create'])->name('create');
        Route::post('/', [BLSCurrencyController::class, 'store'])->name('store');
        Route::get('/{currency}/edit', [BLSCurrencyController::class, 'edit'])->name('edit');
        Route::put('/{currency}', [BLSCurrencyController::class, 'update'])->name('update');
    });

    Route::prefix('paymenttypes')->name('paymenttypes.')->group(function () {
        Route::get('/', [BLSPaymentTypeController::class, 'index'])->name('index');
        Route::get('/create', [BLSPaymentTypeController::class, 'create'])->name('create');
        Route::post('/', [BLSPaymentTypeController::class, 'store'])->name('store');
        Route::get('/{paymenttype}/edit', [BLSPaymentTypeController::class, 'edit'])->name('edit');
        Route::put('/{paymenttype}', [BLSPaymentTypeController::class, 'update'])->name('update');
        Route::delete('/{paymenttype}', [BLSPaymentTypeController::class, 'destroy'])->name('destroy');
        Route::get('/search', [BLSPaymentTypeController::class, 'search'])->name('search');
    });

    Route::prefix('pricecategories')->name('pricecategories.')->group(function () {
        Route::get('/', [BLSPriceCategoryController::class, 'index'])->name('index');
        Route::get('/create', [BLSPriceCategoryController::class, 'create'])->name('create');
        Route::post('/', [BLSPriceCategoryController::class, 'store'])->name('store');
        Route::get('/{pricecategory}/edit', [BLSPriceCategoryController::class, 'edit'])->name('edit');
        Route::put('/{pricecategory}', [BLSPriceCategoryController::class, 'update'])->name('update');
        Route::get('/viewactive', [BLSPriceCategoryController::class, 'viewActive'])->name('viewactive'); 
    });

    Route::prefix('itemgroups')->name('itemgroups.')->group(function () {
        Route::get('/', [BLSItemGroupController::class, 'index'])->name('index'); 
        Route::get('/create', [BLSItemGroupController::class, 'create'])->name('create');
        Route::post('/', [BLSItemGroupController::class, 'store'])->name('store'); 
        Route::get('/{itemgroup}/edit', [BLSItemGroupController::class, 'edit'])->name('edit');
        Route::put('/{itemgroup}', [BLSItemGroupController::class, 'update'])->name('update');
        Route::delete('/{itemgroup}', [BLSItemGroupController::class, 'destroy'])->name('destroy');
        Route::get('/search', [BLSItemGroupController::class, 'search'])->name('search'); 
    });

    Route::prefix('items')->name('items.')->group(function () {
        Route::get('/', [BLSItemController::class, 'index'])->name('index'); 
        Route::get('/create', [BLSItemController::class, 'create'])->name('create');
        Route::post('/', [BLSItemController::class, 'store'])->name('store'); 
        Route::get('/{item}/edit', [BLSItemController::class, 'edit'])->name('edit'); 
        Route::put('/{item}', [BLSItemController::class, 'update'])->name('update'); 
        Route::get('/search', [BLSItemController::class, 'search'])->name('search'); 
        Route::delete('/{item}', [BLSItemController::class, 'destroy'])->name('destroy');
        Route::patch('/{item}/update-prices', [BLSItemController::class, 'updatePrices'])->name('update-prices');
    });

    Route::prefix('customers')->name('customers.')->group(function () {
        Route::get('/', [BLSCustomerController::class, 'index'])->name('index'); 
        Route::get('/create', [BLSCustomerController::class, 'create'])->name('create'); 
        Route::post('/', [BLSCustomerController::class, 'store'])->name('store'); 
        Route::post('/directstore', [BLSCustomerController::class, 'directstore'])->name('directstore');
        Route::get('/{customer}/edit', [BLSCustomerController::class, 'edit'])->name('edit'); 
        Route::put('/{customer}', [BLSCustomerController::class, 'update'])->name('update');
        Route::get('/search', [BLSCustomerController::class, 'search'])->name('search'); 
    });
});

// systemconfiguration1: Expense Setup
Route::prefix('systemconfiguration1')->name('systemconfiguration1.')->group(function () {
    Route::get('/', function () { return Inertia::render('SystemConfiguration/ExpensesSetup/Index'); })->name('index');

    Route::prefix('itemgroups')->name('itemgroups.')->group(function () {
        Route::get('/', [SEXPItemGroupController::class, 'index'])->name('index'); 
        Route::get('/create', [SEXPItemGroupController::class, 'create'])->name('create'); 
        Route::post('/', [SEXPItemGroupController::class, 'store'])->name('store'); 
        Route::get('/{itemgroup}/edit', [SEXPItemGroupController::class, 'edit'])->name('edit'); 
        Route::put('/{itemgroup}', [SEXPItemGroupController::class, 'update'])->name('update'); 
        Route::delete('/{itemgroup}', [SEXPItemGroupController::class, 'destroy'])->name('destroy');
        Route::get('/search', [SEXPItemGroupController::class, 'search'])->name('search'); 
    });

    Route::prefix('items')->name('items.')->group(function () {
        Route::get('/', [SEXPItemController::class, 'index'])->name('index');
        Route::get('/create', [SEXPItemController::class, 'create'])->name('create');
        Route::post('/', [SEXPItemController::class, 'store'])->name('store');
        Route::get('/{item}/edit', [SEXPItemController::class, 'edit'])->name('edit');
        Route::put('/{item}', [SEXPItemController::class, 'update'])->name('update'); 
        Route::delete('/{item}', [SEXPItemController::class, 'destroy'])->name('destroy');
        Route::get('/search', [SEXPItemController::class, 'search'])->name('search'); 
    });
});

// systemconfiguration2: Inventory Setup
Route::prefix('systemconfiguration2')->name('systemconfiguration2.')->group(function () {
    Route::get('/', function () { return Inertia::render('SystemConfiguration/InventorySetup/Index'); })->name('index');

    Route::prefix('stores')->name('stores.')->group(function () {
        Route::get('/', [SIV_StoreController::class, 'index'])->name('index'); 
        Route::get('/create', [SIV_StoreController::class, 'create'])->name('create'); 
        Route::post('/', [SIV_StoreController::class, 'store'])->name('store'); 
        Route::get('/{store}/edit', [SIV_StoreController::class, 'edit'])->name('edit'); 
        Route::put('/{store}', [SIV_StoreController::class, 'update'])->name('update'); 
        Route::delete('/{store}', [SIV_StoreController::class, 'destroy'])->name('destroy');
        Route::get('/search', [SIV_StoreController::class, 'search'])->name('search');            
    });

    Route::prefix('categories')->name('categories.')->group(function () {
        Route::get('/', [SIV_ProductCategoryController::class, 'index'])->name('index');
        Route::get('/create', [SIV_ProductCategoryController::class, 'create'])->name('create');
        Route::post('/', [SIV_ProductCategoryController::class, 'store'])->name('store');
        Route::get('/{category}/edit', [SIV_ProductCategoryController::class, 'edit'])->name('edit');
        Route::put('/{category}', [SIV_ProductCategoryController::class, 'update'])->name('update'); 
        Route::delete('/{category}', [SIV_ProductCategoryController::class, 'destroy'])->name('destroy');
        Route::get('/search', [SIV_ProductCategoryController::class, 'search'])->name('search');
    });

    Route::prefix('products')->name('products.')->group(function () {
        Route::get('/', [SIV_ProductController::class, 'index'])->name('index');
        Route::get('/create', [SIV_ProductController::class, 'create'])->name('create');
        Route::post('/', [SIV_ProductController::class, 'store'])->name('store');
        Route::get('/{product}/edit', [SIV_ProductController::class, 'edit'])->name('edit');
        Route::put('/{product}', [SIV_ProductController::class, 'update'])->name('update'); 
        Route::delete('/{product}', [SIV_ProductController::class, 'destroy'])->name('destroy');
        Route::get('/search', [SIV_ProductController::class, 'search'])->name('search');

        Route::get('/import', [SIV_ProductController::class, 'showImportForm'])->name('import.show');
        Route::post('/import', [SIV_ProductController::class, 'import'])->name('import.store');
        Route::get('/template', [SIV_ProductController::class, 'downloadTemplate'])->name('template.download');
        Route::patch('/{product}/update-price', [SIV_ProductController::class, 'updatePrice'])->name('update-price');
        Route::get('/store-all', [SIV_ProductController::class, 'getAllForStore'])->name('store-all');
    });

    Route::prefix('units')->name('units.')->group(function () {
        Route::get('/', [SIV_PackagingController::class, 'index'])->name('index');
        Route::get('/create', [SIV_PackagingController::class, 'create'])->name('create');
        Route::post('/', [SIV_PackagingController::class, 'store'])->name('store');
        Route::get('/{unit}/edit', [SIV_PackagingController::class, 'edit'])->name('edit');
        Route::put('/{unit}', [SIV_PackagingController::class, 'update'])->name('update'); 
        Route::delete('/{unit}', [SIV_PackagingController::class, 'destroy'])->name('destroy');
        Route::get('/search', [SIV_PackagingController::class, 'search'])->name('search');
    });

    Route::prefix('suppliers')->name('suppliers.')->group(function () {
        Route::get('/', [SPR_SupplierController::class, 'index'])->name('index');
        Route::get('/create', [SPR_SupplierController::class, 'create'])->name('create');
        Route::post('/', [SPR_SupplierController::class, 'store'])->name('store');
        Route::post('/directstore', [SPR_SupplierController::class, 'directstore'])->name('directstore');
        Route::get('/{supplier}/edit', [SPR_SupplierController::class, 'edit'])->name('edit');
        Route::put('/{supplier}', [SPR_SupplierController::class, 'update'])->name('update'); 
        Route::delete('/{supplier}', [SPR_SupplierController::class, 'destroy'])->name('destroy');
        Route::get('/search', [SPR_SupplierController::class, 'search'])->name('search'); 
    });

    Route::prefix('adjustmentreasons')->name('adjustmentreasons.')->group(function () {
        Route::get('/', [SIV_AdjustmentReasonController::class, 'index'])->name('index');
        Route::get('/create', [SIV_AdjustmentReasonController::class, 'create'])->name('create');
        Route::post('/', [SIV_AdjustmentReasonController::class, 'store'])->name('store');
        Route::get('/{adjustmentreason}/edit', [SIV_AdjustmentReasonController::class, 'edit'])->name('edit');
        Route::put('/{adjustmentreason}', [SIV_AdjustmentReasonController::class, 'update'])->name('update'); 
        Route::delete('/{adjustmentreason}', [SIV_AdjustmentReasonController::class, 'destroy'])->name('destroy');
        Route::get('/search', [SIV_AdjustmentReasonController::class, 'search'])->name('search');
    });
});

// systemconfiguration3: Account Setup
Route::prefix('systemconfiguration3')->name('systemconfiguration3.')->group(function () {
    Route::get('/', function () { return Inertia::render('SystemConfiguration/AccountSetup/Index'); })->name('index');

    Route::prefix('chartofaccounts')->name('chartofaccounts.')->group(function () {
        Route::get('/', [ChartOfAccountController::class, 'index'])->name('index');
        Route::get('/create', [ChartOfAccountController::class, 'create'])->name('create');
        Route::post('/', [ChartOfAccountController::class, 'store'])->name('store');
        Route::get('/{chartofaccount}/edit', [ChartOfAccountController::class, 'edit'])->name('edit');
        Route::put('/{chartofaccount}', [ChartOfAccountController::class, 'update'])->name('update'); 
        Route::delete('/{chartofaccount}', [ChartOfAccountController::class, 'destroy'])->name('destroy');
        Route::get('/search', [ChartOfAccountController::class, 'search'])->name('search');
    });   

    Route::prefix('chartofaccountmappings')->name('chartofaccountmappings.')->group(function () {
        Route::get('/', [ChartOfAccountMappingController::class, 'index'])->name('index');
        Route::get('/create', [ChartOfAccountMappingController::class, 'create'])->name('create');
        Route::post('/', [ChartOfAccountMappingController::class, 'store'])->name('store');
        Route::get('/edit', [ChartOfAccountMappingController::class, 'edit'])->name('edit');
        Route::put('/', [ChartOfAccountMappingController::class, 'update'])->name('update'); 
    }); 
});

// systemconfiguration4: Location Setup
Route::prefix('systemconfiguration4')->name('systemconfiguration4.')->group(function () {
    Route::get('/', function () { return Inertia::render('SystemConfiguration/LocationSetup/Index'); })->name('index');

    Route::prefix('countries')->name('countries.')->group(function () {
        Route::get('/', [LOCCountryController::class, 'index'])->name('index'); 
        Route::get('/create', [LOCCountryController::class, 'create'])->name('create'); 
        Route::post('/', [LOCCountryController::class, 'store'])->name('store'); 
        Route::get('/{country}/edit', [LOCCountryController::class, 'edit'])->name('edit'); 
        Route::put('/{country}', [LOCCountryController::class, 'update'])->name('update'); 
        Route::delete('/{country}', [LOCCountryController::class, 'destroy'])->name('destroy');
        Route::get('/search', [LOCCountryController::class, 'search'])->name('search'); 
    });

    Route::prefix('regions')->name('regions.')->group(function () {
        Route::get('/', [LOCRegionController::class, 'index'])->name('index');
        Route::get('/create', [LOCRegionController::class, 'create'])->name('create');
        Route::post('/', [LOCRegionController::class, 'store'])->name('store');
        Route::get('/{region}/edit', [LOCRegionController::class, 'edit'])->name('edit');
        Route::put('/{region}', [LOCRegionController::class, 'update'])->name('update'); 
        Route::delete('/{region}', [LOCRegionController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('districts')->name('districts.')->group(function () {
        Route::get('/', [LOCDistrictController::class, 'index'])->name('index');
        Route::get('/create', [LOCDistrictController::class, 'create'])->name('create');
        Route::post('/', [LOCDistrictController::class, 'store'])->name('store');
        Route::get('/{district}/edit', [LOCDistrictController::class, 'edit'])->name('edit');
        Route::put('/{district}', [LOCDistrictController::class, 'update'])->name('update'); 
        Route::delete('/{district}', [LOCDistrictController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('wards')->name('wards.')->group(function () {
        Route::get('/', [LOCWardController::class, 'index'])->name('index');
        Route::get('/create', [LOCWardController::class, 'create'])->name('create');
        Route::post('/', [LOCWardController::class, 'store'])->name('store');
        Route::get('/{ward}/edit', [LOCWardController::class, 'edit'])->name('edit');
        Route::put('/{ward}', [LOCWardController::class, 'update'])->name('update'); 
        Route::delete('/{ward}', [LOCWardController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('streets')->name('streets.')->group(function () {
        Route::get('/', [LOCStreetController::class, 'index'])->name('index');
        Route::get('/create', [LOCStreetController::class, 'create'])->name('create');
        Route::post('/', [LOCStreetController::class, 'store'])->name('store');
        Route::get('/{street}/edit', [LOCStreetController::class, 'edit'])->name('edit');
        Route::put('/{street}', [LOCStreetController::class, 'update'])->name('update'); 
        Route::delete('/{street}', [LOCStreetController::class, 'destroy'])->name('destroy');
    });   
});

// systemconfiguration5: Facility Setup
Route::prefix('systemconfiguration5')->name('systemconfiguration5.')->group(function () {
    Route::get('/', function () { return Inertia::render('SystemConfiguration/FacilitySetup/Index'); })->name('index');

    Route::prefix('facilityoptions')->name('facilityoptions.')->group(function () {
        Route::get('/', [FacilityOptionController::class, 'index'])->name('index');
        Route::get('/create', [FacilityOptionController::class, 'create'])->name('create');
        Route::post('/', [FacilityOptionController::class, 'store'])->name('store');
        Route::get('/{facilityoption}/edit', [FacilityOptionController::class, 'edit'])->name('edit');
        Route::put('/{facilityoption}', [FacilityOptionController::class, 'update'])->name('update'); 
        Route::delete('/{facilityoption}', [FacilityOptionController::class, 'destroy'])->name('destroy');
        Route::get('/search', [FacilityOptionController::class, 'search'])->name('search');
    });   
});

// Extra: Human Resource / Fixed Assets Hubs
Route::prefix('humanresource')->name('humanresource.')->group(function () {
    Route::get('/', function () { return Inertia::render('ModulesHub/HumanResource/Index'); })->name('index');
}); 

Route::prefix('fixedassets')->name('fixedassets.')->group(function () {
    Route::get('/', function () { return Inertia::render('ModulesHub/FixedAssets/Index'); })->name('index');
});

// ... existing configuration routes ...

// systemconfiguration6: Laboratory Setup
Route::prefix('systemconfiguration6')->name('systemconfiguration6.')->group(function () {
    
    // Main Dashboard
    Route::get('/', function () { 
        return Inertia::render('SystemConfiguration/LabSetup/Index'); 
    })->name('index');

    // 1. Nature of Samples
    Route::prefix('samples')->name('samples.')->group(function () {
        Route::get('/', [App\Http\Controllers\Laboratory\LabNatureOfSampleController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\Laboratory\LabNatureOfSampleController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\Laboratory\LabNatureOfSampleController::class, 'store'])->name('store');
        Route::get('/{sample}/edit', [App\Http\Controllers\Laboratory\LabNatureOfSampleController::class, 'edit'])->name('edit');
        Route::put('/{sample}', [App\Http\Controllers\Laboratory\LabNatureOfSampleController::class, 'update'])->name('update');
        Route::delete('/{sample}', [App\Http\Controllers\Laboratory\LabNatureOfSampleController::class, 'destroy'])->name('destroy');
    });

    // 2. Rejection Reasons
    Route::prefix('rejections')->name('rejections.')->group(function () {
        Route::get('/', [App\Http\Controllers\Laboratory\LabRejectionReasonController::class, 'index'])->name('index');
        Route::post('/', [App\Http\Controllers\Laboratory\LabRejectionReasonController::class, 'store'])->name('store');
        // Add other CRUD routes similarly...
    });

    // 3. Lab Categories (Departments)
    Route::prefix('categories')->name('categories.')->group(function () {
        Route::get('/', [App\Http\Controllers\Laboratory\LabCategoryController::class, 'index'])->name('index');
        Route::post('/', [App\Http\Controllers\Laboratory\LabCategoryController::class, 'store'])->name('store');
        // ...
    });

    // 4. Lab Panels (Orderable Tests)
    Route::prefix('panels')->name('panels.')->group(function () {
        Route::get('/', [App\Http\Controllers\Laboratory\LabPanelController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\Laboratory\LabPanelController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\Laboratory\LabPanelController::class, 'store'])->name('store');
        // ...
    });

    // 5. Lab Parameters (Result Fields)
    Route::prefix('parameters')->name('parameters.')->group(function () {
        Route::get('/', [App\Http\Controllers\Laboratory\LabTestParameterController::class, 'index'])->name('index');
        // ...
    });
});