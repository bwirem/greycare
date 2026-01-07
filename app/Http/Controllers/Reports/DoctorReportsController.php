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
use App\Models\MedicalRecord\MrPatientDiagnosisIcdConfirmed;
use Illuminate\Support\Facades\Log;

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
                'patient_name' => $row->patient
                                ? $row->patient->first_name . ' ' . $row->patient->last_name
                                : 'Unknown',
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
                'patient_name' => $row->admission?->patient
                                ? $row->admission->patient->first_name . ' ' . $row->admission->patient->last_name
                                : 'Unknown',
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
                        'name' => $p->first_name . ' ' . $p->last_name, 
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
                'name' => $patient->first_name . ' ' . $patient->last_name,
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
 
    /**
     * 6. Diagnosis Report (ICD-10 Usage & Mappings)
     */
   public function diagnosisReport(Request $request): InertiaResponse
    {
        $validated = $request->validate([
            'start_date'  => 'nullable|date_format:Y-m-d',
            'end_date'    => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
            'report_type' => 'nullable|in:icd,opd,ipd',
        ]);

        $startDate  = Carbon::parse($validated['start_date'] ?? Carbon::now()->startOfMonth())->startOfDay();
        $endDate    = Carbon::parse($validated['end_date']   ?? Carbon::now())->endOfDay();
        $reportType = $validated['report_type'] ?? 'icd';

        // Start Building Query
        $query = MrPatientDiagnosisIcdConfirmed::query()
            ->join('patients', 'mr_patient_diagnoses_icd_confirmed.patientcode', '=', 'patients.code')
            ->whereBetween('mr_patient_diagnoses_icd_confirmed.created_at', [$startDate, $endDate]);

        // Apply Context Filters
        if ($reportType === 'opd') {
            $query->whereNotNull('mr_patient_diagnoses_icd_confirmed.opd_booking_id');
        } elseif ($reportType === 'ipd') {
            $query->where(function($q) {
                $q->whereNotNull('mr_patient_diagnoses_icd_confirmed.ipd_admission_id')
                  ->orWhereNotNull('mr_patient_diagnoses_icd_confirmed.ipd_ward_round_id');
            });
        }

        // --- THE AGGREGATION LOGIC ---
        // We assume MySQL/MariaDB syntax for TIMESTAMPDIFF. 
        // Logic: Calculate Age in Months and Years relative to the Diagnosis Date.
        
        $selects = [
            'mr_patient_diagnoses_icd_confirmed.diagnosis_id',
            
            // < 1 Month
            DB::raw("SUM(CASE WHEN TIMESTAMPDIFF(MONTH, patients.date_of_birth, mr_patient_diagnoses_icd_confirmed.created_at) < 1 AND patients.gender = 'Male' THEN 1 ELSE 0 END) as m_under_1m"),
            DB::raw("SUM(CASE WHEN TIMESTAMPDIFF(MONTH, patients.date_of_birth, mr_patient_diagnoses_icd_confirmed.created_at) < 1 AND patients.gender = 'Female' THEN 1 ELSE 0 END) as f_under_1m"),

            // 1 Month to < 1 Year
            DB::raw("SUM(CASE WHEN TIMESTAMPDIFF(MONTH, patients.date_of_birth, mr_patient_diagnoses_icd_confirmed.created_at) >= 1 AND TIMESTAMPDIFF(YEAR, patients.date_of_birth, mr_patient_diagnoses_icd_confirmed.created_at) < 1 AND patients.gender = 'Male' THEN 1 ELSE 0 END) as m_1m_to_1y"),
            DB::raw("SUM(CASE WHEN TIMESTAMPDIFF(MONTH, patients.date_of_birth, mr_patient_diagnoses_icd_confirmed.created_at) >= 1 AND TIMESTAMPDIFF(YEAR, patients.date_of_birth, mr_patient_diagnoses_icd_confirmed.created_at) < 1 AND patients.gender = 'Female' THEN 1 ELSE 0 END) as f_1m_to_1y"),

            // 1 Year to < 5 Years
            DB::raw("SUM(CASE WHEN TIMESTAMPDIFF(YEAR, patients.date_of_birth, mr_patient_diagnoses_icd_confirmed.created_at) >= 1 AND TIMESTAMPDIFF(YEAR, patients.date_of_birth, mr_patient_diagnoses_icd_confirmed.created_at) < 5 AND patients.gender = 'Male' THEN 1 ELSE 0 END) as m_1y_to_5y"),
            DB::raw("SUM(CASE WHEN TIMESTAMPDIFF(YEAR, patients.date_of_birth, mr_patient_diagnoses_icd_confirmed.created_at) >= 1 AND TIMESTAMPDIFF(YEAR, patients.date_of_birth, mr_patient_diagnoses_icd_confirmed.created_at) < 5 AND patients.gender = 'Female' THEN 1 ELSE 0 END) as f_1y_to_5y"),

            // 5 Years to < 60 Years
            DB::raw("SUM(CASE WHEN TIMESTAMPDIFF(YEAR, patients.date_of_birth, mr_patient_diagnoses_icd_confirmed.created_at) >= 5 AND TIMESTAMPDIFF(YEAR, patients.date_of_birth, mr_patient_diagnoses_icd_confirmed.created_at) < 60 AND patients.gender = 'Male' THEN 1 ELSE 0 END) as m_5y_to_60y"),
            DB::raw("SUM(CASE WHEN TIMESTAMPDIFF(YEAR, patients.date_of_birth, mr_patient_diagnoses_icd_confirmed.created_at) >= 5 AND TIMESTAMPDIFF(YEAR, patients.date_of_birth, mr_patient_diagnoses_icd_confirmed.created_at) < 60 AND patients.gender = 'Female' THEN 1 ELSE 0 END) as f_5y_to_60y"),

            // > 60 Years
            DB::raw("SUM(CASE WHEN TIMESTAMPDIFF(YEAR, patients.date_of_birth, mr_patient_diagnoses_icd_confirmed.created_at) >= 60 AND patients.gender = 'Male' THEN 1 ELSE 0 END) as m_over_60y"),
            DB::raw("SUM(CASE WHEN TIMESTAMPDIFF(YEAR, patients.date_of_birth, mr_patient_diagnoses_icd_confirmed.created_at) >= 60 AND patients.gender = 'Female' THEN 1 ELSE 0 END) as f_over_60y"),

            // Grand Totals (Calculated in SQL for sorting efficiency)
            DB::raw("COUNT(*) as total_occurrences")
        ];

        $results = $query->select($selects)
            ->groupBy('mr_patient_diagnoses_icd_confirmed.diagnosis_id')
            ->orderByDesc('total_occurrences')
            ->with([
                'icdDiagnosis' => function($q) {
                    $q->select('id', 'code', 'name')
                      ->with(['opdMappings', 'ipdMappings']);
                }
            ])
            ->limit(200) // Reasonable limit for a complex report
            ->get();

        // Transform Data
        $reportData = $results->flatMap(function ($row) use ($reportType) {
            $icd = $row->icdDiagnosis;
            if (!$icd) return [];

            // Calculate totals for each bucket (M+F)
            $t_under_1m = $row->m_under_1m + $row->f_under_1m;
            $t_1m_to_1y = $row->m_1m_to_1y + $row->f_1m_to_1y;
            $t_1y_to_5y = $row->m_1y_to_5y + $row->f_1y_to_5y;
            $t_5y_to_60y= $row->m_5y_to_60y + $row->f_5y_to_60y;
            $t_over_60y = $row->m_over_60y + $row->f_over_60y;
            
            // Grand totals
            $grand_m = $row->m_under_1m + $row->m_1m_to_1y + $row->m_1y_to_5y + $row->m_5y_to_60y + $row->m_over_60y;
            $grand_f = $row->f_under_1m + $row->f_1m_to_1y + $row->f_1y_to_5y + $row->f_5y_to_60y + $row->f_over_60y;
            $grand_t = $grand_m + $grand_f;

            $baseStats = [
                'stats' => [
                    'u1m' => ['m' => $row->m_under_1m, 'f' => $row->f_under_1m, 't' => $t_under_1m],
                    '1m1y'=> ['m' => $row->m_1m_to_1y, 'f' => $row->f_1m_to_1y, 't' => $t_1m_to_1y],
                    '1y5y'=> ['m' => $row->m_1y_to_5y, 'f' => $row->f_1y_to_5y, 't' => $t_1y_to_5y],
                    '5y60'=> ['m' => $row->m_5y_to_60y,'f' => $row->f_5y_to_60y,'t' => $t_5y_to_60y],
                    'o60y'=> ['m' => $row->m_over_60y, 'f' => $row->f_over_60y, 't' => $t_over_60y],
                    'grand'=>['m' => $grand_m,         'f' => $grand_f,         't' => $grand_t],
                ]
            ];

            // Determine Label based on Report Type
            if ($reportType === 'opd' && $icd->opdMappings->isNotEmpty()) {
                return $icd->opdMappings->map(fn($map) => array_merge([
                    'code' => $map->code, 'name' => $map->name, 'mapped' => $icd->code
                ], $baseStats));
            } elseif ($reportType === 'ipd' && $icd->ipdMappings->isNotEmpty()) {
                return $icd->ipdMappings->map(fn($map) => array_merge([
                    'code' => $map->code, 'name' => $map->name, 'mapped' => $icd->code
                ], $baseStats));
            } else {
                return [array_merge([
                    'code' => $icd->code, 'name' => $icd->name, 'mapped' => null
                ], $baseStats)];
            }
        });

        return Inertia::render('Reports/Doctor/DiagnosisReport', [
            'data' => $reportData->values()->all(),
            'filters' => [
                'start_date'  => $startDate->format('Y-m-d'),
                'end_date'    => $endDate->format('Y-m-d'),
                'report_type' => $reportType,
            ]
        ]);
    }
}
