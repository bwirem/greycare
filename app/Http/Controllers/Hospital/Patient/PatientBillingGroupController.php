<?php

namespace App\Http\Controllers\Hospital\Patient;

use App\Http\Controllers\Controller;
use App\Models\Patient\PatientBillingGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
            'groups' => $query->latest()->paginate(10),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/FacilitySetup/BillingGroups/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',          
            'pricecategory' => 'nullable|string|max:50',
            // Configuration Flags (Integers/Booleans based on your migration)
            'hasid' => 'boolean',
            'hasceiling' => 'boolean',
            'ceilingamount' => 'nullable|numeric',
            'isinsurance' => 'boolean',
            'isdefault' => 'boolean',
            'isexemption' => 'boolean',
            'inactive' => 'boolean',
            // API Credentials
            'verification_url' => 'nullable|string|max:255',
            'claims_url' => 'nullable|string|max:255',
            'facility_code' => 'nullable|string|max:50',
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string|max:255',
        ]);

        PatientBillingGroup::create($validated);

        return redirect()->route('systemconfiguration5.billinggroups.index')
            ->with('success', 'Billing Group created successfully.');
    }

    public function edit($id)
    {
        $group = PatientBillingGroup::findOrFail($id);
        return Inertia::render('SystemConfiguration/FacilitySetup/BillingGroups/Edit', [
            'group' => $group
        ]);
    }

    public function update(Request $request, $id)
    {
        $group = PatientBillingGroup::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',           
            'pricecategory' => 'nullable|string|max:50',
            'hasid' => 'boolean',
            'hasceiling' => 'boolean',
            'ceilingamount' => 'nullable|numeric',
            'isinsurance' => 'boolean',
            'isdefault' => 'boolean',
            'isexemption' => 'boolean',
            'inactive' => 'boolean',
            // API Credentials
            'verification_url' => 'nullable|string|max:255',
            'claims_url' => 'nullable|string|max:255',
            'facility_code' => 'nullable|string|max:50',
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string|max:255',
        ]);

        $group->update($validated);

        return redirect()->route('systemconfiguration5.billinggroups.index')
            ->with('success', 'Billing Group updated successfully.');
    }

    public function destroy($id)
    {
        try {
            $group = PatientBillingGroup::findOrFail($id);
            $group->delete();
            return redirect()->back()->with('success', 'Billing Group deleted.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Cannot delete group. It might be linked to patients.']);
        }
    }

     /**
     * Load Packages from NHIF (Replicates your PHP script)
     */
    public function loadPackages(Request $request, PatientBillingGroup $group)
    {
        if (!$group->facility_code || !$group->username || !$group->password) {
            return back()->withErrors(['error' => 'Missing Facility Code or Credentials.']);
        }

        // 1. Determine Endpoints
        // Your script uses a different URL for claims/packages than verification
        // Default to the one saved in 'claims_url', or fallback to 'url' logic if not set
        $baseUrl = rtrim($group->claims_url ?? $group->url, '/'); 
        
        // Token Endpoint (Usually common)
        // Logic: http://test.nhif.or.tz/claimsserver/Token
        // Remove 'api/v1' if present to find root
        $rootUrl = preg_replace('/\/api\/v1\/?$/', '', $baseUrl);
        $tokenUrl = $rootUrl . '/Token';
        
        // Service Endpoint: http://test.nhif.or.tz/claimsserver/api/v1/
        $serviceUrl = $rootUrl . '/api/v1/';

        try {
            // 2. Get Token
            $tokenResponse = Http::asForm()->withoutVerifying()->post($tokenUrl, [
                'grant_type' => 'password',
                'username' => $group->username,
                'password' => $group->password,
            ]);

            if ($tokenResponse->failed()) {
                return back()->withErrors(['error' => 'Authentication Failed: ' . $tokenResponse->body()]);
            }
            $token = $tokenResponse->json()['access_token'];

            // 3. Fetch Packages
            // Replicates: Packages/GetPricePackageWithExcludedServices?FacilityCode=...
            $endpoint = $serviceUrl . 'Packages/GetPricePackageWithExcludedServices';
            
            // Increase timeout for large package lists (your script had 90s)
            $response = Http::withToken($token)
                ->timeout(120) 
                ->withoutVerifying()
                ->get($endpoint, [
                    'FacilityCode' => $group->facility_code
                ]);

            if ($response->successful()) {
                $packages = $response->json();
                
                // TODO: Save $packages to your 'bill_items' or 'price_list' table here.
                // Example logic:
                // foreach($packages as $pkg) {
                //      BillItem::updateOrCreate(['code' => $pkg['ItemCode']], ['price' => $pkg['Amount'] ...]);
                // }
                
                $count = count($packages);
                return back()->with('success', "Successfully loaded {$count} packages from NHIF.");
            }

            return back()->withErrors(['error' => 'Failed to fetch packages: ' . $response->body()]);

        } catch (\Exception $e) {
            Log::error("NHIF Package Load Error: " . $e->getMessage());
            return back()->withErrors(['error' => 'System Error: ' . $e->getMessage()]);
        }
    }
}