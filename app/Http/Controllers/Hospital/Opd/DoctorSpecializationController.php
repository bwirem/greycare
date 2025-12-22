<?php

namespace App\Http\Controllers\Hospital\Opd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

// Models
use App\Models\Opd\Config\DoctorSpecialization;
use App\Models\Opd\Config\ConsultationChargeRule;
use App\Models\Billing\BLSItem;

class DoctorSpecializationController extends Controller
{
    /**
     * Display a listing of specializations.
     */
    public function index(Request $request)
    {
        $query = DoctorSpecialization::with(['chargeRules.billItem']);

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        return Inertia::render('SystemConfiguration/FacilitySetup/Specializations/Index', [
            'specializations' => $query->latest()->paginate(10),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new specialization.
     */
    public function create()
    {
        return Inertia::render('SystemConfiguration/FacilitySetup/Specializations/Create', [
            // Fetch Bill Items that are likely Consultations (You might want to filter by Item Group here)
            'billItems' => BLSItem::select('id', 'name', 'price1')->orderBy('name')->get()
        ]);
    }

    /**
     * Store a newly created specialization and its charge rules.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:doctor_specializations,name',
            'revisit_days' => 'required|integer|min:0',
            
            // Charge Rules (New Case)
            'new_visit_item_id' => 'required|exists:bls_items,id',
            
            // Charge Rules (Revisit)
            'revisit_item_id' => 'required|exists:bls_items,id',
        ]);

        DB::transaction(function () use ($validated) {
            // 1. Create Specialization
            $spec = DoctorSpecialization::create([
                'name' => $validated['name'],
                'revisit_days' => $validated['revisit_days'],
            ]);

            // 2. Create 'New Case' Rule
            ConsultationChargeRule::create([
                'specialization_id' => $spec->id,
                'visit_type' => 'new',
                'bill_item_id' => $validated['new_visit_item_id'],
            ]);

            // 3. Create 'Revisit' Rule
            ConsultationChargeRule::create([
                'specialization_id' => $spec->id,
                'visit_type' => 'revisit',
                'bill_item_id' => $validated['revisit_item_id'],
            ]);
        });

        return redirect()->route('systemconfiguration5.specializations.index')
            ->with('success', 'Specialization and pricing rules created.');
    }

    /**
     * Show the form for editing the specified specialization.
     */
    public function edit($id)
    {
        $specialization = DoctorSpecialization::with('chargeRules')->findOrFail($id);

        // Extract existing rule IDs for the frontend form
        $newRule = $specialization->getRule('new');
        $revisitRule = $specialization->getRule('revisit');

        // Append these IDs to the object so React form can read them easily
        $specialization->new_visit_item_id = $newRule?->bill_item_id;
        $specialization->revisit_item_id = $revisitRule?->bill_item_id;

        return Inertia::render('SystemConfiguration/FacilitySetup/Specializations/Edit', [
            'specialization' => $specialization,
            'billItems' => BLSItem::select('id', 'name', 'price1')->orderBy('name')->get()
        ]);
    }

    /**
     * Update the specified specialization.
     */
    public function update(Request $request, $id)
    {
        $specialization = DoctorSpecialization::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|unique:doctor_specializations,name,' . $id,
            'revisit_days' => 'required|integer|min:0',
            'new_visit_item_id' => 'required|exists:bls_items,id',
            'revisit_item_id' => 'required|exists:bls_items,id',
        ]);

        DB::transaction(function () use ($specialization, $validated) {
            // 1. Update Basic Info
            $specialization->update([
                'name' => $validated['name'],
                'revisit_days' => $validated['revisit_days'],
            ]);

            // 2. Update/Create 'New Case' Rule
            ConsultationChargeRule::updateOrCreate(
                ['specialization_id' => $specialization->id, 'visit_type' => 'new'],
                ['bill_item_id' => $validated['new_visit_item_id']]
            );

            // 3. Update/Create 'Revisit' Rule
            ConsultationChargeRule::updateOrCreate(
                ['specialization_id' => $specialization->id, 'visit_type' => 'revisit'],
                ['bill_item_id' => $validated['revisit_item_id']]
            );
        });

        return redirect()->route('systemconfiguration5.specializations.index')
            ->with('success', 'Specialization updated.');
    }

    /**
     * Remove the specified specialization.
     */
    public function destroy($id)
    {
        $specialization = DoctorSpecialization::findOrFail($id);
        
        // Rules delete automatically due to cascade, but explicit is safer
        // Doctor links set to null due to nullOnDelete
        $specialization->delete();

        return redirect()->back()->with('success', 'Specialization deleted.');
    }
}