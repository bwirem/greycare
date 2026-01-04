<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

// Models
use App\Models\Pharmacy\PharmacyPrescription;
use App\Models\Inventory\SIV_Product; // Drugs
use App\Models\User; // Doctors/Pharmacists

class PharmacyReportsController extends Controller
{
    /**
     * Pharmacy Reporting Dashboard.
     */
    public function index(): InertiaResponse
    {
        $today = Carbon::today();

        // 1. Total Items Prescribed Today
        $totalPrescribed = PharmacyPrescription::whereDate('created_at', $today)->count();

        // 2. Pending Dispense (Waiting at counter)
        $pendingDispense = PharmacyPrescription::where('status', 'Prescribed')
            ->where('payment_status', '!=', 'unpaid') // Assuming paid/insurance are ready
            ->count();

        // 3. Dispensed Today
        $dispensedToday = PharmacyPrescription::whereDate('updated_at', $today)
            ->where('status', 'Dispensed')
            ->count();

        // 4. Unique Patients Served Today (Dispensed)
        $patientsServed = PharmacyPrescription::whereDate('updated_at', $today)
            ->where('status', 'Dispensed')
            ->distinct('patientcode')
            ->count('patientcode');

        return Inertia::render('Reports/Pharmacy/Index', [
            'stats' => [
                'total_prescribed' => $totalPrescribed,
                'pending_queue'    => $pendingDispense,
                'dispensed_today'  => $dispensedToday,
                'patients_served'  => $patientsServed,
            ]
        ]);
    }

    /**
     * Report: Detailed Dispensing Log (Prescription History)
     */
    public function dispensing(Request $request): InertiaResponse
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date'   => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
            'status'     => 'nullable|string',
            'product_id' => 'nullable|exists:siv_products,id',
        ]);

        $startDate = Carbon::parse($validated['start_date'] ?? Carbon::today())->startOfDay();
        $endDate   = Carbon::parse($validated['end_date']   ?? Carbon::today())->endOfDay();
        $status    = $validated['status'] ?? null;
        $productId = $validated['product_id'] ?? null;

        $query = PharmacyPrescription::with(['patient', 'product', 'doctor'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($status) {
            $query->where('status', $status);
        }
        if ($productId) {
            $query->where('product_id', $productId);
        }

        // Summary Stats for the filtered period
        $summary = (clone $query)
            ->select('status', DB::raw('count(*) as count'), DB::raw('sum(quantity_prescribed) as total_qty'))
            ->groupBy('status')
            ->get();

        $rows = $query->orderBy('created_at', 'desc')->paginate(20)->withQueryString()
            ->through(function ($row) {
                return [
                    'id'           => $row->id,
                    'date'         => $row->created_at->format('Y-m-d H:i'),
                    'patient_name' => $row->patient
                                    ? $row->patient->first_name . ' ' . $row->patient->last_name
                                    : 'Unknown',
                    'file_number'  => $row->patientcode,
                    'drug_name'    => $row->product?->name ?? 'N/A',
                    'dosage'       => "{$row->dosage} {$row->frequency} x {$row->duration}",
                    'quantity'     => $row->quantity_prescribed,
                    'doctor'       => $row->doctor?->name ?? 'Unassigned',
                    'status'       => $row->status,
                    'dispensed_at' => $row->status === 'Dispensed' ? $row->updated_at->format('H:i') : '-',
                ];
            });

        return Inertia::render('Reports/Pharmacy/Dispensing', [
            'reportData' => [
                'start'   => $startDate->format('Y-m-d'),
                'end'     => $endDate->format('Y-m-d'),
                'summary' => $summary,
                'rows'    => $rows
            ],
            // Fetch products for filter dropdown (Limit to improve performance)
            'products' => SIV_Product::select('id', 'name')->orderBy('name')->limit(500)->get(),
            'filters'  => $request->only(['start_date', 'end_date', 'status', 'product_id'])
        ]);
    }

    /**
     * Report: Drug Consumption Analysis (Top Moving Items)
     */
    public function analysis(Request $request): InertiaResponse
    {
        $startDate = Carbon::parse($request->start_date ?? Carbon::now()->startOfMonth())->startOfDay();
        $endDate   = Carbon::parse($request->end_date ?? Carbon::now()->endOfMonth())->endOfDay();

        // Top Dispensed Drugs
        $consumption = PharmacyPrescription::query()
            ->join('siv_products', 'pharmacy_prescriptions.product_id', '=', 'siv_products.id')
            ->whereBetween('pharmacy_prescriptions.updated_at', [$startDate, $endDate]) // Use updated_at for actual dispense time
            ->where('pharmacy_prescriptions.status', 'Dispensed')
            ->select(
                'siv_products.name',
                'siv_products.id as code',
                DB::raw('COUNT(*) as times_dispensed'),
                DB::raw('SUM(pharmacy_prescriptions.quantity_prescribed) as total_quantity_dispensed')
            )
            ->groupBy('siv_products.id', 'siv_products.name', 'siv_products.id')
            ->orderByDesc('total_quantity_dispensed')
            ->limit(20)
            ->get();

        return Inertia::render('Reports/Pharmacy/Analysis', [
            'reportData' => [
                'start' => $startDate->format('d M Y'),
                'end'   => $endDate->format('d M Y'),
                'data'  => $consumption
            ],
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date'   => $endDate->format('Y-m-d')
            ]
        ]);
    }
}