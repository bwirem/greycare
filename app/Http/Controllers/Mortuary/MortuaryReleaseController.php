<?php

namespace App\Http\Controllers\Mortuary;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Mortuary\MortuaryRecord;
use App\Models\Mortuary\MortuaryRelease;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MortuaryReleaseController extends Controller
{
    public function index(Request $request)
    {
        $query = MortuaryRecord::where('status', 'Stored')->orderBy('created_at', 'desc');

        if ($request->search) {
            $query->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('last_name', 'like', "%{$request->search}%");
        }

        return Inertia::render('Mortuary/Releases/Index', [
            'records' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only('search')
        ]);
    }

    public function create(MortuaryRecord $record)
    {
        return Inertia::render('Mortuary/Releases/Create', [
            'record' => $record
        ]);
    }

    public function store(Request $request, MortuaryRecord $record)
    {
        $validated = $request->validate([
            'receiver_name' => 'required|string|max:255',
            'receiver_id_number' => 'required|string|max:100',
            'relationship' => 'required|string|max:100',
            'released_at' => 'required|date',
            'remarks' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated, $record) {
            // 1. Create Release Log
            MortuaryRelease::create([
                'mortuary_record_id' => $record->id,
                'receiver_name' => $validated['receiver_name'],
                'receiver_id_number' => $validated['receiver_id_number'],
                'relationship' => $validated['relationship'],
                'released_at' => $validated['released_at'],
                'remarks' => $validated['remarks'],
                'released_by_user_id' => Auth::id(),
            ]);

            // 2. Update Record Status
            $record->update(['status' => 'Released']);
        });

        return redirect()->route('mortuary1.index')->with('success', 'Body released successfully.');
    }
}