<?php

namespace App\Http\Controllers\Hospital\Ipd;

use App\Http\Controllers\Controller;
use App\Models\Ipd\IpdBed;
use App\Models\Ipd\IpdRoom;
use App\Models\Ipd\IpdWard;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IpdRoomController extends Controller
{
    public function index(Request $request)
    {
        $query = IpdRoom::with(['ward'])->withCount('beds');

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhereHas('ward', function($q) use ($request) {
                      $q->where('name', 'like', '%' . $request->search . '%');
                  });
        }

        return Inertia::render('SystemConfiguration/FacilitySetup/Rooms/Index', [
            'rooms' => $query->orderBy('ward_id')->orderBy('name')->paginate(10)->withQueryString(),
            'wards' => IpdWard::all(), // Passed for filtering/modal context if needed
            'filters' => $request->only(['search']),
            'success' => session('success'),
        ]);
    }

    public function create()
    {
        return Inertia::render('SystemConfiguration/FacilitySetup/Rooms/Create', [
            'wards' => IpdWard::orderBy('name')->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'ward_id' => 'required|exists:ipd_wards,id'
        ]);

        IpdRoom::create($request->only(['name', 'ward_id']));

        return redirect()->route('systemconfiguration5.rooms.index')
            ->with('success', 'Room created successfully.');
    }

    public function edit(IpdRoom $room)
    {
        return Inertia::render('SystemConfiguration/FacilitySetup/Rooms/Edit', [
            'room' => $room->load('beds'), // Load beds for the manager
            'wards' => IpdWard::orderBy('name')->get()
        ]);
    }

    public function update(Request $request, IpdRoom $room)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'ward_id' => 'required|exists:ipd_wards,id'
        ]);

        $room->update($request->only(['name', 'ward_id']));

        return redirect()->route('systemconfiguration5.rooms.index')
            ->with('success', 'Room updated successfully.');
    }

    public function destroy(IpdRoom $room)
    {
        if ($room->beds()->exists()) {
            return back()->withErrors(['error' => 'Cannot delete room. It contains beds.']);
        }
        $room->delete();
        return redirect()->route('systemconfiguration5.rooms.index')->with('success', 'Room deleted successfully.');
    }

    // --- BED MANAGEMENT ---

    public function storeBed(Request $request, IpdRoom $room)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $room->beds()->create([
            'name' => $request->name,
            'status' => 'Free'
        ]);

        // Redirect back to the Edit page (or Index) with success
        return back()->with('success', 'Bed added successfully.');
    }

    public function destroyBed(IpdBed $bed)
    {
        // Optional: Check if bed is occupied before deleting
        if($bed->status !== 'Free') {
             return back()->withErrors(['error' => 'Cannot delete bed. It is currently in use.']);
        }

        $bed->delete();
        return back()->with('success', 'Bed removed successfully.');
    }
}