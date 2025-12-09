<?php

namespace App\Http\Controllers\Hospital\Theatre;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Theatre\TheatreBooking;

class TheatreRecordController extends Controller
{
    public function index()
    {
        // Patients currently in theatre or scheduled for today
        $bookings = TheatreBooking::with(['patient', 'procedure'])
            ->whereIn('status', ['Scheduled', 'In-Progress'])
            ->whereDate('scheduled_at', today())
            ->orderBy('scheduled_at')
            ->paginate(15);

        return Inertia::render('Hospital/Theatre/Records/Index', [
            'bookings' => $bookings
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
            'status' => 'required|in:In-Progress,Recovery',
            'remarks' => 'nullable|string'
        ]);

        $data = ['status' => $request->status, 'remarks' => $request->remarks];

        if ($request->status === 'In-Progress' && !$booking->started_at) {
            $data['started_at'] = now();
        }
        if ($request->status === 'Recovery') {
            $data['ended_at'] = now(); // Surgery finished, moved to recovery
        }

        $booking->update($data);

        return redirect()->route('theatre.records.index')->with('success', 'Surgery record updated.');
    }
}