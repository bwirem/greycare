<?php

namespace App\Http\Controllers\Hospital\Radiology;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// Models
use App\Models\Radiology\RadRequest;

class RadRequestController extends Controller
{
    /**
     * List Pending Requests (Ordered status)
     */
    public function index(Request $request)
    {
        // Eager load relationships:
        // 1. Patient: For name/code
        // 2. Procedure.Modality: For exam name and machine type (X-Ray, CT)
        // 3. RequestedBy: Doctor name
        // 4. OpdBooking.BillingGroup: To show if patient is Cash or Insurance
        $query = RadRequest::with([
                'patient', 
                'procedure.modality', 
                'requestedBy', 
                'booking.billingGroup'
            ])
            ->where('status', 'ordered') // Only show pending/ordered requests
            ->orderBy('created_at', 'asc');

        if ($request->search) {
            $query->whereHas('patient', function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('last_name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%");
            });
        }

        return Inertia::render('Hospital/Radiology/Requests/Index', [
            'requests' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Process Request (Mark as "Image Captured")
     * Moves it to the Radiologist's reporting queue.
     */
    public function process(Request $request, RadRequest $radRequest)
    {
        // --- SECURITY CHECK: Prevent processing if unpaid ---
        // This stops technicians from proceeding via URL manipulation or if the button was enabled by mistake.
        if ($radRequest->payment_status === 'unpaid') {
            return redirect()->back()->with('error', 'Cannot capture image. The request has not been paid for.');
        }
        // ----------------------------------------------------
        
        $radRequest->update([
            'status' => 'captured', // Updates status to move to next stage
            'technician_id' => Auth::id(),
            'performed_at' => now(),
            // 'accession_number' => ... (If integrating with PACS, this is where you'd confirm it)
        ]);

        return redirect()->back()->with('success', 'Image captured successfully. Sent for reporting.');
    }

    /**
     * Reject Request
     * Used when the request is invalid, duplicate, or patient refused.
     */
    public function reject(Request $request, RadRequest $radRequest)
    {
        $request->validate([
            'reason' => 'required|string|max:255'
        ]);

        $radRequest->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason,
            'technician_id' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'Request rejected.');
    }
}