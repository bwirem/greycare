<?php

namespace App\Http\Controllers\BloodBank;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// Models
use App\Models\BloodBank\BbIssueRequest;
use App\Models\BloodBank\BbBloodBag;
use App\Models\BloodBank\BbCrossmatch;

class BbCrossmatchController extends Controller
{
    /**
     * List Pending Requests
     */
    public function index(Request $request)
    {
        $query = BbIssueRequest::with(['patient', 'componentType', 'requestedBy'])
            ->where('status', '!=', 'Issued') // Show Requested or Crossmatched
            ->orderBy('urgency', 'desc') // Emergency first
            ->orderBy('created_at', 'asc');

        if ($request->search) {
            $query->whereHas('patient', function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%");
            });
        }

        return Inertia::render('BloodBank/Crossmatch/Index', [
            'requests' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Show Crossmatch Form (Select Bag)
     */
    public function create(BbIssueRequest $request)
    {
        $request->load(['patient', 'componentType', 'requestedBy']);

        // Find Available Bags matching Component and Blood Group
        $compatibleBags = BbBloodBag::where('bb_component_type_id', $request->bb_component_type_id)
            ->where('blood_group', $request->blood_group_required)
            ->where('status', 'Available') // Only stock that is cleared
            ->where('expires_at', '>', now())
            ->orderBy('expires_at', 'asc') // FIFO (First In First Out)
            ->get();

        return Inertia::render('BloodBank/Crossmatch/Process', [
            'issue_request' => $request, // 'request' is reserved in Laravel
            'available_bags' => $compatibleBags
        ]);
    }

    /**
     * Save Crossmatch & Issue
     */
    public function store(Request $request, BbIssueRequest $bbIssueRequest)
    {
        // Note: Using route param binding $bbIssueRequest (must match route {request})
        // If route is /{request}, Laravel binds it automatically if variable name matches or logic handles it. 
        // To be safe, ensure route param is {request} and variable here is $requestModel or similar, 
        // OR standard binding: Route::post('/{bbIssueRequest}...)
        
        // Let's assume standard ID passing for robustness
        
        $validated = $request->validate([
            'bb_blood_bag_id' => 'required|exists:bb_blood_bags,id',
            'compatibility_result' => 'required|in:Compatible,Incompatible',
            'action' => 'required|in:Issue,Reserve'
        ]);

        DB::transaction(function () use ($validated, $bbIssueRequest) {
            
            // 1. Record Crossmatch Result
            BbCrossmatch::create([
                'bb_issue_request_id' => $bbIssueRequest->id,
                'bb_blood_bag_id' => $validated['bb_blood_bag_id'],
                'patientcode' => $bbIssueRequest->patientcode,
                'compatibility_result' => $validated['compatibility_result'],
                'performed_by' => Auth::id(),
                'performed_at' => now(),
                'status' => $validated['action'] == 'Issue' ? 'Issued' : 'Reserved',
                'reserved_until' => $validated['action'] == 'Reserve' ? now()->addHours(24) : null
            ]);

            // 2. Update Bag Status
            $bag = BbBloodBag::find($validated['bb_blood_bag_id']);
            
            if ($validated['compatibility_result'] === 'Compatible') {
                if ($validated['action'] === 'Issue') {
                    $bag->update(['status' => 'Transfused']); // Or 'Issued'
                    $bbIssueRequest->update(['status' => 'Issued', 'issued_bag_id' => $bag->id, 'issued_at' => now(), 'issued_by' => Auth::id()]);
                } else {
                    $bag->update(['status' => 'Reserved']);
                    $bbIssueRequest->update(['status' => 'Crossmatched']);
                }
            }
        });

        return redirect()->route('bloodbank2.index')->with('success', 'Crossmatch recorded successfully.');
    }
}