<?php

namespace App\Http\Controllers\Hospital\Pharmacy;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;

// Models
use App\Models\Pharmacy\PharmacyPrescription;
use App\Models\Pharmacy\PharmacyDispensation;
use App\Models\Inventory\SIV_Product;
use App\Models\Inventory\SIV_Store;
use App\Models\Inventory\IVRequistion;
use App\Models\Facility\FacilityOption;
use App\Models\Billing\BLSCustomer;

// Enums
use App\Enums\StoreType;

// Services
use App\Services\BillingService; 
use App\Services\InventoryService;

class PharmacyDispenseController extends Controller
{
    /**
     * List Pending Prescriptions
     */
    public function index(Request $request)
    {
        $query = PharmacyPrescription::with(['patient', 'product.drugDetails', 'product.blsItem', 'doctor', 'visit.billingGroup'])
            ->where('status', '!=', 'Dispensed')
            ->orderBy('created_at', 'asc');

        if ($request->search) {
            $query->whereHas('patient', function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('last_name', 'like', "%{$request->search}%")
                  ->orWhere('patientcode', 'like', "%{$request->search}%");
            });
        }

        return Inertia::render('Hospital/Pharmacy/Dispensing/Index', [
            'prescriptions' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * STAGE 1: Generate Bill & Mark as "Billed"
     */
    public function generateBill(Request $request, PharmacyPrescription $prescription, BillingService $billingService)
    {
        $request->validate(['verified_qty' => 'required|numeric|min:0.1']);

        DB::transaction(function () use ($request, $prescription, $billingService) {
            
            $prescription->update([
                'quantity_prescribed' => $request->verified_qty,
                'status' => 'Billed' 
            ]);

            $priceCategory = 'price1';
            if ($prescription->visit && $prescription->visit->billingGroup) {
                $priceCategory = $prescription->visit->billingGroup->pricecategory ?? 'price1';
            }

            $product = SIV_Product::with('blsItem')->find($prescription->product_id);

            if ($product && $product->blsItem) {
                $billingService->addToBill(
                    $prescription->patientcode,
                    $product->blsItem->id,
                    $request->verified_qty,
                    'pharmacy',
                    $prescription->id,
                    $priceCategory
                );
            }
        });

        return back()->with('success', 'Bill sent. Patient marked as "At Cashier".');
    }

    /**
     * STAGE 2: Dispensing View
     */
    public function create(PharmacyPrescription $prescription)
    {
        $facility = FacilityOption::first();
        $allowNegative = (bool)($facility->allownegativestock ?? false);

        // --- ROBUST SECURITY CHECK (No Hardcoding) ---
        $prescription->load(['patient', 'visit.billingGroup']);
        
        $isCash = true; // Default assumption
        
        // 1. Check Patient Payment Category (Best source of truth)
        if ($prescription->patient && $prescription->patient->payment_category) {
            $isCash = ($prescription->patient->payment_category === 'Cash');
        } 
        // 2. Fallback: Check Billing Group Configuration
        elseif ($prescription->visit && $prescription->visit->billingGroup) {
            $bg = $prescription->visit->billingGroup;
            
            if ($bg->isinsurance || $bg->isexemption) {
                $isCash = false; // Insurance or Exemption
            } elseif ($facility && $bg->id != $facility->default_cash_billing_group_id) {
                $isCash = false; // Corporate / Invoice Client
            }
        }

        // 3. Check Admission Status
        // Admitted patients are allowed to proceed even if unpaid (billed later)
        $isAdmitted = $prescription->patient->is_admitted ?? false;

        // Block if Cash AND Unpaid AND Not Admitted
        if ($isCash && $prescription->payment_status !== 'paid' && !$isAdmitted) {
            return redirect()->route('pharmacy0.index')
                ->with('error', 'Access Denied: Cash patients must pay before dispensing.');
        }
        // ---------------------------------------------
        
    
        $prescription->load(['product.drugDetails', 'doctor']);
        $stores = SIV_Store::all();
        $defaultStoreId = Auth::user()->store_id; 
        if (!$defaultStoreId && $stores->isNotEmpty()) {
            $defaultStoreId = $stores->first()->id;
        }

        $currentStock = 0;
        if ($defaultStoreId && $prescription->product_id) {
            $qtyColumn = 'qty_' . (int)$defaultStoreId;
            try {
                $hasColumn = count(DB::select("SHOW COLUMNS FROM iv_productcontrol LIKE '$qtyColumn'")) > 0;
                if ($hasColumn) {
                    $result = DB::table('siv_products')
                        ->leftJoin('iv_productcontrol', 'iv_productcontrol.product_id', '=', 'siv_products.id')
                        ->where('siv_products.id', $prescription->product_id)
                        ->select(DB::raw("COALESCE(iv_productcontrol.$qtyColumn, 0) as current_stock"))
                        ->first();
                    $currentStock = $result ? $result->current_stock : 0;
                }
            } catch (\Exception $e) {
                Log::error("Stock Fetch Error: " . $e->getMessage());
            }
        }

        return Inertia::render('Hospital/Pharmacy/Dispensing/Create', [
            'prescription'         => $prescription,
            'stores'               => $stores,
            'default_store_id'     => $defaultStoreId, 
            'initial_stock'        => (float)$currentStock,
            'allow_negative_stock' => $allowNegative,
        ]);
    }

    /**
     * STAGE 2: Deduct Stock & Auto-Bill Non-Cash
     */
    public function store(Request $request, PharmacyPrescription $prescription, BillingService $billingService)
    {
        $facility = FacilityOption::first();
        $allowNegative = $facility->allownegativestock ?? false;

        $request->validate([
            'quantity_issued' => 'required|numeric|min:0.01',
            'store_id' => 'required|exists:siv_stores,id'
        ]);

        $qtyColumn = 'qty_' . (int)$request->store_id;

        // 1. Backend Stock Validation
        if (!$allowNegative) {
            $stock = 0;
            try {
                 $hasColumn = count(DB::select("SHOW COLUMNS FROM iv_productcontrol LIKE '$qtyColumn'")) > 0;
                 if ($hasColumn) {
                    $stockResult = DB::table('siv_products')
                        ->leftJoin('iv_productcontrol', 'iv_productcontrol.product_id', '=', 'siv_products.id')
                        ->where('siv_products.id', $prescription->product_id)
                        ->select(DB::raw("COALESCE(iv_productcontrol.$qtyColumn, 0) as current_stock"))
                        ->first();
                    $stock = $stockResult ? $stockResult->current_stock : 0;
                 }
            } catch (\Exception $e) {}

            if ($request->quantity_issued > $stock) {
                return back()->with('error', "Insufficient stock! Only $stock available.");
            }
        }

        DB::transaction(function () use ($request, $prescription, $billingService, $facility) {
    
            // --- 1. DETERMINE PAYMENT & ADMISSION CONTEXT ---
            
            // Check if truly admitted based on the prescription link (most accurate)
            $isAdmitted = !empty($prescription->ipd_admission_id);
            
            // Initialize defaults
            $isCash = true;
            $priceCategory = 'price1';
            $billingGroup = null;

            // A. Extract Context (IPD vs OPD)
            if ($isAdmitted && $prescription->admission) {
                // --- IPD CONTEXT ---
                $billingGroup = $prescription->admission->billingGroup;
                $priceCategory = $prescription->admission->pricecategory 
                                ?? $billingGroup?->pricecategory 
                                ?? 'price1';

            } elseif ($prescription->opd_booking_id && $prescription->visit) {
                // --- OPD CONTEXT ---
                $billingGroup = $prescription->visit->billingGroup;
                $priceCategory = $prescription->visit->pricecategory 
                                ?? $billingGroup?->pricecategory 
                                ?? 'price1';
            }

            // B. Determine if Cash
            // If we found a billing group from the encounter, use it to decide cash status
            if ($billingGroup) {
                if ($billingGroup->isinsurance || $billingGroup->isexemption) {
                    $isCash = false;
                } elseif ($facility && $billingGroup->id != $facility->default_cash_billing_group_id) {
                    $isCash = false; // Corporate / Invoice
                }
            } else {
                // Fallback to Patient Master if no encounter billing group found
                if ($prescription->patient && $prescription->patient->payment_category) {
                    $isCash = ($prescription->patient->payment_category === 'Cash');
                }
            }

            // --- 2. BILLING EXECUTION ---
            
            // LOGIC:
            // 1. If IPD ($isAdmitted): Always add to bill (it accumulates till discharge).
            // 2. If OPD & NOT Cash: Add to bill (Insurance/Company pays).
            // 3. If OPD & Cash: Usually skipped here (paid at POS), unless you want a record.
            
            if ($isAdmitted || !$isCash) {

                $product = SIV_Product::with('blsItem')->find($prescription->product_id);

                if ($product && $product->blsItem) {
                    $billingService->addToBill(
                        $prescription->patientcode,
                        $product->blsItem->id,
                        $request->quantity_issued, // Use actual issued quantity
                        'pharmacy',
                        $prescription->id,
                        $priceCategory 
                    );
                }
            }

            // --- 3. INVENTORY & LOGGING ---

            // Inventory Requisition (Deduct Stock)
            $this->createInventoryRequisition(
                (int)$request->store_id,
                $prescription, 
                (float)$request->quantity_issued
            );

            // Pharmacy Audit Record
            PharmacyDispensation::create([
                'pharmacy_prescription_id' => $prescription->id,
                'quantity_issued' => $request->quantity_issued,
                'batch_no' => $request->batch_no,
                'expiry_date' => $request->expiry_date,
                'pharmacist_user_id' => Auth::id(),
                'dispensed_at' => now(),
            ]);

            // Update Status
            $prescription->update(['status' => 'Dispensed']);
        });

        return redirect()->route('pharmacy0.index')->with('success', 'Medication issued successfully.');
    }
    /**
     * Helper to bridge Pharmacy logic with Inventory Service
     */
    private function createInventoryRequisition(int $storeId, PharmacyPrescription $prescription, float $qty)
    {
        $inventoryService = new InventoryService();
        $transdate = Carbon::now();

        $patientCode = $prescription->patientcode;
        $patient = $prescription->patient;

        $customer = BLSCustomer::where('patient_code', $patientCode)->first();
        if (!$customer && $patient) {
            $customer = BLSCustomer::create([
                'patient_code' => $patientCode,
                'customer_type' => 'individual',
                'first_name' => $patient->first_name,
                'surname' => $patient->last_name,
                'phone' => $patient->phone_number,
            ]);
        }

        $toEntityId = $customer ? $customer->id : 0;
        $toEntityName = $customer ? "{$customer->first_name} {$customer->surname}" : 'Unknown Patient';

        $product = SIV_Product::find($prescription->product_id);
        $cost = $product ? $product->costprice : 0;
        $totalCost = $qty * $cost;

        $requisition = IVRequistion::create([
            'transdate' => $transdate,
            'tostore_id' => $toEntityId, 
            'tostore_type' => StoreType::Customer->value, 
            'fromstore_id' => $storeId,
            'stage' => 4, 
            'total' => 0,
            'user_id' => Auth::id(),
            'remarks' => "Pharmacy Rx #{$prescription->id}", 
        ]);

        $requisition->requistionitems()->create([
            'product_id' => $prescription->product_id,
            'quantity' => $qty,
            'price' => $cost,
        ]);

        $requisition->total = $totalCost;
        $requisition->saveQuietly();
        
        // Issue the items
        $issueItems = [[
            'product_id' => $prescription->product_id,
            'quantity' => $qty,
            'price' => $cost,
        ]];

        $deliveryNo = 'PHARM-' . $requisition->id . '-' . time();

        $inventoryService->issue(
            $storeId,
            $toEntityId,
            StoreType::Customer->value, 
            $toEntityName,
            $issueItems,
            $deliveryNo,
            null
        );
    }

    public function checkStock(Request $request)
    {
        $productId = $request->product_id;
        $storeId = (int)$request->store_id;

        if (!$storeId || !$productId) return response()->json(['stock' => 0]);

        $qtyColumn = 'qty_' . $storeId;

        try {
            $hasColumn = count(DB::select("SHOW COLUMNS FROM iv_productcontrol LIKE '$qtyColumn'")) > 0;

            if (!$hasColumn) {
                return response()->json(['stock' => 0, 'error' => 'Store not initialized'], 200);
            }

            $result = DB::table('siv_products')
                ->leftJoin('iv_productcontrol', 'iv_productcontrol.product_id', '=', 'siv_products.id')
                ->where('siv_products.id', $productId)
                ->select(DB::raw("COALESCE(iv_productcontrol.$qtyColumn, 0) as current_stock"))
                ->first();

            return response()->json(['stock' => (float) ($result ? $result->current_stock : 0)]);

        } catch (\Exception $e) {
            return response()->json(['stock' => 0], 200); 
        }
    }
}