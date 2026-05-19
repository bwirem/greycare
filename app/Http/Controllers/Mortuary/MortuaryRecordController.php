<?php

namespace App\Http\Controllers\Mortuary;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

use App\Models\Mortuary\Mortuary;
use App\Models\Mortuary\MortuaryCabinet;
use App\Models\Mortuary\MortuaryRecord;
use App\Models\Patient\PatientBillingGroup;

class MortuaryRecordController extends Controller
{
    /**
     * Display all Pending bodies (From wards or waiting for cabinet).
     */
    public function index(Request $request)
    {
        $query = MortuaryRecord::with(['mortuary', 'room', 'cabinet'])
            ->where('status', ['Stored', 'Pending'])
            ->orderBy('created_at', 'desc');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
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

    /**
     * Show form for a completely NEW outside body.
     */
    public function create()
    {
        return $this->renderCreateEditForm();
    }

    /**
     * Show form to ASSIGN STORAGE to an EXISTING Pending body (From Ward).
     */
    public function edit(MortuaryRecord $record)
    {
        return $this->renderCreateEditForm($record);
    }

    /**
     * Shared method to render the UI for both New and Existing bodies.
     */
    private function renderCreateEditForm(?MortuaryRecord $record = null)
    {
        $mortuaries = Mortuary::with([
            'rooms.cabinets' => function($q) {
                $q->where('status', 'Free');
            }
        ])->orderBy('name')->get();

        $billingGroups = PatientBillingGroup::orderBy('name')->get();

        return Inertia::render('Mortuary/Records/Create', [
            'existingRecord' => $record,
            'mortuaries' => $mortuaries,
            'billingGroups' => $billingGroups
        ]);
    }

    /**
     * Store a completely new record.
     */
    public function store(Request $request)
    {
        $validated = $this->validateRecord($request);

        DB::transaction(function () use ($validated) {
            $cabinet = MortuaryCabinet::findOrFail($validated['cabinet_id']);

            if ($cabinet->status !== 'Free') {
                throw new \Exception('Selected cabinet is already occupied.');
            }

            MortuaryRecord::create(array_merge($validated, [
                'cabinet_number' => $cabinet->name,
                'received_by_user_id' => Auth::id(),
                'status' => 'Stored'
            ]));

            $cabinet->update(['status' => 'Occupied']);
        });

        return redirect()->route('mortuary0.index')->with('success', 'New body registered and stored successfully.');
    }

    /**
     * Update an existing pending record (From Ward) with storage.
     */
    public function update(Request $request, MortuaryRecord $record)
    {
        $validated = $this->validateRecord($request);

        DB::transaction(function () use ($validated, $record) {
            $cabinet = MortuaryCabinet::findOrFail($validated['cabinet_id']);

            if ($cabinet->status !== 'Free') {
                throw new \Exception('Selected cabinet is already occupied.');
            }

            $record->update(array_merge($validated, [
                'cabinet_number' => $cabinet->name,
                'received_by_user_id' => Auth::id(),
                'status' => 'Stored'
            ]));

            $cabinet->update(['status' => 'Occupied']);
        });

        return redirect()->route('mortuary0.index')->with('success', 'Storage assigned to ward body successfully.');
    }

    /**
     * Validation rules used by both Store and Update.
     */
    private function validateRecord(Request $request)
    {
        return $request->validate([
            'patient_code' => 'nullable|string',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'gender' => 'required|in:Male,Female,Other',
            'age' => 'nullable|integer',
            'date_of_death' => 'required|date',

            'mortuary_id' => 'required|exists:mortuaries,id',
            'room_id' => 'required|exists:mortuary_rooms,id',
            'cabinet_id' => 'required|exists:mortuary_cabinets,id',
            'billing_group_id' => 'required|exists:patient_billing_groups,id',

            'cause_of_death' => 'nullable|string'
        ]);
    }
}