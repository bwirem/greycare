<?php

namespace App\Http\Controllers\Mortuary;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Mortuary\MortuaryRecord;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class MortuaryRecordController extends Controller
{
    public function index(Request $request)
    {
        $query = MortuaryRecord::where('status', 'Stored')->orderBy('created_at', 'desc');

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('last_name', 'like', "%{$request->search}%")
                  ->orWhere('patient_code', 'like', "%{$request->search}%");
            });
        }

        return Inertia::render('Mortuary/Records/Index', [
            'records' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only('search')
        ]);
    }

    public function create()
    {
        return Inertia::render('Mortuary/Records/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_code' => 'nullable|string',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'gender' => 'required|in:Male,Female,Other',
            'age' => 'nullable|integer',
            'date_of_death' => 'required|date',
            'cabinet_number' => 'nullable|string|max:50',
            'cause_of_death' => 'nullable|string'
        ]);

        $validated['received_by_user_id'] = Auth::id();
        $validated['status'] = 'Stored';

        MortuaryRecord::create($validated);

        return redirect()->route('mortuary0.index')->with('success', 'Deceased record registered successfully.');
    }
}