<?php

namespace App\Http\Controllers\Mortuary;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

// Models
use App\Models\Mortuary\MortuaryRoom;
use App\Models\Mortuary\MortuaryCabinet;

class MortuaryCabinetController extends Controller
{
    /**
     * Store a new Cabinet/Tray inside a specific Room.
     */
    public function store(Request $request, MortuaryRoom $room)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $room->cabinets()->create([
            'name' => $request->name,
            'status' => 'Free'
        ]);

        // Redirect back so the Inertia page refreshes with the new cabinet
        return back()->with('success', 'Cabinet/Tray added successfully.');
    }

    /**
     * Remove a specific Cabinet/Tray.
     */
    public function destroy(MortuaryCabinet $cabinet)
    {
        // Prevent deleting a cabinet that currently holds a body
        if ($cabinet->status !== 'Free') {
             return back()->withErrors(['error' => 'Cannot delete cabinet. It is currently occupied.']);
        }

        $cabinet->delete();
        
        return back()->with('success', 'Cabinet/Tray removed successfully.');
    }
}