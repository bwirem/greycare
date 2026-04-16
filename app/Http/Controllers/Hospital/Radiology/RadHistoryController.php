<?php

namespace App\Http\Controllers\Hospital\Radiology;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

// Models
use App\Models\Radiology\RadRequest;

class RadHistoryController extends Controller
{
    /**
     * Display a listing of completed Radiology reports.
     */
    public function index(Request $request)
    {
        // --- 1. Set Default Dates & Variables ---
        $today = now()->format('Y-m-d');
        $startDate = $request->input('start_date', $today);
        $endDate = $request->input('end_date', $today);
        $searchTerm = $request->input('search', '');

        // --- 2. Build the Query ---
        $query = RadRequest::with([
            'patient', 
            'procedure.modality', 
            'report' 
        ])->whereIn('status', ['completed', 'finalized', 'reported']);

        // --- 3. Apply Filters ---
        // Search Filter
        if ($searchTerm) {
            $query->whereHas('patient', function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('last_name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('patientcode', 'like', '%' . $searchTerm . '%');
            });
        }

        // Date Filter
        $parsedStartDate = Carbon::parse($startDate)->startOfDay();
        $parsedEndDate = Carbon::parse($endDate)->endOfDay();
        
        // Note: Using updated_at because history represents when the report was completed.
        $query->whereBetween('updated_at', [$parsedStartDate, $parsedEndDate]);

        // Fetch Data
        $studies = $query->orderBy('updated_at', 'desc')->paginate(20)->withQueryString();

        // --- 4. Return Data to Inertia View ---
        return Inertia::render('Hospital/Radiology/History/Index', [
            'studies' => $studies,
            'filters' => [
                'search'     => $searchTerm,
                'start_date' => $startDate,
                'end_date'   => $endDate,
            ]
        ]);
    }
}