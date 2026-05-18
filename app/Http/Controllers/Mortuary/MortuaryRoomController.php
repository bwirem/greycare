<?php

namespace App\Http\Controllers\Mortuary;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;
use Inertia\Inertia;

// Models
use App\Models\Mortuary\Mortuary;
use App\Models\Mortuary\MortuaryRoom;
use App\Models\Mortuary\MortuaryCabinet;
use App\Models\Billing\BLSItem;
use App\Models\Billing\BLSItemGroup;
use App\Models\Billing\BLSPriceCategory;

class MortuaryRoomController extends Controller
{
    /**
     * Helper to get active price categories (Price1, Price2, etc.)
     * from your hospital's billing settings.
     */
    private function getActivePriceCategories()
    {
        $activePriceCategories = [];
        $priceCategorySettings = BLSPriceCategory::first();

        if ($priceCategorySettings) {
            for ($i = 1; $i <= 10; $i++) {
                if ($priceCategorySettings->{'useprice' . $i}) {
                    $activePriceCategories[] = [
                        'key' => 'price' . $i,
                        'label' => $priceCategorySettings->{'price' . $i},
                    ];
                }
            }
        }
        
        if (empty($activePriceCategories)) {
            $activePriceCategories[] = ['key' => 'price1', 'label' => 'Price'];
        }

        return $activePriceCategories;
    }

    /**
     * Display a listing of mortuary rooms.
     */
    public function index(Request $request)
    {
        $query = MortuaryRoom::with(['mortuary', 'blsItem'])->withCount('cabinets');

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhereHas('mortuary', function($q) use ($request) {
                      $q->where('name', 'like', '%' . $request->search . '%');
                  });
        }

        return Inertia::render('SystemConfiguration/MortuarySetup/MortuaryRooms/Index', [
            'rooms' => $query->orderBy('mortuary_id')->orderBy('name')->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
            'success' => session('success'),
        ]);
    }

    /**
     * Show the form for creating a new room.
     */
    public function create()
    {
        return Inertia::render('SystemConfiguration/MortuarySetup/MortuaryRooms/Create', [
            'mortuaries' => Mortuary::orderBy('name')->get(),
            'activePriceCategories' => $this->getActivePriceCategories(),
        ]);
    }

    /**
     * Store a newly created room and its daily storage charge.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'mortuary_id' => 'required|exists:mortuaries,id',
            
            // Prices (Daily Storage Charges)
            'price1' => 'nullable|numeric|min:0',
            'price2' => 'nullable|numeric|min:0',
            'price3' => 'nullable|numeric|min:0',
            'price4' => 'nullable|numeric|min:0',
            'price5' => 'nullable|numeric|min:0',
            'price6' => 'nullable|numeric|min:0',
            'price7' => 'nullable|numeric|min:0',
            'price8' => 'nullable|numeric|min:0',
            'price9' => 'nullable|numeric|min:0',
            'price10' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $request) {
            
            // A. Separate Room Data from Prices
            $roomData = Arr::except($validated, ['price1', 'price2', 'price3', 'price4','price5','price6','price7','price8','price9','price10']);
            
            // Create Room
            $room = MortuaryRoom::create($roomData);

            // B. Create Billing Item automatically
            $itemGroup = BLSItemGroup::firstOrCreate(['name' => 'Mortuary Charges']);

            BLSItem::create([
                'name' => $room->name . ' (Daily Storage Charge)', 
                'itemgroup_id' => $itemGroup->id,
                'mortuary_room_id' => $room->id, // Link to the new Room
                
                // Set Prices
                'price1' => $request->input('price1', 0),
                'price2' => $request->input('price2', 0),
                'price3' => $request->input('price3', 0),
                'price4' => $request->input('price4', 0),
                'price5' => $request->input('price5', 0),
                'price6' => $request->input('price6', 0),
                'price7' => $request->input('price7', 0),
                'price8' => $request->input('price8', 0),
                'price9' => $request->input('price9', 0),
                'price10' => $request->input('price10', 0),
                
                'addtocart' => true, 
                'defaultqty' => 1,
            ]);
        });

        return redirect()->route('systemconfiguration16.rooms.index')
            ->with('success', 'Room and Daily Storage Charge created successfully.');
    }

    /**
     * Show the form for editing the room (and managing cabinets).
     */
    public function edit(MortuaryRoom $room)
    {
        return Inertia::render('SystemConfiguration/MortuarySetup/MortuaryRooms/Edit', [
            'room' => $room->load(['blsItem', 'cabinets']),
            'mortuaries' => Mortuary::orderBy('name')->get(),
            'activePriceCategories' => $this->getActivePriceCategories(),
        ]);
    }

    /**
     * Update the room and its prices.
     */
    public function update(Request $request, MortuaryRoom $room)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'mortuary_id' => 'required|exists:mortuaries,id',
            
            'price1' => 'nullable|numeric|min:0',
            'price2' => 'nullable|numeric|min:0',
            'price3' => 'nullable|numeric|min:0',
            'price4' => 'nullable|numeric|min:0',
            'price5' => 'nullable|numeric|min:0',
            'price6' => 'nullable|numeric|min:0',
            'price7' => 'nullable|numeric|min:0',
            'price8' => 'nullable|numeric|min:0',
            'price9' => 'nullable|numeric|min:0',
            'price10' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($room, $validated, $request) {
            
            // A. Update Room
            $roomData = Arr::except($validated, ['price1', 'price2', 'price3', 'price4','price5','price6','price7','price8','price9','price10']);
            $room->update($roomData);

            // B. Update Linked Billing Item
            if ($room->blsItem) {
                $blsData = [
                    'name' => $room->name . ' (Daily Storage Charge)',
                ];

                for ($i = 1; $i <= 10; $i++) {
                    if ($request->has("price{$i}")) {
                        $blsData["price{$i}"] = $request->input("price{$i}");
                    }
                }

                $room->blsItem->update($blsData);
            } else {
                // Fallback: If billing item was missing, create it now
                $itemGroup = BLSItemGroup::firstOrCreate(['name' => 'Mortuary Charges']);
                $room->blsItem()->create([
                    'name' => $room->name . ' (Daily Storage Charge)',
                    'itemgroup_id' => $itemGroup->id,
                    'mortuary_room_id' => $room->id,
                    'price1' => $request->input('price1', 0),
                    'price2' => $request->input('price2', 0),
                    'price3' => $request->input('price3', 0),
                    'price4' => $request->input('price4', 0),
                    'price5' => $request->input('price5', 0),
                    'price6' => $request->input('price6', 0), 
                    'price7' => $request->input('price7', 0),
                    'price8' => $request->input('price8', 0),
                    'price9' => $request->input('price9', 0),
                    'price10' => $request->input('price10',0),  
                    'addtocart' => true,
                    'defaultqty' => 1,
                ]);
            }
        });

        return redirect()->route('systemconfiguration16.rooms.index')
            ->with('success', 'Room updated successfully.');
    }

    /**
     * Delete the room and its billing item.
     */
    public function destroy(MortuaryRoom $room)
    {
        if ($room->cabinets()->exists()) {
            return back()->withErrors(['error' => 'Cannot delete room. It contains cabinets/trays. Please delete them first.']);
        }

        DB::transaction(function () use ($room) {
            // 1. Delete linked Billing Item first
            if ($room->blsItem) {
                $room->blsItem->delete();
            }

            // 2. Delete the Room
            $room->delete();
        });

        return redirect()->route('systemconfiguration16.rooms.index')
            ->with('success', 'Room deleted successfully.');
    }

    // =========================================================================
    // CABINET MANAGEMENT (Added / Removed inline from the Room Edit Page)
    // =========================================================================

    public function storeCabinet(Request $request, MortuaryRoom $room)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $room->cabinets()->create([
            'name' => $request->name,
            'status' => 'Free'
        ]);

        return back()->with('success', 'Cabinet/Tray added successfully.');
    }

    public function destroyCabinet(MortuaryCabinet $cabinet)
    {
        // Prevent deleting a cabinet that currently holds a body
        if($cabinet->status !== 'Free') {
             return back()->withErrors(['error' => 'Cannot delete cabinet. It is currently occupied.']);
        }

        $cabinet->delete();
        
        return back()->with('success', 'Cabinet/Tray removed successfully.');
    }
}