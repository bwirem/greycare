<?php

namespace App\Http\Controllers\Mortuary;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\Mortuary\MortuaryCabinet;
use App\Models\Mortuary\MortuaryRelease;
use App\Models\Mortuary\MortuaryRecord;
// Assuming you create a MortuaryCharge model to track daily bills
use App\Models\Mortuary\MortuaryCharge; 
use App\Services\BillingService;
use App\Models\Patient\Patient;
use App\Models\Billing\BLSCustomer;
use Illuminate\Support\Facades\Log;

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
   

    public function store(Request $request, MortuaryRecord $record, BillingService $billingService)
    {
        $validated = $request->validate([
            'receiver_name' => 'required|string|max:255',
            'receiver_id_number' => 'required|string|max:100',
            'relationship' => 'required|string|max:100',
            'released_at' => 'required|date|after_or_equal:' . $record->created_at->format('Y-m-d'),
            'remarks' => 'nullable|string',
        ]);

        $record->load('room.blsItem');

        DB::transaction(function () use ($validated, $record, $billingService) {
        
            $cabinet = MortuaryCabinet::findOrFail($record->cabinet_id);

            if ($cabinet->status !== 'Occupied') {
                throw new \Exception('Selected cabinet is already free.');
            }

            // -------------------------------------------------------------
            // 1. AUTO-GENERATE PATIENT & CUSTOMER IF NO PATIENT CODE EXISTS
            // -------------------------------------------------------------
            if (empty($record->patient_code)) {
                
                do {
                    $patientCode = 'PAT-' . date('ymd') . '-' . mt_rand(100, 999);
                } while (Patient::where('code', $patientCode)->exists());

                $estimatedDob = $record->age 
                    ? Carbon::now()->subYears($record->age)->format('Y-m-d') 
                    : Carbon::now()->format('Y-m-d');

                Patient::create([
                    'code'          => $patientCode,
                    'first_name'    => $record->first_name ?? 'Unknown',
                    'last_name'     => $record->last_name ?? 'Unknown',
                    'gender'        => $record->gender ?? 'Unknown',
                    'date_of_birth' => $estimatedDob,
                    'phone_number'  => '0000000000', 
                    'payment_category' => 'Cash', 
                ]);

                BLSCustomer::firstOrCreate(
                    ['patient_code' => $patientCode], 
                    [
                        'customer_type' => 'individual',
                        'first_name'    => $record->first_name ?? 'Unknown',
                        'surname'       => $record->last_name ?? 'Unknown',
                        'phone'         => '0000000000',
                        'patient_code'  => $patientCode,                    
                    ]
                );

                $record->update(['patient_code' => $patientCode]);
                $record->patient_code = $patientCode; 
            }

            // -------------------------------------------------------------
            // 2. CATCH-UP BILLING: Charge for unbilled days (INCLUDING SAME DAY)
            // -------------------------------------------------------------
            if ($record->patient_code && $record->room && $record->room->blsItem) {
                
                // USE startOfDay() TO IGNORE TIMES AND FORCE STRICT DATE COMPARISON
                $startDate = Carbon::parse($record->created_at)->startOfDay();
                $endDate = Carbon::parse($validated['released_at'])->startOfDay();
                
                $currentDate = $startDate->copy();
                $billingGroup = 1;
                $billingSubGroup = null;
                $billingGroupMembershipNo = null;
                $wardId = null;
                
                // Even if startDate and endDate are the same day, this will evaluate to True and run exactly 1 time.
                while ($currentDate->lte($endDate)) {
                    $dateString = $currentDate->format('Y-m-d');

                    $exists = MortuaryCharge::where('mortuary_record_id', $record->id)
                        ->where('charge_date', $dateString)
                        ->exists();

                    if (!$exists) {
                        $charge = MortuaryCharge::create([
                            'mortuary_record_id' => $record->id,
                            'charge_date' => $dateString,
                            'amount' => $record->room->blsItem->price1
                        ]);

                        $billingService->addToBill(
                            $record->patient_code,
                            $billingGroup,
                            $billingSubGroup,
                            $billingGroupMembershipNo,
                            $wardId,                            
                            $record->room->blsItem->id, 
                            1,                          
                            'mortuary_charge',          
                            $charge->id,                
                            'price1',                   
                            'Cash'                      
                        );
                    }

                    $currentDate->addDay();
                }
            }

            // -------------------------------------------------------------
            // 3. CREATE RELEASE LOG & FREE CABINET
            // -------------------------------------------------------------
            MortuaryRelease::create([
                'mortuary_record_id' => $record->id,
                'receiver_name' => $validated['receiver_name'],
                'receiver_id_number' => $validated['receiver_id_number'],
                'relationship' => $validated['relationship'],
                'released_at' => $validated['released_at'],
                'remarks' => $validated['remarks'],
                'released_by_user_id' => Auth::id(),
            ]);

            $record->update(['status' => 'Released']);
            $cabinet->update(['status' => 'Free']);
        });

        return redirect()->route('mortuary1.index')
            ->with('success', 'Body released successfully. Final charges applied to file: ' . $record->patient_code);
    }
    
}