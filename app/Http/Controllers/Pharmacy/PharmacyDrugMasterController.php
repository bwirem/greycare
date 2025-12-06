<?php

namespace App\Http\Controllers\Pharmacy;

use App\Http\Controllers\Controller;
use App\Models\SIV_Product;
use App\Models\Pharmacy\PharmacyDrugDetail;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PharmacyDrugMasterController extends Controller
{
    public function index(Request $request)
    {
        // Fetch Inventory Products, eager load Drug Details if they exist
        $query = SIV_Product::with(['drugDetails', 'category']);

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        return Inertia::render('SystemConfiguration/PharmacySetup/DrugMaster/Index', [
            'products' => $query->paginate(15),
            'filters' => $request->only(['search']),
        ]);
    }

    public function edit($id)
    {
        $product = SIV_Product::with('drugDetails')->findOrFail($id);
        return Inertia::render('SystemConfiguration/PharmacySetup/DrugMaster/Edit', [
            'product' => $product
        ]);
    }

    public function update(Request $request, $id)
    {
        $product = SIV_Product::findOrFail($id);

        $validated = $request->validate([
            'generic_name' => 'nullable|string|max:255',
            'formulation_type' => 'required|integer|in:0,1', // 0=Solid, 1=Liquid
            'strength_amount' => 'required|numeric|min:0',
            'strength_unit' => 'required|string|max:20',
            'total_volume' => 'required|numeric|min:0', // For liquids
            'volume_unit' => 'required|string|max:20',
        ]);

        // Update or Create the Extension Record
        PharmacyDrugDetail::updateOrCreate(
            ['product_id' => $product->id],
            $validated
        );

        return redirect()->route('systemconfiguration9.drugmaster.index')->with('success', 'Clinical details updated.');
    }
}