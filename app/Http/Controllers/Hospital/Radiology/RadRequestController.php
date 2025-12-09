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
        $query = RadRequest::with(['patient', 'procedure.modality', 'requestedBy'])
            ->where('status', 'ordered') // Only show pending
            ->orderBy('created_at', 'asc');

        if ($request->search) {
            $query->whereHas('patient', function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
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
     * Moves it to the Radiologist's queue (radiology1).
     */
    public function process(Request $request, RadRequest $radRequest)
    {
        // Validation: Ensure modality room is free etc (Optional)
        
        $radRequest->update([
            'status' => 'captured', // Ready for reporting
            'performed_by' => Auth::id(),
            'performed_at' => now(),
            // 'accession_number' => ... (If integrating with PACS)
        ]);

        return redirect()->back()->with('success', 'Image captured. Sent for reporting.');
    }

    /**
     * Reject Request
     */
    public function reject(Request $request, RadRequest $radRequest)
    {
        $request->validate(['reason' => 'required|string']);

        $radRequest->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason,
            'rejected_by' => Auth::id()
        ]);

        return redirect()->back()->with('success', 'Request rejected.');
    }
}