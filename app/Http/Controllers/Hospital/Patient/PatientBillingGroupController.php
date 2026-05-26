<?php

namespace App\Http\Controllers\Hospital\Patient;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

// Models
use App\Models\Patient\PatientBillingGroup;
use App\Models\Billing\BlsNhifPackage; // Ensure you created this model in previous steps
use App\Models\Billing\BLSPriceCategory;

class PatientBillingGroupController extends Controller
{
    public function index(Request $request)
    {
        $query = PatientBillingGroup::query();

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%");
        }

        return Inertia::render('SystemConfiguration/FacilitySetup/BillingGroups/Index', [
            'groups' => $query->latest()->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
            'success' => session('success'),
        ]);
    }

    /**
     * Helper to get active price categories
     */
    private function getActivePriceCategories()
    {
        $activePriceCategories = [];
        $priceCategorySettings = BLSPriceCategory::first();

        if ($priceCategorySettings) {
            for ($i = 1; $i <= 15; $i++) {
                // Check if the 'useprice' field is true (or 1)
                if ($priceCategorySettings->{'useprice' . $i}) {
                    $activePriceCategories[] = [
                        'key' => 'price' . $i,   // The actual DB column name (e.g., 'price1')
                        'label' => $priceCategorySettings->{'price' . $i}, // The custom label (e.g., 'Cash Price')
                    ];
                }
            }
        }

        // Final Check: If empty, provide a default to prevent UI errors
        if (empty($activePriceCategories)) {
            $activePriceCategories[] = [
                'key' => 'price1',
                'label' => 'Standard Price'
            ];
        }

        return $activePriceCategories;
    }


    public function create()
    {       
        return Inertia::render('SystemConfiguration/FacilitySetup/BillingGroups/Create', [
             'activePriceCategories' => $this->getActivePriceCategories()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            //'code' => 'nullable|string|max:50',
            'pricecategory' => 'nullable|string|max:50',
            'hasid' => 'boolean',
            'hasceiling' => 'boolean',
            'ceilingamount' => 'nullable|numeric',
            'isinsurance' => 'boolean',
            'isdefault' => 'boolean',
            'isexemption' => 'boolean',
            'inactive' => 'boolean',
            // API Config           
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string|max:255',
            'facility_code' => 'nullable|string|max:50',
            'verification_url' => 'nullable|string|max:255',
            'claims_url' => 'nullable|string|max:255',
        ]);

        PatientBillingGroup::create($validated);

        return redirect()->route('systemconfiguration5.billinggroups.index')
            ->with('success', 'Billing Group created successfully.');
    }

    public function edit($id)
    {
        $group = PatientBillingGroup::findOrFail($id);
        return Inertia::render('SystemConfiguration/FacilitySetup/BillingGroups/Edit', [
            'group' => $group,
            'activePriceCategories' => $this->getActivePriceCategories()
        ]);
    }

    public function update(Request $request, $id)
    {
        $group = PatientBillingGroup::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            //'code' => 'nullable|string|max:50',
            'pricecategory' => 'nullable|string|max:50',
            'hasid' => 'boolean',
            'hasceiling' => 'boolean',
            'ceilingamount' => 'nullable|numeric',
            'isinsurance' => 'boolean',
            'isdefault' => 'boolean',
            'isexemption' => 'boolean',
            'inactive' => 'boolean',
            // API Config
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string|max:255',
            'facility_code' => 'nullable|string|max:50',
            'verification_url' => 'nullable|string|max:255',
            'claims_url' => 'nullable|string|max:255',
        ]);

        $group->update($validated);

        return redirect()->route('systemconfiguration5.billinggroups.index')
            ->with('success', 'Billing Group updated successfully.');
    }

    public function destroy($id)
    {
        try {
            $group = PatientBillingGroup::findOrFail($id);
            // Optional: delete associated packages first
            BlsNhifPackage::where('billing_group_id', $group->id)->delete();
            $group->delete();
            return redirect()->back()->with('success', 'Billing Group deleted.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Cannot delete group. It might be linked to patients.']);
        }
    }

    /**
     * Load Packages from NHIF API
     */
    /**
     * Load Packages from NHIF API
     */
    public function loadPackages(Request $request, PatientBillingGroup $group)
    {
        // 1. INCREASE EXECUTION TIME
        // Allow script to run for up to 5 minutes (300 seconds)
        set_time_limit(300); 

        // Validation
        if (!$group->facility_code || !$group->username || !$group->password) {
            return back()->withErrors(['error' => 'Missing Facility Code, Username, or Password.']);
        }
        if (empty($group->claims_url) && empty($group->url)) {
            return back()->withErrors(['error' => 'No API URL configured.']);
        }

        // URL Setup
        $claimsBaseUrl = rtrim($group->claims_url ?? $group->url, '/');
        $claimsRootUrl = preg_replace('/\/api\/v1\/?$/', '', $claimsBaseUrl);
        
        $serviceUrl = $claimsRootUrl;
        if (!str_ends_with($serviceUrl, '/api/v1')) {
             $serviceUrl .= '/api/v1';
        }

        // Token URLs
        $primaryTokenUrl = $claimsRootUrl . '/Token';
        $verificationBaseUrl = rtrim($group->url, '/');
        $verificationRootUrl = preg_replace('/\/breeze\/?$/', '', $verificationBaseUrl);
        $fallbackTokenUrl = $verificationRootUrl . '/Token';

        $token = null;

        try {
            // Authenticate
            Log::info("NHIF Package Load: Trying Token URL: $primaryTokenUrl");
            $token = $this->fetchToken($primaryTokenUrl, $group);

            if (!$token && $primaryTokenUrl !== $fallbackTokenUrl) {
                Log::warning("Primary Token failed. Trying Fallback: $fallbackTokenUrl");
                $token = $this->fetchToken($fallbackTokenUrl, $group);
            }

            if (!$token) {
                return back()->withErrors(['error' => 'Authentication Failed. Check logs.']);
            }

            // Fetch Packages
            $endpoint = $serviceUrl . '/Packages/GetPricePackageWithExcludedServices';
            Log::info("NHIF Fetching Packages from: $endpoint");

            $response = Http::withToken($token)
                ->withoutVerifying()
                ->timeout(180) // 3 minutes HTTP timeout
                ->get($endpoint, [
                    'FacilityCode' => $group->facility_code
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $packages = $data['PricePackage'] ?? $data; 

                if (!is_array($packages)) {
                    return back()->withErrors(['error' => 'Invalid data format from NHIF.']);
                }

                // --- OPTIMIZED BATCH INSERT ---
                DB::transaction(function () use ($group, $packages) {
                    // 1. Wipe existing
                    BlsNhifPackage::where('billing_group_id', $group->id)->delete();

                    // 2. Prepare Chunks
                    // Inserting 5000 records one by one takes ~30s. Batching takes ~2s.
                    $chunks = array_chunk($packages, 500); 
                    $now = now();

                    foreach ($chunks as $chunk) {
                        $insertData = [];
                        foreach ($chunk as $pkg) {
                            $insertData[] = [
                                'billing_group_id' => $group->id,
                                'item_code'        => $pkg['ItemCode'],
                                'item_name'        => $pkg['ItemName'],
                                'package_id'       => $pkg['PackageID'],
                                'scheme_id'        => $pkg['SchemeID'] ?? null,
                                'unit_price'       => $pkg['UnitPrice'],
                                'is_restricted'    => $pkg['IsRestricted'] ?? false,
                                'created_at'       => $now,
                                'updated_at'       => $now,
                            ];
                        }
                        // Bulk Insert
                        BlsNhifPackage::insert($insertData);
                    }
                });
                
                return back()->with('success', "Loaded " . count($packages) . " packages successfully.");
            }

            return back()->withErrors(['error' => "Fetch Failed: " . $response->status()]);

        } catch (\Exception $e) {
            Log::error("NHIF Error: " . $e->getMessage());
            return back()->withErrors(['error' => 'System Error: ' . $e->getMessage()]);
        }
    }

    /**
     * Helper to perform the Token POST request
     */
    private function fetchToken($url, $group)
    {
        try {
            $response = Http::asForm()
                ->withoutVerifying()
                ->timeout(20)
                ->post($url, [
                    'grant_type' => 'password',
                    'username' => $group->username,
                    'password' => $group->password,
                ]);

            if ($response->successful()) {
                return $response->json()['access_token'] ?? null;
            }
            
            Log::error("NHIF Token Error [{$url}]: " . $response->status() . " - " . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error("NHIF Token Exception [{$url}]: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * View Loaded Packages
     */
    public function viewPackages(Request $request, PatientBillingGroup $group)
    {
        $query = BlsNhifPackage::where('billing_group_id', $group->id);

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('item_name', 'like', "%{$request->search}%")
                  ->orWhere('item_code', 'like', "%{$request->search}%");
            });
        }

        return Inertia::render('SystemConfiguration/FacilitySetup/BillingGroups/Packages', [
            'group' => $group,
            'packages' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }
}