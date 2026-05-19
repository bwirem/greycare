<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
// Billing Controllers
use App\Http\Controllers\Billing\BLSItemGroupController;
use App\Http\Controllers\Billing\BLSItemController;
use App\Http\Controllers\Billing\BLSCurrencyController;
use App\Http\Controllers\Billing\BLSPaymentTypeController;
use App\Http\Controllers\Billing\BLSPriceCategoryController;
use App\Http\Controllers\Billing\BLSCustomerController;
// Expense Controllers
use App\Http\Controllers\Expenses\SEXPItemGroupController;
use App\Http\Controllers\Expenses\SEXPItemController;
// Inventory Controllers
use App\Http\Controllers\Inventory\SIV_StoreController;
use App\Http\Controllers\Inventory\SIV_ProductCategoryController;
use App\Http\Controllers\Inventory\SIV_ProductController;
use App\Http\Controllers\Inventory\SIV_PackagingController;
use App\Http\Controllers\Inventory\SIV_AdjustmentReasonController;
use App\Http\Controllers\Inventory\SPR_SupplierController;
// Account Controllers
use App\Http\Controllers\Accounting\ChartOfAccountController;
use App\Http\Controllers\Accounting\ChartOfAccountMappingController;
// Location Controllers
use App\Http\Controllers\Facility\LOCCountryController;
use App\Http\Controllers\Facility\LOCRegionController;
use App\Http\Controllers\Facility\LOCDistrictController;
use App\Http\Controllers\Facility\LOCWardController;
use App\Http\Controllers\Facility\LOCStreetController;
// Facility Controllers
use App\Http\Controllers\Facility\FacilityOptionController;

use App\Http\Controllers\System\FacilityController;

// Diagnosis Controllers
use App\Http\Controllers\Diagnosis\DxtDiagnosesGroupController;
use App\Http\Controllers\Diagnosis\DxtDiagnosesIcdController;
use App\Http\Controllers\Diagnosis\MtuhaDiagnosesController;

// Laboratory Controllers
use App\Http\Controllers\Laboratory\LabNatureOfSampleController;
use App\Http\Controllers\Laboratory\LabRejectionReasonController;
use App\Http\Controllers\Laboratory\LabCategoryController;
use App\Http\Controllers\Laboratory\LabPanelController;
use App\Http\Controllers\Laboratory\LabTestParameterController;

// Radiology Controllers
use App\Http\Controllers\Radiology\RadModalityController;       
use App\Http\Controllers\Radiology\RadProcedureController;

// Pharmacy Controllers
use App\Http\Controllers\Pharmacy\PharmacySetupController;
use App\Http\Controllers\Pharmacy\PharmacyFrequencyController;
use App\Http\Controllers\Pharmacy\PharmacyDrugMasterController;
use App\Http\Controllers\Pharmacy\PharmacyDurationController;
use App\Http\Controllers\Pharmacy\PharmacyRouteController;


// OPD Controllers
use App\Http\Controllers\Hospital\Patient\PatientBillingGroupController;
use App\Http\Controllers\Hospital\Patient\PatientBillingSubgroupController;
use App\Http\Controllers\Hospital\Opd\OpdTreatmentPointController;
use App\Http\Controllers\Hospital\Opd\DoctorSpecializationController;
use App\Http\Controllers\Hospital\Opd\DoctorAssignmentController;

// IPD Controllers  
use App\Http\Controllers\Hospital\Ipd\IpdWardController;
use App\Http\Controllers\Hospital\Ipd\IpdRoomController;
use App\Http\Controllers\Hospital\Ipd\IpdDischargeStatusController;


// Blood Bank Controllers
use App\Http\Controllers\BloodBank\BloodBankSetupController;
use App\Http\Controllers\BloodBank\BbComponentTypeController;
use App\Http\Controllers\BloodBank\BbDeferralReasonController;

// Theatre Controller
use App\Http\Controllers\Theatre\TheatreController;


// Human Resource Controllers   
use App\Http\Controllers\HumanResource\Setup\HrmDepartmentController;
use App\Http\Controllers\HumanResource\Setup\HrmPositionController;
use App\Http\Controllers\HumanResource\Setup\HrmBankController;
use App\Http\Controllers\HumanResource\Setup\PayTaxBracketController;
use App\Http\Controllers\HumanResource\Setup\PaySocialSecurityTypeController;
use App\Http\Controllers\HumanResource\Setup\PayInsuranceTypeController;
use App\Http\Controllers\HumanResource\Setup\PayFinancierController;
use App\Http\Controllers\HumanResource\Setup\HrmLeaveTypeController;


// Models
use App\Models\Facility\FacilityOption;
use App\Models\System\Facility;
use App\Models\Patient\PatientBillingGroup;
use App\Models\Patient\PatientBillingSubgroup;
use App\Models\Opd\OpdTreatmentPoint;
use App\Models\Opd\Config\DoctorSpecialization;
use App\Models\Ipd\IpdDischargeStatus;

use App\Models\Inventory\SIV_Store; 
use App\Models\Inventory\SIV_ProductCategory;
use App\Models\Inventory\SIV_Packaging; 
use App\Models\Inventory\SIV_Product;
use App\Models\Inventory\SIV_AdjustmentReason;
use App\Models\Inventory\SPR_Supplier; 

use App\Models\Billing\BLSCurrency;       
use App\Models\Billing\BLSPaymentType;    
use App\Models\Billing\BLSPriceCategory; 
use App\Models\Billing\BLSItemGroup;      
use App\Models\Billing\BLSItem;           
use App\Models\Billing\BLSCustomer;     


// Models for Dashboards
use App\Models\HumanResource\HrmDepartment;
use App\Models\HumanResource\HrmPosition;
use App\Models\HumanResource\HrmBank;
use App\Models\HumanResource\PayTaxBracket;
use App\Models\HumanResource\PaySocialSecurityType;
use App\Models\HumanResource\PayInsuranceType;
use App\Models\HumanResource\PayFinancier;
use App\Models\HumanResource\HrmLeaveType;

// systemconfiguration0: Billing Setup
Route::prefix('systemconfiguration0')->name('systemconfiguration0.')->group(function () {
   
    // Billing Setup Index Route
    Route::get('/', function () {
        return Inertia::render('SystemConfiguration/BillingSetup/Index', [
            'currencyCount'      => BLSCurrency::count(),
            'paymentTypeCount'   => BLSPaymentType::count(),
            'priceCategoryCount' => BLSPriceCategory::count(),
            'itemGroupCount'     => BLSItemGroup::count(),
            'billingItemCount'   => BLSItem::count(),
            'customerCount'      => BLSCustomer::count(),
        ]);
    })->name('index');


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
        Route::get('/{item}/availability', [BLSItemController::class, 'checkAvailability'])->name('availability');

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
   
    // Main index route
    Route::get('/', function () {
        return Inertia::render('SystemConfiguration/InventorySetup/Index', [ // Note: Your vars look like Inventory, not Expenses
            'storeCount' => SIV_Store::count(),
            'productCategoryCount' => SIV_ProductCategory::count(),
            'productUnitCount' => SIV_Packaging::count(),
            'productRegisterCount' => SIV_Product::count(),
            'adjustmentReasonCount' => SIV_AdjustmentReason::count(),
            'supplierCount' => SPR_Supplier::count(),
        ]);
    })->name('index');

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
    Route::get('/', function () { 
            return Inertia::render('SystemConfiguration/FacilitySetup/Index', [
            'facilityOptionCount' => FacilityOption::count(),
            'facilityCount' => Facility::count(),
            'billingGroupCount'   => PatientBillingGroup::count(),
            'billingSubGroupCount'=> PatientBillingSubgroup::count(),
            'treatmentPointCount' => OpdTreatmentPoint::count(),
            'otherOptionCount'    => 0, // Logic for other options
            'specializationCount' => DoctorSpecialization::count(), 
            'dischargeStatusCount' => IpdDischargeStatus::count(), 
        ]);
    })->name('index');
    
    // 1. Facility Options
    Route::prefix('facilityoptions')->name('facilityoptions.')->group(function () {
        Route::get('/', [FacilityOptionController::class, 'index'])->name('index');
        Route::get('/create', [FacilityOptionController::class, 'create'])->name('create');
        Route::post('/', [FacilityOptionController::class, 'store'])->name('store');
        Route::get('/{facilityoption}/edit', [FacilityOptionController::class, 'edit'])->name('edit');
        Route::put('/{facilityoption}', [FacilityOptionController::class, 'update'])->name('update'); 
        Route::delete('/{facilityoption}', [FacilityOptionController::class, 'destroy'])->name('destroy');
        Route::get('/search', [FacilityOptionController::class, 'search'])->name('search');
    }); 

    // 2. Facilites 
    Route::prefix('facilities')->name('facilities.')->group(function () {
        Route::get('/', [FacilityController::class, 'index'])->name('index');
        Route::get('/create', [FacilityController::class, 'create'])->name('create');
        Route::post('/', [FacilityController::class, 'store'])->name('store');
        Route::get('/{facility}/edit', [FacilityController::class, 'edit'])->name('edit');
        Route::put('/{facility}', [FacilityController::class, 'update'])->name('update');
        Route::delete('/{facility}', [FacilityController ::class, 'destroy'])->name('destroy');      
    });
 
    // 2. Billing Groups
    Route::prefix('billinggroups')->name('billinggroups.')->group(function () {
        Route::get('/', [PatientBillingGroupController::class, 'index'])->name('index');
        Route::get('/create', [PatientBillingGroupController::class, 'create'])->name('create');
        Route::post('/', [PatientBillingGroupController::class, 'store'])->name('store');
        Route::get('/{group}/edit', [PatientBillingGroupController::class, 'edit'])->name('edit');
        Route::put('/{group}', [PatientBillingGroupController::class, 'update'])->name('update');
        Route::delete('/{group}', [PatientBillingGroupController::class, 'destroy'])->name('destroy');      
        Route::post('/{group}/load-packages', [PatientBillingGroupController::class, 'loadPackages'])->name('load_packages');
        Route::get('/{group}/packages', [PatientBillingGroupController::class, 'viewPackages'])->name('packages');
    });    

    // 3. Billing Subgroups
    Route::prefix('billingsubgroups')->name('billingsubgroups.')->group(function () {
        Route::get('/', [PatientBillingSubgroupController::class, 'index'])->name('index');
        Route::get('/create', [PatientBillingSubgroupController::class, 'create'])->name('create');
        Route::post('/', [PatientBillingSubgroupController::class, 'store'])->name('store');
        Route::get('/{subgroup}/edit', [PatientBillingSubgroupController::class, 'edit'])->name('edit');
        Route::put('/{subgroup}', [PatientBillingSubgroupController::class, 'update'])->name('update');
        Route::delete('/{subgroup}', [PatientBillingSubgroupController::class, 'destroy'])->name('destroy');
    });

    // 4. Treatment Points
    Route::prefix('treatmentpoints')->name('treatmentpoints.')->group(function () {
        Route::get('/', [OpdTreatmentPointController::class, 'index'])->name('index');
        Route::get('/create', [OpdTreatmentPointController::class, 'create'])->name('create');
        Route::post('/', [OpdTreatmentPointController::class, 'store'])->name('store');
        Route::get('/{point}/edit', [OpdTreatmentPointController::class, 'edit'])->name('edit');
        Route::put('/{point}', [OpdTreatmentPointController::class, 'update'])->name('update');
        Route::delete('/{point}', [OpdTreatmentPointController::class, 'destroy'])->name('destroy');
    });

    // Inside existing systemconfiguration5 group...

    // 5. Wards (IPD)
    Route::prefix('wards')->name('wards.')->group(function () {
        Route::get('/', [IpdWardController::class, 'index'])->name('index');
        Route::get('/create', [IpdWardController::class, 'create'])->name('create');
        Route::post('/', [IpdWardController::class, 'store'])->name('store');
        Route::get('/{ward}/edit', [IpdWardController::class, 'edit'])->name('edit');
        Route::put('/{ward}', [IpdWardController::class, 'update'])->name('update');
        Route::delete('/{ward}', [IpdWardController::class, 'destroy'])->name('destroy');
    });

    // 6. Rooms & Beds
    Route::prefix('rooms')->name('rooms.')->group(function () {
        Route::get('/', [IpdRoomController::class, 'index'])->name('index');
        Route::get('/create', [IpdRoomController::class, 'create'])->name('create');
        Route::post('/', [IpdRoomController::class, 'store'])->name('store');
        Route::get('/{room}/edit', [IpdRoomController::class, 'edit'])->name('edit');
        Route::put('/{room}', [IpdRoomController::class, 'update'])->name('update');
        Route::delete('/{room}', [IpdRoomController::class, 'destroy'])->name('destroy');

        // Bed Management Routes (Nested in Rooms)
        Route::post('/{room}/beds', [IpdRoomController::class, 'storeBed'])->name('beds.store');
        Route::delete('/beds/{bed}', [IpdRoomController::class, 'destroyBed'])->name('beds.destroy');
    });

    // 7. Diagnosis Groups
    Route::prefix('diagnosisgroups')->name('diagnosisgroups.')->group(function () {
        Route::get('/', [DxtDiagnosesGroupController::class, 'index'])->name('index');
        Route::get('/create', [DxtDiagnosesGroupController::class, 'create'])->name('create');
        Route::post('/', [DxtDiagnosesGroupController::class, 'store'])->name('store');
        Route::get('/{group}/edit', [DxtDiagnosesGroupController::class, 'edit'])->name('edit');
        Route::put('/{group}', [DxtDiagnosesGroupController::class, 'update'])->name('update');
        Route::delete('/{group}', [DxtDiagnosesGroupController::class, 'destroy'])->name('destroy');
    });

    // 8. ICD Diagnoses
    Route::prefix('diagnoses')->name('diagnoses.')->group(function () {
         // --- Import Routes ---
        Route::get('/import', [DxtDiagnosesIcdController::class, 'showImportForm'])->name('import.show');
        Route::post('/import', [DxtDiagnosesIcdController::class, 'import'])->name('import.store');
        Route::get('/template', [DxtDiagnosesIcdController::class, 'downloadTemplate'])->name('template');

        Route::get('/', [DxtDiagnosesIcdController::class, 'index'])->name('index');
        Route::get('/create', [DxtDiagnosesIcdController::class, 'create'])->name('create');
        Route::post('/', [DxtDiagnosesIcdController::class, 'store'])->name('store');
        Route::get('/{diagnosis}/edit', [DxtDiagnosesIcdController::class, 'edit'])->name('edit');
        Route::put('/{diagnosis}', [DxtDiagnosesIcdController::class, 'update'])->name('update');
        Route::delete('/{diagnosis}', [DxtDiagnosesIcdController::class, 'destroy'])->name('destroy');
    });

    // Mtuha Diagnoses (Dynamic Type)
    // URL Example: /systemconfiguration5/mtuha/opd
    Route::prefix('mtuha')->name('mtuha.')->group(function () {

        // --- Import Routes (Place BEFORE /{type} index) ---
        Route::get('/{type}/import', [MtuhaDiagnosesController::class, 'showImportForm'])
            ->name('import.show');
        Route::post('/{type}/import', [MtuhaDiagnosesController::class, 'import'])
            ->name('import.store');
        Route::get('/{type}/template', [MtuhaDiagnosesController::class, 'downloadTemplate'])
            ->name('template');
        
        Route::get('/{type}', [MtuhaDiagnosesController::class, 'index'])
            ->where('type', 'opd|ipd|dental|eyes') // Security constraint
            ->name('index');
            
        Route::get('/{type}/create', [MtuhaDiagnosesController::class, 'create'])->name('create');
        Route::post('/{type}', [MtuhaDiagnosesController::class, 'store'])->name('store');
        Route::get('/{type}/{id}/edit', [MtuhaDiagnosesController::class, 'edit'])->name('edit');
        Route::put('/{type}/{id}', [MtuhaDiagnosesController::class, 'update'])->name('update');
        Route::delete('/{type}/{id}', [MtuhaDiagnosesController::class, 'destroy'])->name('destroy');
    });
    

    // Inside your existing Route::prefix('systemconfiguration5')->group(...)
    //systemconfiguration5.specializations.index, .create, .store, etc.
    Route::resource('specializations', DoctorSpecializationController::class);

     // Doctor Assignment Routes
    Route::prefix('doctor-assignment')->name('doctor-assignment.')->group(function () {
        Route::get('/', [DoctorAssignmentController::class, 'index'])->name('index');
        Route::put('/{user}', [DoctorAssignmentController::class, 'update'])->name('update');
    });

    // 9. Discharge Statuses

    Route::prefix('dischargestatuses')->name('dischargestatuses.')->group(function () {
        Route::get('/', [IpdDischargeStatusController::class, 'index'])->name('index');
        Route::get('/create', [IpdDischargeStatusController::class, 'create'])->name('create');
        Route::post('/', [IpdDischargeStatusController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [IpdDischargeStatusController::class, 'edit'])->name('edit');
        Route::put('/{id}', [IpdDischargeStatusController::class, 'update'])->name('update');
        Route::delete('/{id}', [IpdDischargeStatusController::class, 'destroy'])->name('destroy');
    });

});

// Extra: Human Resource / Fixed Assets Hubs
Route::prefix('humanresource')->name('humanresource.')->group(function () {
    Route::get('/', function () { return Inertia::render('ModulesHub/HumanResource/Index'); })->name('index');
}); 

Route::prefix('fixedassets')->name('fixedassets.')->group(function () {
    Route::get('/', function () { return Inertia::render('ModulesHub/FixedAssets/Index'); })->name('index');
});

// systemconfiguration6: Laboratory Setup
Route::prefix('systemconfiguration6')->name('systemconfiguration6.')->group(function () {
    
    // Main Dashboard
    Route::get('/', function () { 
        return Inertia::render('SystemConfiguration/LabSetup/Index'); 
    })->name('index');

    // 1. Nature of Samples
    Route::prefix('samples')->name('samples.')->group(function () {
        Route::get('/', [LabNatureOfSampleController::class, 'index'])->name('index');
        Route::get('/create', [LabNatureOfSampleController::class, 'create'])->name('create');
        Route::post('/', [LabNatureOfSampleController::class, 'store'])->name('store');
        Route::get('/{sample}/edit', [LabNatureOfSampleController::class, 'edit'])->name('edit');
        Route::put('/{sample}', [LabNatureOfSampleController::class, 'update'])->name('update');
        Route::delete('/{sample}', [LabNatureOfSampleController::class, 'destroy'])->name('destroy');
    });

    // 2. Rejection Reasons
    Route::prefix('rejections')->name('rejections.')->group(function () {
        Route::get('/', [LabRejectionReasonController::class, 'index'])->name('index');
        Route::get('/create', [LabRejectionReasonController::class, 'create'])->name('create');
        Route::post('/', [LabRejectionReasonController::class, 'store'])->name('store');
        Route::get('/{reason}/edit', [LabRejectionReasonController::class, 'edit'])->name('edit');
        Route::put('/{reason}', [LabRejectionReasonController::class, 'update'])->name('update');
        Route::delete('/{reason}', [LabRejectionReasonController::class, 'destroy'])->name('destroy');
    });

    // 3. Lab Categories (Departments)
    Route::prefix('categories')->name('categories.')->group(function () {
        Route::get('/', [LabCategoryController::class, 'index'])->name('index');
        Route::get('/create', [LabCategoryController::class, 'create'])->name('create');
        Route::post('/', [LabCategoryController::class, 'store'])->name('store');
        Route::get('/{category}/edit', [LabCategoryController::class, 'edit'])->name('edit');
        Route::put('/{category}', [LabCategoryController::class, 'update'])->name('update');
        Route::delete('/{category}', [LabCategoryController::class, 'destroy'])->name('destroy');
    });

    // 4. Lab Panels (Orderable Tests)
    Route::prefix('panels')->name('panels.')->group(function () {
        Route::get('/', [LabPanelController::class, 'index'])->name('index');
        Route::get('/create', [LabPanelController::class, 'create'])->name('create');
        Route::post('/', [LabPanelController::class, 'store'])->name('store');
        Route::get('/{panel}/edit', [LabPanelController::class, 'edit'])->name('edit');
        Route::put('/{panel}', [LabPanelController::class, 'update'])->name('update');
        Route::delete('/{panel}', [LabPanelController::class, 'destroy'])->name('destroy');
    });

    // 5. Lab Parameters (Result Fields)
    Route::prefix('parameters')->name('parameters.')->group(function () {
        Route::get('/', [LabTestParameterController::class, 'index'])->name('index');
        Route::get('/create', [LabTestParameterController::class, 'create'])->name('create');
        Route::post('/', [LabTestParameterController::class, 'store'])->name('store');
        Route::get('/{parameter}/edit', [LabTestParameterController::class, 'edit'])->name('edit');
        Route::put('/{parameter}', [LabTestParameterController::class, 'update'])->name('update');
        Route::delete('/{parameter}', [LabTestParameterController::class, 'destroy'])->name('destroy');
    });
});

// systemconfiguration7: Radiology Setup
Route::prefix('systemconfiguration7')->name('systemconfiguration7.')->group(function () {
    
    // Main Dashboard
    Route::get('/', function () { 
        return Inertia::render('SystemConfiguration/RadiologySetup/Index'); 
    })->name('index');

    // 1. Modalities (Machines)
    Route::prefix('modalities')->name('modalities.')->group(function () {
        Route::get('/', [RadModalityController::class, 'index'])->name('index');
        Route::get('/create', [RadModalityController::class, 'create'])->name('create');
        Route::post('/', [RadModalityController::class, 'store'])->name('store');
        Route::get('/{modality}/edit', [RadModalityController::class, 'edit'])->name('edit');
        Route::put('/{modality}', [RadModalityController::class, 'update'])->name('update');
        Route::delete('/{modality}', [RadModalityController::class, 'destroy'])->name('destroy');
    });

    // 2. Procedures (Exams)
    Route::prefix('procedures')->name('procedures.')->group(function () {
        Route::get('/', [RadProcedureController::class, 'index'])->name('index');
        Route::get('/create', [RadProcedureController::class, 'create'])->name('create');
        Route::post('/', [RadProcedureController::class, 'store'])->name('store');
        Route::get('/{procedure}/edit', [RadProcedureController::class, 'edit'])->name('edit');
        Route::put('/{procedure}', [RadProcedureController::class, 'update'])->name('update');
        Route::delete('/{procedure}', [RadProcedureController::class, 'destroy'])->name('destroy');
    });
});

// systemconfiguration8: Theatre Setup
Route::prefix('systemconfiguration8')->name('systemconfiguration8.')->group(function () {
    
    // Main Dashboard
    Route::get('/', function () { 
        return Inertia::render('SystemConfiguration/TheatreSetup/Index'); 
    })->name('index');

    // 1. Procedure Groups
    Route::prefix('groups')->name('groups.')->group(function () {
        Route::get('/', [App\Http\Controllers\Theatre\TheatreProcedureGroupController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\Theatre\TheatreProcedureGroupController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\Theatre\TheatreProcedureGroupController::class, 'store'])->name('store');
        Route::get('/{group}/edit', [App\Http\Controllers\Theatre\TheatreProcedureGroupController::class, 'edit'])->name('edit');
        Route::put('/{group}', [App\Http\Controllers\Theatre\TheatreProcedureGroupController::class, 'update'])->name('update');
        Route::delete('/{group}', [App\Http\Controllers\Theatre\TheatreProcedureGroupController::class, 'destroy'])->name('destroy');
    });

    // 2. Procedures
    Route::prefix('procedures')->name('procedures.')->group(function () {
        Route::get('/', [App\Http\Controllers\Theatre\TheatreProcedureController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\Theatre\TheatreProcedureController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\Theatre\TheatreProcedureController::class, 'store'])->name('store');
        Route::get('/{procedure}/edit', [App\Http\Controllers\Theatre\TheatreProcedureController::class, 'edit'])->name('edit');
        Route::put('/{procedure}', [App\Http\Controllers\Theatre\TheatreProcedureController::class, 'update'])->name('update');
        Route::delete('/{procedure}', [App\Http\Controllers\Theatre\TheatreProcedureController::class, 'destroy'])->name('destroy');
    });    

    // Theatre Rooms
    Route::prefix('theatres')->name('theatres.')->group(function () {
        Route::get('/', [TheatreController::class, 'index'])->name('index');
        Route::get('/create', [TheatreController::class, 'create'])->name('create');
        Route::post('/', [TheatreController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [TheatreController::class, 'edit'])->name('edit');
        Route::put('/{id}', [TheatreController::class, 'update'])->name('update');
        Route::delete('/{id}', [TheatreController::class, 'destroy'])->name('destroy');
    });
});

// systemconfiguration9: Pharmacy Setup
Route::prefix('systemconfiguration9')->name('systemconfiguration9.')->group(function () {
    
    // Dashboard
    Route::get('/', [PharmacySetupController::class, 'index'])->name('index');

    // 1. Frequencies (Dosage Calc)
    Route::prefix('frequencies')->name('frequencies.')->group(function () {
        Route::get('/', [PharmacyFrequencyController::class, 'index'])->name('index');
        Route::get('/create', [PharmacyFrequencyController::class, 'create'])->name('create');
        Route::post('/', [PharmacyFrequencyController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [PharmacyFrequencyController::class, 'edit'])->name('edit');
        Route::put('/{id}', [PharmacyFrequencyController::class, 'update'])->name('update');
    });

    // 2. Durations (e.g. 5/7, 1/52)
    Route::prefix('durations')->name('durations.')->group(function () {
        Route::get('/', [PharmacyDurationController::class, 'index'])->name('index');
        Route::get('/create', [PharmacyDurationController::class, 'create'])->name('create');
        Route::post('/', [PharmacyDurationController::class, 'store'])->name('store');
        Route::get('/{duration}/edit', [PharmacyDurationController::class, 'edit'])->name('edit');
        Route::put('/{duration}', [PharmacyDurationController::class, 'update'])->name('update');
        Route::delete('/{duration}', [PharmacyDurationController::class, 'destroy'])->name('destroy');
    });

    // 3. Administration Routes (e.g. Oral, IV)
    Route::prefix('routes')->name('routes.')->group(function () {
        Route::get('/', [PharmacyRouteController::class, 'index'])->name('index');
        Route::get('/create', [PharmacyRouteController::class, 'create'])->name('create');
        Route::post('/', [PharmacyRouteController::class, 'store'])->name('store');
        Route::get('/{routeItem}/edit', [PharmacyRouteController::class, 'edit'])->name('edit');
        Route::put('/{routeItem}', [PharmacyRouteController::class, 'update'])->name('update');
        Route::delete('/{routeItem}', [PharmacyRouteController::class, 'destroy'])->name('destroy');
    });

    // 4. Drug Master (Linking Inventory to Clinical)
    Route::prefix('drugmaster')->name('drugmaster.')->group(function () {
        Route::get('/', [PharmacyDrugMasterController::class, 'index'])->name('index');
        Route::get('/{id}/edit', [PharmacyDrugMasterController::class, 'edit'])->name('edit');
        Route::put('/{id}', [PharmacyDrugMasterController::class, 'update'])->name('update');
    });
});

// systemconfiguration10: Blood Bank Setup
Route::prefix('systemconfiguration10')->name('systemconfiguration10.')->group(function () {
    
    // Dashboard
    Route::get('/', [BloodBankSetupController::class, 'index'])->name('index');

    // 1. Component Types (Whole Blood, Plasma)
    Route::prefix('components')->name('components.')->group(function () {
        Route::get('/', [BbComponentTypeController::class, 'index'])->name('index');
        Route::get('/create', [BbComponentTypeController::class, 'create'])->name('create');
        Route::post('/', [BbComponentTypeController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [BbComponentTypeController::class, 'edit'])->name('edit');
        Route::put('/{id}', [BbComponentTypeController::class, 'update'])->name('update');
        Route::delete('/{id}', [BbComponentTypeController::class, 'destroy'])->name('destroy');
    });

    // 2. Deferral Reasons (Rejection)
    Route::prefix('deferrals')->name('deferrals.')->group(function () {
        Route::get('/', [BbDeferralReasonController::class, 'index'])->name('index');
        Route::get('/create', [BbDeferralReasonController::class, 'create'])->name('create');
        Route::post('/', [BbDeferralReasonController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [BbDeferralReasonController::class, 'edit'])->name('edit');
        Route::put('/{id}', [BbDeferralReasonController::class, 'update'])->name('update');
        Route::delete('/{id}', [BbDeferralReasonController::class, 'destroy'])->name('destroy');
    });
});

 
// systemconfiguration11: HR Organization Setup
Route::prefix('systemconfiguration11')->name('systemconfiguration11.')->group(function () {
    
    // Dashboard
    Route::get('/', function () { 
        return Inertia::render('SystemConfiguration/HrSetup/Index', [
            'deptCount' => HrmDepartment::count(),
            'posCount' => HrmPosition::count(),
            'bankCount' => HrmBank::count(),
        ]); 
    })->name('index');

    // 1. Departments
    Route::prefix('departments')->name('departments.')->group(function () {
        Route::get('/', [HrmDepartmentController::class, 'index'])->name('index');
        Route::get('/create', [HrmDepartmentController::class, 'create'])->name('create');
        Route::post('/', [HrmDepartmentController::class, 'store'])->name('store');
        Route::get('/{department}/edit', [HrmDepartmentController::class, 'edit'])->name('edit');
        Route::put('/{department}', [HrmDepartmentController::class, 'update'])->name('update');
        Route::delete('/{department}', [HrmDepartmentController::class, 'destroy'])->name('destroy');
    });

    // 2. Positions
    Route::prefix('positions')->name('positions.')->group(function () {
        Route::get('/', [HrmPositionController::class, 'index'])->name('index');
        Route::get('/create', [HrmPositionController::class, 'create'])->name('create');
        Route::post('/', [HrmPositionController::class, 'store'])->name('store');
        Route::get('/{position}/edit', [HrmPositionController::class, 'edit'])->name('edit');
        Route::put('/{position}', [HrmPositionController::class, 'update'])->name('update');
        Route::delete('/{position}', [HrmPositionController::class, 'destroy'])->name('destroy');
    });

    // 3. Banks
    Route::prefix('banks')->name('banks.')->group(function () {
        Route::get('/', [HrmBankController::class, 'index'])->name('index');
        Route::get('/create', [HrmBankController::class, 'create'])->name('create');
        Route::post('/', [HrmBankController::class, 'store'])->name('store');
        Route::get('/{bank}/edit', [HrmBankController::class, 'edit'])->name('edit');
        Route::put('/{bank}', [HrmBankController::class, 'update'])->name('update');
        Route::delete('/{bank}', [HrmBankController::class, 'destroy'])->name('destroy');
    });
});

// systemconfiguration12: Payroll Configuration
Route::prefix('systemconfiguration12')->name('systemconfiguration12.')->group(function () {
    
    // Dashboard
    Route::get('/', function () { 
        return Inertia::render('SystemConfiguration/PayrollSetup/Index', [
            'taxCount' => PayTaxBracket::count(),
            'ssCount' => PaySocialSecurityType::count(),
            'insCount' => PayInsuranceType::count(),
            'finCount' => PayFinancier::count(),
        ]); 
    })->name('index');

    // 1. Tax Brackets (PAYE)
    Route::prefix('tax')->name('tax.')->group(function () {
        Route::get('/', [PayTaxBracketController::class, 'index'])->name('index');
        Route::get('/create', [PayTaxBracketController::class, 'create'])->name('create');
        Route::post('/', [PayTaxBracketController::class, 'store'])->name('store');
        Route::get('/{tax}/edit', [PayTaxBracketController::class, 'edit'])->name('edit');
        Route::put('/{tax}', [PayTaxBracketController::class, 'update'])->name('update');
        Route::delete('/{tax}', [PayTaxBracketController::class, 'destroy'])->name('destroy');
    });

    // 2. Social Security
    Route::prefix('social')->name('social.')->group(function () {
        Route::get('/', [PaySocialSecurityTypeController::class, 'index'])->name('index');
        Route::get('/create', [PaySocialSecurityTypeController::class, 'create'])->name('create');
        Route::post('/', [PaySocialSecurityTypeController::class, 'store'])->name('store');
        Route::get('/{social}/edit', [PaySocialSecurityTypeController::class, 'edit'])->name('edit');
        Route::put('/{social}', [PaySocialSecurityTypeController::class, 'update'])->name('update');
        Route::delete('/{social}', [PaySocialSecurityTypeController::class, 'destroy'])->name('destroy');
    });

    // 3. Insurance Types
    Route::prefix('insurance')->name('insurance.')->group(function () {
        Route::get('/', [PayInsuranceTypeController::class, 'index'])->name('index');
        Route::get('/create', [PayInsuranceTypeController::class, 'create'])->name('create');
        Route::post('/', [PayInsuranceTypeController::class, 'store'])->name('store');
        Route::get('/{insurance}/edit', [PayInsuranceTypeController::class, 'edit'])->name('edit');
        Route::put('/{insurance}', [PayInsuranceTypeController::class, 'update'])->name('update');
        Route::delete('/{insurance}', [PayInsuranceTypeController::class, 'destroy'])->name('destroy');
    });

    // 4. Financiers (Loans)
    Route::prefix('financiers')->name('financiers.')->group(function () {
        Route::get('/', [PayFinancierController::class, 'index'])->name('index');
        Route::get('/create', [PayFinancierController::class, 'create'])->name('create');
        Route::post('/', [PayFinancierController::class, 'store'])->name('store');
        Route::get('/{financier}/edit', [PayFinancierController::class, 'edit'])->name('edit');
        Route::put('/{financier}', [PayFinancierController::class, 'update'])->name('update');
        Route::delete('/{financier}', [PayFinancierController::class, 'destroy'])->name('destroy');
    });
});



// systemconfiguration13: Leave Setup
Route::prefix('systemconfiguration13')->name('systemconfiguration13.')->group(function () {
    
    // Main Dashboard for Leave Setup
    Route::get('/', function () { 
        return Inertia::render('SystemConfiguration/LeaveSetup/Index', [
            'typeCount' => HrmLeaveType::count(),
        ]); 
    })->name('index');

    // Leave Types CRUD
    Route::prefix('leavetypes')->name('leavetypes.')->group(function () {
        Route::get('/', [HrmLeaveTypeController::class, 'index'])->name('index');
        Route::get('/create', [HrmLeaveTypeController::class, 'create'])->name('create');
        Route::post('/', [HrmLeaveTypeController::class, 'store'])->name('store');
        Route::get('/{leavetype}/edit', [HrmLeaveTypeController::class, 'edit'])->name('edit');
        Route::put('/{leavetype}', [HrmLeaveTypeController::class, 'update'])->name('update');
        Route::delete('/{leavetype}', [HrmLeaveTypeController::class, 'destroy'])->name('destroy');
    });
});


use App\Http\Controllers\Rch\RchSetupController;
use App\Http\Controllers\SpecializeClinic\Rch\RchVaccineController;
use App\Http\Controllers\SpecializeClinic\Rch\RchFpMethodController;
use App\Models\Rch\RchVaccine;
use App\Models\Rch\RchFpMethod;

// systemconfiguration14: RCH Setup
Route::prefix('systemconfiguration14')->name('systemconfiguration14.')->group(function () {
    
    // Main Dashboard
    Route::get('/', function () { 
        return Inertia::render('SystemConfiguration/RchSetup/Index', [
            'vaccineCount' => RchVaccine::count(),
            'fpMethodCount' => RchFpMethod::count(),
        ]); 
    })->name('index');

    // 1. Vaccines
    Route::prefix('vaccines')->name('vaccines.')->group(function () {
        Route::get('/', [RchVaccineController::class, 'index'])->name('index');
        Route::get('/create', [RchVaccineController::class, 'create'])->name('create');
        Route::post('/', [RchVaccineController::class, 'store'])->name('store');
        Route::get('/{vaccine}/edit', [RchVaccineController::class, 'edit'])->name('edit');
        Route::put('/{vaccine}', [RchVaccineController::class, 'update'])->name('update');
        Route::delete('/{vaccine}', [RchVaccineController::class, 'destroy'])->name('destroy');
    });

    // 2. Family Planning Methods
    Route::prefix('fpmethods')->name('fpmethods.')->group(function () {
        Route::get('/', [RchFpMethodController::class, 'index'])->name('index');
        Route::get('/create', [RchFpMethodController::class, 'create'])->name('create');
        Route::post('/', [RchFpMethodController::class, 'store'])->name('store');
        Route::get('/{method}/edit', [RchFpMethodController::class, 'edit'])->name('edit');
        Route::put('/{method}', [RchFpMethodController::class, 'update'])->name('update');
        Route::delete('/{method}', [RchFpMethodController::class, 'destroy'])->name('destroy');
    });
});

use App\Models\Mortuary\Mortuary;
use App\Models\Mortuary\MortuaryRoom;
use App\Http\Controllers\Mortuary\MortuaryController;
use App\Http\Controllers\Mortuary\MortuaryRoomController;
use App\Http\Controllers\Mortuary\MortuaryCabinetController;

// systemconfiguration14: RCH Setup
Route::prefix('systemconfiguration16')->name('systemconfiguration16.')->group(function () {
    
    // Main Dashboard
    Route::get('/', function () { 
        return Inertia::render('SystemConfiguration/MortuarySetup/Index', [
            'mortuaryCount' => Mortuary::count(),
            'roomCount' => MortuaryRoom::count(),
        ]); 
    })->name('index');

    
    // 1. Mortuaries (Roots)
    Route::resource('mortuaries', MortuaryController::class);

    // 2. Rooms
    Route::resource('rooms', MortuaryRoomController::class);

    // 3. Cabinets (Using the new dedicated controller)
    Route::post('rooms/{room}/cabinets', [MortuaryCabinetController::class, 'store'])->name('rooms.cabinets.store');
    Route::delete('cabinets/{cabinet}', [MortuaryCabinetController::class, 'destroy'])->name('rooms.cabinets.destroy');

});