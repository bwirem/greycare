<?php

namespace App\Http\Controllers\Hospital\Theatre;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Theatre\TheatreBooking;
use Illuminate\Support\Facades\DB;

class TheatreRecordController extends Controller
{
    public function index(Request $request)
    {
        // 1. Initialize Query
        $query = TheatreBooking::with(['patient', 'procedure', 'doctor', 'theatre']);

        // 2. Handle Search (Crucial for the React Search Bar)
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
        $records = $query->orderBy('scheduled_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // 4. Return to View
        // KEY FIX: Changed 'bookings' to 'records' to match React props
        return Inertia::render('Hospital/Theatre/Records/Index', [
            'records' => $records, 
            'filters' => $request->only(['search']) 
        ]);
    }

    public function show($id)
    {
        // Optional: If you have a View/Show page
        $booking = TheatreBooking::with(['patient', 'procedure', 'doctor', 'theatre'])->findOrFail($id);
        return Inertia::render('Hospital/Theatre/Records/Show', [
            'record' => $booking
        ]);
    }

    public function edit(TheatreBooking $booking)
    {
        return Inertia::render('Hospital/Theatre/Records/Edit', [
            'booking' => $booking->load(['patient', 'procedure'])
        ]);
    }

    public function update(Request $request, TheatreBooking $booking)
    {
        $request->validate([
            'status' => 'required|string',
            'remarks' => 'nullable|string'
        ]);

        $data = ['status' => $request->status, 'remarks' => $request->remarks];

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
}