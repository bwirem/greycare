<?php

namespace App\Http\Controllers\Hospital\Laboratory;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

// Models
use App\Models\Laboratory\LabSample;

class LabHistoryController extends Controller
{
    /**
     * Display a listing of completed lab tests.
     */
    public function index(Request $request)
    {
        // --- 1. Set Default Dates & Variables ---
        $today = now()->format('Y-m-d');
        $startDate = $request->input('start_date', $today);
        $endDate = $request->input('end_date', $today);
        $searchTerm = $request->input('search', '');

        // --- 2. Build the Query ---
        $query = LabSample::with([
            'prescription.patient', 
            'prescription.panel', 
            'results.parameter.ranges' 
        ])->whereIn('status', ['completed', 'verified']);

        // --- 3. Apply Filters ---
        // Search Filter
        if ($searchTerm) {
            $query->whereHas('prescription.patient', function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('last_name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('patientcode', 'like', '%' . $searchTerm . '%');
            });
        }

        // Date Filter
        $parsedStartDate = Carbon::parse($startDate)->startOfDay();
        $parsedEndDate = Carbon::parse($endDate)->endOfDay();
        $query->whereBetween('created_at', [$parsedStartDate, $parsedEndDate]);

        // Fetch Data
        $samples = $query->orderBy('created_at', 'desc')->paginate(20)->withQueryString();

        // --- 4. Return Data to Inertia View ---
        return Inertia::render('Hospital/Laboratory/History/Index', [
            'samples' => $samples,
            'filters' => [
                'search'     => $searchTerm,
                'start_date' => $startDate,
                'end_date'   => $endDate,
            ]
        ]);
    }
}