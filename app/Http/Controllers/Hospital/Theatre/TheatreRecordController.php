<?php

namespace App\Http\Controllers\Hospital\Theatre;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\Theatre\TheatreBooking;
use App\Models\Diagnosis\DxtDiagnosesIcd; // Import the Model

class TheatreRecordController extends Controller
{
    /**
     * Display the list of patients currently in theatre (Intra-operative).
     */
    public function index(Request $request)
    {
        // 1. Initialize Query (Eager Load 'theatre' to get room name)
        $query = TheatreBooking::with(['patient', 'procedure', 'doctor', 'theatre'])
            // Filter to show only active surgeries or scheduled for today
            ->whereIn('status', ['Scheduled', 'In Progress'])
            ->whereDate('scheduled_at', today());

        // 2. Handle Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('patientcode', 'like', "%{$search}%")
                  ->orWhereHas('patient', function($subQ) use ($search) {
                      $subQ->where('first_name', 'like', "%{$search}%")
                           ->orWhere('last_name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('procedure', function($subQ) use ($search) {
                      $subQ->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // 3. Ordering and Pagination
        $records = $query->orderByRaw("FIELD(status, 'In Progress', 'Scheduled')") // Show 'In Progress' first
            ->orderBy('scheduled_at', 'asc')
            ->paginate(15)
            ->withQueryString();

        // 4. Return to View
        return Inertia::render('Hospital/Theatre/Records/Index', [
            'records' => $records, 
            'filters' => $request->only(['search']) 
        ]);
    }

    public function edit(TheatreBooking $booking)
    {
        return Inertia::render('Hospital/Theatre/Records/Edit', [
            'booking' => $booking->load(['patient', 'procedure', 'doctor', 'theatre'])
        ]);
    }

    public function update(Request $request, TheatreBooking $booking)
    {
        $request->validate([
            'status' => 'required|string',
            'remarks' => 'nullable|string',
            'icd_diagnosis_id' => 'nullable|exists:dxt_diagnoses_icd,id'
        ]);

        $data = [
            'status' => $request->status, 
            'remarks' => $request->remarks,
            // Ensure you have added 'icd_diagnosis_id' to your theatre_bookings table
            'icd_diagnosis_id' => $request->icd_diagnosis_id 
        ];

        // Auto-timestamp logic
        if ($request->status === 'In Progress' && !$booking->started_at) {
            $data['started_at'] = now();
        }
        if ($request->status === 'Recovery') {
            $data['ended_at'] = now(); 
        }

        $booking->update($data);

        return redirect()->route('theatre2.index')->with('success', 'Surgery record updated.');
    }

    /**
     * AJAX Search for React AsyncSelect
     */
    public function searchDiagnosis(Request $request)
    {
        $query = $request->input('query');

        if (!$query) return response()->json([]);

        $results = DxtDiagnosesIcd::select('id', 'name', 'code')
            ->where('name', 'like', "%{$query}%")
            ->orWhere('code', 'like', "%{$query}%")
            ->limit(20)
            ->get()
            ->map(function ($item) {
                return [
                    'value' => $item->id,
                    'label' => "{$item->code} - {$item->name}"
                ];
            });

        return response()->json($results);
    }
}