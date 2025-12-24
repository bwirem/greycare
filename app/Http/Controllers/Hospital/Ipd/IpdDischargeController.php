<?php

namespace App\Http\Controllers\Hospital\Ipd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

// Models
use App\Models\Ipd\IpdAdmission;
use App\Models\Ipd\IpdDischargeLog;
use App\Models\Ipd\IpdDischargeStatus;
use App\Models\Ipd\IpdBed;
use App\Models\Ipd\IpdBedCharge; // Import this
use App\Models\Patient\Patient;

// Services
use App\Services\BillingService; // Import Billing Service

class IpdDischargeController extends Controller
{
    // ... index and create methods remain the same ...
    public function index(Request $request)
    {
        $query = IpdAdmission::with(['patient', 'ward', 'bed'])
            ->whereIn('status', ['Admitted', 'Discharge Pending'])
            ->orderByRaw("FIELD(status, 'Discharge Pending', 'Admitted')");

        if ($request->search) {
            $query->whereHas('patient', function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('last_name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%");
            });
        }

        return Inertia::render('Hospital/Ipd/Discharges/Index', [
            'admissions' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }

    public function create(IpdAdmission $admission)
    {
        $admission->load(['patient', 'ward', 'bed','dischargeSummary']);
        
        return Inertia::render('Hospital/Ipd/Discharges/Create', [
            'admission' => $admission,
            'statuses' => IpdDischargeStatus::all()
        ]);
    }

    /**
     * Store Discharge & Process Outstanding Bed Charges
     */
    public function store(Request $request, IpdAdmission $admission, BillingService $billingService)
    {
        $request->validate([
            'discharge_status_id' => 'required|exists:ipd_discharge_statuses,id',
            'remarks' => 'nullable|string',
            'discharge_date' => 'required|date|after_or_equal:'.$admission->admission_date
        ]);

        // Eager load ward price info
        $admission->load('ward.blsItem');

        DB::transaction(function () use ($request, $admission, $billingService) {
            
            // -------------------------------------------------------------
            // 1. CATCH-UP BILLING: Charge for any unbilled days (including today)
            // -------------------------------------------------------------
            if ($admission->ward && $admission->ward->blsItem) {
                
                $startDate = Carbon::parse($admission->admission_date);
                $endDate = Carbon::parse($request->discharge_date);
                
                // If admitted and discharged same day, count as 1 day.
                // Otherwise, loop through dates.
                
                $currentDate = $startDate->copy();
                
                // Loop until (and including) discharge date
                while ($currentDate->lte($endDate)) {
                    $dateString = $currentDate->format('Y-m-d');

                    // Check if charge exists for this specific date
                    $exists = IpdBedCharge::where('ipd_admission_id', $admission->id)
                        ->where('charge_date', $dateString)
                        ->exists();

                    if (!$exists) {
                        // A. Create Clinical Log
                        $charge = IpdBedCharge::create([
                            'ipd_admission_id' => $admission->id,
                            'charge_date' => $dateString,
                            'amount' => $admission->ward->blsItem->price1
                        ]);

                        // B. Push to Billing
                        $billingService->addToBill(
                            $admission->patientcode,
                            $admission->ward->blsItem->id, // Bill Item ID
                            1,                             // Quantity
                            'ipd_bed_charge',              // Source Type
                            $charge->id                    // Source ID
                        );
                    }

                    $currentDate->addDay();
                }
            }
            // -------------------------------------------------------------

            // 2. Create Discharge Log
            IpdDischargeLog::create([
                'patientcode' => $admission->patientcode,
                'transdate' => $request->discharge_date,
                'ward_id' => $admission->ward_id,
                'room_id' => $admission->room_id,
                'bed_id' => $admission->bed_id,
                'discharge_status_id' => $request->discharge_status_id,
                'dischargeremarks' => $request->remarks,
                'user_id' => Auth::id()
            ]);

            // 3. Free up the Bed
            if ($admission->bed_id) {
                IpdBed::where('id', $admission->bed_id)->update(['status' => 'Free']);
            }

            // 4. Update Master Admission
            $admission->update([
                'status' => 'Discharged',
                //'discharged_at' => $request->discharge_date // Ensure column exists or remove line
            ]);

            // 5. Update Patient Master
            Patient::where('code', $admission->patientcode)->update(['is_admitted' => false]);
        });

        return redirect()->route('inpatient1.index')
            ->with('success', 'Patient discharged and final bed charges calculated.');
    }
}