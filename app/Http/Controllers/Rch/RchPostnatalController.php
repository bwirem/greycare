<?php

namespace App\Http\Controllers\Rch;

use App\Http\Controllers\Controller;
use App\Models\Rch\RchDelivery;
use App\Models\Rch\RchPncVisit;
use App\Models\Rch\RchAncPregnancy;
use App\Models\Opd\OpdBooking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class RchPostnatalController extends Controller
{
    /**
     * Display Deliveries and PNC Visits.
     */
    public function index(Request $request)
    {
        // We return two collections: Recent Deliveries and Recent PNC Visits
        
        $deliveriesQuery = RchDelivery::query()
            ->with(['pregnancy.patient:code,first_name,last_name'])
            ->latest('delivery_datetime');

        $pncQuery = RchPncVisit::query()
            ->with(['patient:code,first_name,last_name'])
            ->latest('created_at');

        if ($request->filled('search')) {
            $search = $request->search;
            // Search logic for deliveries
            $deliveriesQuery->whereHas('pregnancy.patient', function($q) use ($search){
                 $q->where('first_name', 'like', "%{$search}%")
                   ->orWhere('last_name', 'like', "%{$search}%")
                   ->orWhere('code', 'like', "%{$search}%");
            });
            // Search logic for PNC
            $pncQuery->whereHas('patient', function($q) use ($search){
                 $q->where('first_name', 'like', "%{$search}%")
                   ->orWhere('last_name', 'like', "%{$search}%")
                   ->orWhere('code', 'like', "%{$search}%");
            });
        }

        return Inertia::render('Hospital/Rch/Postnatal/Index', [
            'deliveries' => $deliveriesQuery->paginate(10, ['*'], 'del_page')->withQueryString(),
            'pncVisits' => $pncQuery->paginate(10, ['*'], 'pnc_page')->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Show form to record a Delivery (Birth).
     */
    public function createDelivery(Request $request)
    {
        // We can pre-fill patient if passed from ANC module
        $preselected = null;
        if($request->patient_code) {
            $preselected = RchAncPregnancy::with('patient')
                ->where('patient_code', $request->patient_code)
                ->where('is_active', true)
                ->first();
        }

        return Inertia::render('Hospital/Rch/Postnatal/CreateDelivery', [
            'preselected' => $preselected
        ]);
    }

    /**
     * Store Delivery Record.
     */
    public function storeDelivery(Request $request)
    {
        $validated = $request->validate([
            'pregnancy_id' => 'required|exists:rch_anc_pregnancies,id',
            'delivery_datetime' => 'required|date',
            'mode_of_delivery' => 'required|string', // SVD, C-Section
            'outcome' => 'required|string', // Live, Still
            'placenta_delivery' => 'nullable|string',
            'blood_loss_ml' => 'nullable|numeric',
            'child_gender' => 'required|string|in:Male,Female',
            'birth_weight_kg' => 'required|numeric',
            'apgar_score_1min' => 'nullable|integer|min:0|max:10',
            'apgar_score_5min' => 'nullable|integer|min:0|max:10',
            'complications' => 'nullable|string',
        ]);

        $validated['conducted_by'] = Auth::id();

        // Optional: Link to a Booking/Admission if exists
        // $validated['opd_booking_id'] = ...

        DB::transaction(function () use ($validated, $request) {
            // 1. Create Delivery Record
            RchDelivery::create($validated);

            // 2. Mark Pregnancy as Inactive (Delivered)
            // You might want to keep it active until PNC is done, 
            // but usually delivery marks the end of the "Pregnancy" record lifecycle in ANC.
            $pregnancy = RchAncPregnancy::find($validated['pregnancy_id']);
            $pregnancy->is_active = false; 
            $pregnancy->save();
        });

        return redirect()->route('rch2.index')->with('success', 'Delivery recorded successfully.');
    }

    /**
     * Show form for PNC Visit (Mother).
     */
    public function createVisit()
    {
        return Inertia::render('Hospital/Rch/Postnatal/CreateVisit');
    }

    /**
     * Store PNC Visit.
     */
    public function storeVisit(Request $request)
    {
        $validated = $request->validate([
            'patient_code' => 'required|exists:patients,code',
            'visit_date' => 'required|date',
            'timing' => 'required|string', // 48hrs, 7days, 42days
            'uterus_involution' => 'nullable|string',
            'lochia_status' => 'nullable|string',
            'c_section_wound' => 'nullable|string',
            'vitamin_a_given' => 'boolean',
            'counseling_given' => 'nullable|string',
        ]);

        // Auto-link to today's booking
        $booking = OpdBooking::where('patientcode', $request->patient_code)
            ->whereDate('created_at', Carbon::today())
            ->latest()
            ->first();
        
        $validated['opd_booking_id'] = $booking ? $booking->id : null;
        
        // Find recent delivery if exists (Optional linkage)
        $delivery = RchDelivery::whereHas('pregnancy', function($q) use ($request){
             $q->where('patient_code', $request->patient_code);
        })->latest('delivery_datetime')->first();

        if($delivery) {
            $validated['delivery_id'] = $delivery->id;
        }

        $validated['created_by'] = Auth::id();

        RchPncVisit::create($validated);

        return redirect()->route('rch2.index')->with('success', 'PNC Visit recorded.');
    }

    /**
     * API to search for active pregnancy for delivery.
     */
    public function searchPregnancy(Request $request)
    {
        // Logic similar to ANC controller, returning pregnancy + patient info
    }
}