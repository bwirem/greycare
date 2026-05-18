<?php

namespace App\Http\Controllers\SpecializeClinic\Rch;

use App\Http\Controllers\Controller;
use App\Models\Rch\RchChildAssessment;
use App\Models\Patient\Patient;
use App\Models\Opd\OpdBooking;
use App\Models\Opd\OpdTreatmentPoint;
use App\Models\Patient\PatientBillingGroup;
use App\Models\Billing\BLSCustomer;
// Check your folder structure: usually 'MedicalRecord' (plural) or 'MedicalRecord' (singular)
use App\Models\MedicalRecord\MrVitalSign; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Inertia\Inertia;

class RchChildHealthController extends Controller
{
    /**
     * Display Growth Monitoring Register.
     */
    public function index(Request $request)
    {
        $query = RchChildAssessment::query()
            ->with(['patient:code,first_name,last_name,date_of_birth', 'vitals'])
            ->latest('created_at');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('patient', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        return Inertia::render('SpecializeClinic/Rch/ChildHealth/Index', [
            'assessments' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Show form to add a new assessment.
     */
    public function create()
    {
        return Inertia::render('SpecializeClinic/Rch/ChildHealth/Create');
    }

    /**
     * Store the assessment.
     */
    public function store(Request $request)
    {
        Log::info(['RCH Store Request' => $request->all()]);

        // --- 1. SERVER-SIDE AGE CALCULATION ---
        // Ensures age is present even if frontend sends null
        if ($request->boolean('is_new_patient') && $request->filled('date_of_birth')) {
            try {
                $dob = Carbon::parse($request->date_of_birth);
                $now = Carbon::now();
                // Calculate difference in months
                $months = (int) $dob->diffInMonths($now); 
                $request->merge(['age_months' => $months]);
            } catch (\Exception $e) {
                $request->merge(['age_months' => 0]);
            }
        }

        // --- 2. VALIDATION RULES ---
        $rules = [
            'is_new_patient' => 'boolean',
            
            // Vitals (Required for growth chart)
            'weight' => 'required|numeric|min:0.5|max:100',
            'height' => 'nullable|numeric|min:10|max:200',

            // Assessment
            'age_months' => 'required|integer|min:0',
            'weight_for_age_status' => 'required|string|in:Green,Grey,Red',
            'height_for_age_status' => 'nullable|string',
            'feeding_practice' => 'nullable|string',
            'development_milestones' => 'nullable|string',
            'vitamin_a_given' => 'boolean',
            'deworming_given' => 'boolean',
        ];

        // Rules for New Patient
        if ($request->boolean('is_new_patient')) {
            $rules = array_merge($rules, [
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'gender' => 'required|in:Male,Female',
                // Prevents future dates
                'date_of_birth' => 'required|date|before_or_equal:today', 
                'guardian_phone' => 'nullable|string|max:20', 
            ]);
        } else {
            $rules['patient_code'] = 'required|exists:patients,code';
        }

        $validated = $request->validate($rules);

        DB::beginTransaction();

        try {
            $patientCode = null;

            // --- 3. CREATE/FIND PATIENT ---
            if ($request->boolean('is_new_patient')) {
                do {
                    $patientCode = 'PAT-' . date('ymd') . '-' . mt_rand(100, 999);
                } while (Patient::where('code', $patientCode)->exists());

                Patient::create([
                    'code'          => $patientCode,
                    'first_name'    => $validated['first_name'],
                    'last_name'     => $validated['last_name'],
                    'middle_name'   => $validated['middle_name'] ?? null,
                    'gender'        => $validated['gender'],
                    'date_of_birth' => $validated['date_of_birth'],
                    'phone_number'  => $validated['guardian_phone'] ?? null,
                ]);

                BLSCustomer::firstOrCreate(
                    ['patient_code' => $patientCode],
                    [
                        'customer_type' => 'individual',
                        'first_name'    => $validated['first_name'],
                        'surname'       => $validated['last_name'],
                        'other_names'   => $validated['middle_name'] ?? null,
                        'phone'         => $validated['guardian_phone'] ?? null,
                    ]
                );
            } else {
                $patientCode = $validated['patient_code'];
            }

            // --- 4. HANDLE OPD BOOKING ---
            $booking = OpdBooking::where('patientcode', $patientCode)
                ->whereDate('created_at', Carbon::today())
                ->latest()
                ->first();

            if (!$booking) {
                $user = Auth::user();
                $tp = OpdTreatmentPoint::firstOrCreate(['name' => 'RCH Clinic']);
                $billingGroup = PatientBillingGroup::where('name', 'like', '%Cash%')->first();
                $billingGroupId = $billingGroup ? $billingGroup->id : 1;
                $priceCategory = $billingGroup->pricecategory ?? 'price1';

                $booking = OpdBooking::create([
                    'bookdate'           => now(),
                    'patientcode'        => $patientCode,
                    'treatmentpoint_id'  => $tp->id,
                    'billinggroup_id'    => $billingGroupId,
                    'doctor_user_id'     => $user->id,
                    'user_id'            => $user->id,
                    'wheretaken'         => 'RCH Clinic',
                    'DoctorName'         => $user->name ?? 'Staff',
                    'vitalsignstatus'    => 'Open',
                    'consultation_status'=> 'RchChildVisit',
                    'pricecategory'      => $priceCategory,
                    'visit_classification' => 'New',
                    'payment_status'       => 'unpaid',
                ]);
            }

            // --- 5. SAVE VITALS (Weight/Height) ---
            $vitals = MrVitalSign::firstOrNew(['opd_booking_id' => $booking->id]);
            // Note: Verify if your DB uses 'patient_code' or 'patientcode' for MrVitalSign
            $vitals->patientcode = $patientCode; 
            $vitals->weight = $validated['weight'];
            $vitals->height = $validated['height'];
            $vitals->bmi = ($validated['height'] > 0) ? $validated['weight'] / (($validated['height']/100) ** 2) : 0;
            $vitals->user_id = Auth::id();
            $vitals->save();

            // --- 6. SAVE RCH ASSESSMENT ---
            RchChildAssessment::create([
                'patient_code'          => $patientCode,
                'opd_booking_id'        => $booking->id,
                'created_by'            => Auth::id(),
                'age_months'            => $validated['age_months'],
                'weight_for_age_status' => $validated['weight_for_age_status'],
                'height_for_age_status' => $validated['height_for_age_status'],
                'feeding_practice'      => $validated['feeding_practice'],
                'development_milestones'=> $validated['development_milestones'],
                'vitamin_a_given'       => $validated['vitamin_a_given'] ?? false,
                'deworming_given'       => $validated['deworming_given'] ?? false,
            ]);

            DB::commit();

            return redirect()->route('rch3.index')->with('success', 'Growth record saved successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('RCH Store Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to save: ' . $e->getMessage()]);
        }
    }

    /**
     * Edit assessment.
     */
    public function edit($id)
    {
        $assessment = RchChildAssessment::with(['patient', 'vitals'])->findOrFail($id);

        return Inertia::render('SpecializeClinic/Rch/ChildHealth/Edit', [
            'assessment' => $assessment
        ]);
    }

    /**
     * Update assessment.
     */
    public function update(Request $request, $id)
    {
        $assessment = RchChildAssessment::findOrFail($id);

        $validated = $request->validate([
            // Allow updating vitals too
            'weight' => 'required|numeric|min:0.5',
            'height' => 'nullable|numeric',
            
            'age_months' => 'required|integer',
            'weight_for_age_status' => 'required|string',
            'feeding_practice' => 'nullable|string',
            'development_milestones' => 'nullable|string',
            'vitamin_a_given' => 'boolean',
            'deworming_given' => 'boolean',
        ]);

        DB::transaction(function () use ($assessment, $validated) {
            // 1. Update Vitals if they exist, or create if missing
            if ($assessment->opd_booking_id) {
                $vitals = MrVitalSign::firstOrNew(['opd_booking_id' => $assessment->opd_booking_id]);
                $vitals->patientcode = $assessment->patient_code;
                $vitals->weight = $validated['weight'];
                $vitals->height = $validated['height'];
                $vitals->save();
            }

            // 2. Update Assessment
            $assessment->update([
                'age_months' => $validated['age_months'],
                'weight_for_age_status' => $validated['weight_for_age_status'],
                'feeding_practice' => $validated['feeding_practice'],
                'development_milestones' => $validated['development_milestones'],
                'vitamin_a_given' => $validated['vitamin_a_given'],
                'deworming_given' => $validated['deworming_given'],
            ]);
        });

        return redirect()->route('rch3.index')->with('success', 'Growth record updated.');
    }

    /**
     * Display Growth Chart / History for a specific child.
     */
    public function viewChart($patientCode)
    {
        $patient = Patient::where('code', $patientCode)->firstOrFail();
        
        $history = RchChildAssessment::with('vitals')
            ->where('patient_code', $patientCode)
            ->orderBy('age_months', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'age' => $item->age_months,
                    'weight' => $item->vitals ? $item->vitals->weight : 0, 
                    'status' => $item->weight_for_age_status,
                    'date' => $item->created_at->format('Y-m-d')
                ];
            });

        return Inertia::render('SpecializeClinic/Rch/ChildHealth/Chart', [
            'patient' => $patient,
            'history' => $history
        ]);
    }
}