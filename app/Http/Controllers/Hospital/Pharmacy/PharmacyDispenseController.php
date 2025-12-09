<?php

namespace App\Http\Controllers\Hospital\Pharmacy;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// Models
use App\Models\Pharmacy\PharmacyPrescription;
use App\Models\Pharmacy\PharmacyDispensation;
use App\Models\SIV_Product;

class PharmacyDispenseController extends Controller
{
    /**
     * List Pending Prescriptions
     */
    public function index(Request $request)
    {
        // Fetch prescriptions that are paid/prescribed but NOT fully dispensed
        $query = PharmacyPrescription::with(['patient', 'product', 'doctor'])
            ->where('status', '!=', 'Dispensed')
            ->orderBy('created_at', 'asc');

        if ($request->search) {
            $query->whereHas('patient', function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%");
            });
        }

        return Inertia::render('Hospital/Pharmacy/Dispensing/Index', [
            'prescriptions' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Show Dispensing Form
     */
    public function create(PharmacyPrescription $prescription)
    {
        // Load product inventory details (stock, expiry etc if available)
        $prescription->load(['patient', 'product', 'doctor']);

        return Inertia::render('Hospital/Pharmacy/Dispensing/Create', [
            'prescription' => $prescription,
            // Assuming SIV_Product has a 'stock' or similar field/relation
            'current_stock' => 100 // Placeholder: Replace with actual stock check logic
        ]);
    }

    /**
     * Process Dispensation
     */
    public function store(Request $request, PharmacyPrescription $prescription)
    {
        $request->validate([
            'quantity_issued' => 'required|numeric|min:1|max:' . $prescription->quantity_prescribed,
            'batch_no' => 'nullable|string',
            'expiry_date' => 'nullable|date'
        ]);

        DB::transaction(function () use ($request, $prescription) {
            
            // 1. Create Dispensation Record
            PharmacyDispensation::create([
                'pharmacy_prescription_id' => $prescription->id,
                'quantity_issued' => $request->quantity_issued,
                'batch_no' => $request->batch_no,
                'expiry_date' => $request->expiry_date,
                'pharmacist_user_id' => Auth::id(),
                'dispensed_at' => now(),
            ]);

            // 2. Deduct Inventory (Assuming you have logic for this)
            // SIV_Product::find($prescription->product_id)->decrement('stock', $request->quantity_issued);

            // 3. Update Prescription Status
            // Check if fully dispensed or partial
            $totalDispensed = $prescription->dispensations()->sum('quantity_issued') + $request->quantity_issued;
            
            if ($totalDispensed >= $prescription->quantity_prescribed) {
                $prescription->update(['status' => 'Dispensed']);
            } else {
                $prescription->update(['status' => 'Partial']);
            }
        });

        return redirect()->route('pharmacy0.index')
            ->with('success', 'Drug dispensed successfully.');
    }
}