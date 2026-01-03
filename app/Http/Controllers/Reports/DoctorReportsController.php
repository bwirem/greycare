<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

// Models
use App\Models\Opd\OpdBooking;
use App\Models\Ipd\IpdWardRound;
use App\Models\Theatre\TheatreBooking;
use App\Models\User;
use App\Models\Opd\OpdTreatmentPoint;
use App\Models\Ipd\IpdWard;
use App\Models\Patient\Patient; // <--- Ensure this is imported

class DoctorReportsController extends Controller
{
    /**
     * Doctor Reporting Dashboard.
     */
    public function index(): InertiaResponse
    {
        $today = Carbon::today();

        // 1. OPD Consultations Today
        $opdCount = OpdBooking::whereDate('created_at', $today)
            ->whereNotNull('doctor_user_id')
            ->count();

        // 2. IPD Rounds Today
        $ipdCount = IpdWardRound::whereDate('round_date', $today)->count();

        // 3. Surgeries Today
        $surgeryCount = TheatreBooking::whereDate('scheduled_at', $today)->count();

        return Inertia::render('Reports/Doctor/Index', [
            'stats' => [
                'opd_today'      => $opdCount,
                'rounds_today'   => $ipdCount,
                'surgeries_today'=> $surgeryCount,
            ]
        ]);
    }

    /**
     * Report: OPD Consultation Workload (By Doctor)
     */
    public function opdWorkload(Request $request): InertiaResponse
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date'   => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
            'doctor_id'  => 'nullable|exists:users,id',
        ]);

        $startDate = Carbon::parse($validated['start_date'] ?? Carbon::today())->startOfDay();
        $endDate   = Carbon::parse($validated['end_date']   ?? Carbon::today())->endOfDay();
        $doctorId  = $validated['doctor_id'] ?? null;

        // Base Query
        $query = OpdBooking::with(['patient', 'treatmentPoint', 'user']) // 'user' is the assigned doctor
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('doctor_user_id');

        if ($doctorId) {
            $query->where('doctor_user_id', $doctorId);
        }

        // 1. Aggregate Summary by Doctor
        $summary = (clone $query)
            ->select('doctor_user_id', DB::raw('count(*) as total_patients'))
            ->groupBy('doctor_user_id')
            ->get()
            ->map(function ($row) {
                // Manually load user name since we grouped by ID
                return [
                    'doctor_name' => User::find($row->doctor_user_id)?->name ?? 'Unknown',
                    'count'       => $row->total_patients
                ];
            })
            ->sortByDesc('count')
            ->values();

        // 2. Detailed List
        $details = $query->orderBy('created_at', 'desc')->get()->map(function ($row) {
            return [
                'id'           => $row->id,
                'date'         => Carbon::parse($row->created_at)->format('Y-m-d H:i'),
                'doctor_name'  => $row->user?->name ?? 'Unassigned',
                'patient_name' => $row->patient?->full_name ?? 'Unknown',
                'file_number'  => $row->patientcode,
                'clinic'       => $row->treatmentPoint?->name ?? 'General',
                'status'       => $row->consultation_status
            ];
        });

        return Inertia::render('Reports/Doctor/OpdWorkload', [
            'reportData' => [
                'start'   => $startDate->format('d M Y'),
                'end'     => $endDate->format('d M Y'),
                'total'   => $details->count(),
                'summary' => $summary,
                'rows'    => $details
            ],
            'doctors' => User::whereNotNull('specialization_id')->select('id', 'name')->orderBy('name')->get(),
            'filters' => $request->only(['start_date', 'end_date', 'doctor_id'])
        ]);
    }

    /**
     * Report: IPD Ward Rounds (By Doctor)
     */
    public function ipdWorkload(Request $request): InertiaResponse
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date'   => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
            'ward_id'    => 'nullable|exists:ipd_wards,id',
        ]);

        $startDate = Carbon::parse($validated['start_date'] ?? Carbon::today())->startOfDay();
        $endDate   = Carbon::parse($validated['end_date']   ?? Carbon::today())->endOfDay();
        $wardId    = $validated['ward_id'] ?? null;

        // Query IpdWardRound
        $query = IpdWardRound::with(['doctor', 'admission.patient', 'admission.ward'])
            ->whereBetween('round_date', [$startDate, $endDate]);

        if ($wardId) {
            $query->whereHas('admission', function($q) use ($wardId) {
                $q->where('ward_id', $wardId);
            });
        }

        // 1. Aggregate Summary by Doctor
        $summary = (clone $query)
            ->select('user_id', DB::raw('count(*) as total_rounds'))
            ->groupBy('user_id')
            ->get()
            ->map(function ($row) {
                return [
                    'doctor_name' => User::find($row->user_id)?->name ?? 'Unknown',
                    'count'       => $row->total_rounds
                ];
            })
            ->sortByDesc('count')
            ->values();

        // 2. Details
        $details = $query->orderBy('round_date', 'desc')->get()->map(function ($row) {
            return [
                'id'           => $row->id,
                'date'         => Carbon::parse($row->round_date)->format('Y-m-d H:i'),
                'doctor_name'  => $row->doctor?->name ?? 'Unknown',
                'patient_name' => $row->admission?->patient?->full_name ?? 'Unknown',
                'ward'         => $row->admission?->ward?->name ?? 'N/A',
                'notes_excerpt'=> \Illuminate\Support\Str::limit($row->clinical_notes, 50)
            ];
        });

        return Inertia::render('Reports/Doctor/IpdWorkload', [
            'reportData' => [
                'start'   => $startDate->format('d M Y'),
                'end'     => $endDate->format('d M Y'),
                'total'   => $details->count(),
                'summary' => $summary,
                'rows'    => $details
            ],
            'wards' => IpdWard::select('id', 'name')->orderBy('name')->get(),
            'filters' => $request->only(['start_date', 'end_date', 'ward_id'])
        ]);
    }

   
    // ... [Keep existing index, opdWorkload, ipdWorkload methods] ...

    /**
     * 4. Patient History - Search Screen
     */
    public function patientHistorySearch(Request $request): InertiaResponse
    {
        $patients = [];

        if ($request->search && strlen($request->search) > 2) {
            $patients = Patient::where('first_name', 'like', "%{$request->search}%")
                ->orWhere('last_name', 'like', "%{$request->search}%")
                ->orWhere('code', 'like', "%{$request->search}%")
                ->orWhere('phone_number', 'like', "%{$request->search}%")
                ->select('code', 'first_name', 'last_name', 'middle_name', 'phone_number', 'date_of_birth')
                ->limit(20)
                ->get()
                ->map(function ($p) {
                    return [
                        'code' => $p->code,
                        'name' => $p->full_name, // Ensure fullName accessor exists in Patient model
                        'age'  => $p->age,
                        'phone'=> $p->phone_number
                    ];
                });
        }

        // You can save the view file at resources/js/Pages/Reports/Patient/Index.jsx
        return Inertia::render('Reports/Patient/Index', [
            'results' => $patients,
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * 5. Patient History - Detailed Timeline
     */
    public function patientHistoryShow($patientCode): InertiaResponse
    {
        $patient = Patient::where('code', $patientCode)
            ->with([
                // 1. Visits
                'visits' => function($q) { 
                    $q->with(['treatmentPoint', 'doctor', 'latestVitalSign'])->orderBy('created_at', 'desc');
                },
                'ipdAdmissions' => function($q) { 
                    $q->with(['ward', 'user', 'dischargeSummary'])->orderBy('admission_date', 'desc');
                },
                
                // 2. Meds
                'prescriptions' => function($q) {
                    $q->with('product')->orderBy('created_at', 'desc');
                },

                // 3. Labs
                'labRequests.panel',
                'labRequests.sample.results',

                // 4. Diagnoses
                'diagnosesConfirmed.diagnosis',
                'icdDiagnosesConfirmed.icdDiagnosis'
            ])
            ->firstOrFail();

        // --- Data Transformation ---

        // A. Timeline (Merge OPD and IPD)
        $timeline = collect();
        
        foreach($patient->visits as $opd) {
            $timeline->push([
                'type' => 'OPD',
                'date' => $opd->created_at,
                'date_str' => $opd->created_at->format('Y-m-d H:i'),
                'location' => $opd->treatmentPoint?->name ?? 'General',
                'doctor' => $opd->doctor?->name ?? $opd->DoctorName ?? 'Unassigned',
                'vitals' => $opd->latestVitalSign ? "BP: {$opd->latestVitalSign->systolic}/{$opd->latestVitalSign->diastolic}" : '-'
            ]);
        }

        foreach($patient->ipdAdmissions as $ipd) {
            $timeline->push([
                'type' => 'IPD',
                'date' => Carbon::parse($ipd->admission_date),
                'date_str' => Carbon::parse($ipd->admission_date)->format('Y-m-d'),
                'location' => $ipd->ward?->name ?? 'Ward',
                'doctor' => $ipd->user?->name ?? 'Unassigned',
                'outcome' => $ipd->dischargeSummary?->outcome ?? $ipd->status
            ]);
        }

        // B. Merged Diagnoses
        $diagnoses = collect();
        foreach($patient->diagnosesConfirmed as $d) {
            $diagnoses->push([
                'date' => $d->created_at->format('Y-m-d'),
                'name' => $d->diagnosis?->name ?? $d->diagnosisdescription
            ]);
        }
        foreach($patient->icdDiagnosesConfirmed as $d) {
            $diagnoses->push([
                'date' => $d->created_at->format('Y-m-d'),
                'name' => ($d->icdDiagnosis?->name ?? 'Unknown') . ' (' . ($d->icdDiagnosis?->code ?? '-') . ')'
            ]);
        }

        // You can save the view file at resources/js/Pages/Reports/Patient/History.jsx
        return Inertia::render('Reports/Patient/History', [
            'patient' => [
                'code' => $patient->code,
                'name' => $patient->full_name,
                'age' => $patient->age,
                'gender' => $patient->gender,
                'phone' => $patient->phone_number,
                'dob' => $patient->date_of_birth ? $patient->date_of_birth->format('d M Y') : 'N/A',
                'address' => $patient->address ?? $patient->city,
            ],
            'timeline' => $timeline->sortByDesc('date')->values(),
            'diagnoses' => $diagnoses->sortByDesc('date')->values(),
            'medications' => $patient->prescriptions->map(fn($rx) => [
                'date' => $rx->created_at->format('Y-m-d'),
                'drug' => $rx->product?->name ?? 'Unknown',
                'dose' => "{$rx->dosage} {$rx->frequency} x {$rx->duration}",
                'qty'  => $rx->quantity_prescribed
            ]),
            'labs' => $patient->labRequests->map(fn($lab) => [
                'date' => $lab->created_at->format('Y-m-d'),
                'test' => $lab->panel?->name ?? 'Unknown Test',
                'status' => $lab->status,
                'result_summary' => $lab->sample?->results->count() . ' param(s)'
            ])
        ]);
    }
}
