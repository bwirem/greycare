<?php

namespace App\Http\Controllers\BloodBank;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// Models
use App\Models\BloodBank\BbDonor;
use App\Models\BloodBank\BbDonation;
use App\Models\BloodBank\BbBloodBag;
use App\Models\BloodBank\BbComponentType;

class BbDonorController extends Controller
{
    /**
     * List Donors
     */
    public function index(Request $request)
    {
        $query = BbDonor::query();

        if ($request->search) {
            $query->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('surname', 'like', "%{$request->search}%")
                  ->orWhere('donor_number', 'like', "%{$request->search}%")
                  ->orWhere('contact_no', 'like', "%{$request->search}%");
        }

        return Inertia::render('BloodBank/Donors/Index', [
            'donors' => $query->latest()->paginate(15)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Show Registration Form
     */
    public function create()
    {
        return Inertia::render('BloodBank/Donors/Create');
    }

    /**
     * Store New Donor
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'gender' => 'required|in:Male,Female',
            'birthdate' => 'required|date|before:today',
            'contact_no' => 'required|string|max:20',
            'blood_group' => 'nullable|string|max:5', // Can be unknown initially
            'weight' => 'required|numeric|min:45', // Min weight for donation usually 45-50kg
        ]);

        $donor = BbDonor::create([
            'donor_number' => 'DNR-' . strtoupper(uniqid()), // Simple ID gen
            'first_name' => $validated['first_name'],
            'surname' => $validated['surname'],
            'gender' => $validated['gender'],
            'birthdate' => $validated['birthdate'],
            'contact_no' => $validated['contact_no'],
            'blood_group' => $validated['blood_group'],
            'weight' => $validated['weight'],
            'status' => 'Eligible' // Logic to auto-defer based on age/weight can go here
        ]);

        return redirect()->route('bloodbank0.show', $donor->id)
            ->with('success', 'Donor registered successfully.');
    }

    /**
     * Show Donor Profile & History
     */
    public function show(BbDonor $donor)
    {
        $donor->load(['donations.bag']); // Load history

        return Inertia::render('BloodBank/Donors/Show', [
            'donor' => $donor,
            'component_types' => BbComponentType::select('id', 'name')->get(),
            'history' => $donor->donations
        ]);
    }

    /**
     * Record a Donation (Bleeding)
     */
    public function donate(Request $request, BbDonor $donor)
    {
        $request->validate([
            'volume_collected' => 'required|numeric|min:300|max:550',
            'bag_serial_number' => 'required|string|unique:bb_donations,bag_serial_number',
            'bb_component_type_id' => 'required|exists:bb_component_types,id',
            'bp' => 'required|string',
            'hb_level' => 'required|numeric|min:12', // Minimum Hb Check
        ]);

        DB::transaction(function () use ($request, $donor) {
            
            // 1. Create Donation Record
            $donation = BbDonation::create([
                'bb_donor_id' => $donor->id,
                'donation_date' => now(),
                'bag_serial_number' => $request->bag_serial_number,
                'volume_collected' => $request->volume_collected,
                'bp' => $request->bp,
                'hb_level' => $request->hb_level,
                'weight' => $donor->weight, // Current weight snapshot
                'collected_by' => Auth::id(),
                'status' => 'Collected'
            ]);

            // 2. Create the Blood Bag in Inventory (Quarantine Status)
            $component = BbComponentType::find($request->bb_component_type_id);
            
            BbBloodBag::create([
                'bb_donation_id' => $donation->id,
                'bb_component_type_id' => $component->id,
                'bag_serial_number' => $request->bag_serial_number,
                'blood_group' => $donor->blood_group ?? 'Unknown', // Update later if unknown
                'collected_at' => now(),
                'expires_at' => now()->addDays($component->shelf_life_days),
                'status' => 'Quarantine', // Must test first
                'location' => 'Fridge 1'
            ]);

            // 3. Update Donor Last Donation Date
            $donor->update(['last_donation_date' => now()]);
        });

        return redirect()->back()->with('success', 'Donation recorded. Bag created in Quarantine.');
    }

    /**
     * Test and Make Blood Bag Available
     */
    public function makeAvailable(Request $request, BbDonation $donation)
    {
        $request->validate([
            'blood_group' => 'required|string|max:5',
        ]);

        DB::transaction(function () use ($request, $donation) {
            // 1. Update Donation Status
            $donation->update(['status' => 'Tested']);

            // 2. Update Bag Status & Assure Blood Group
            if ($donation->bag) {
                $donation->bag->update([
                    'status' => 'Available',
                    'blood_group' => $request->blood_group
                ]);
            }

            // 3. Update Donor's blood group if it was previously unknown
            $donor = $donation->donor;
            if (in_array($donor->blood_group, [null, 'Unknown', ''])) {
                $donor->update(['blood_group' => $request->blood_group]);
            }
        });

        return redirect()->back()->with('success', 'Blood test successful. Bag is now Available in inventory.');
    }
}