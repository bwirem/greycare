<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

// Models
use App\Models\Rch\RchAncPregnancy;
use App\Models\Rch\RchDelivery;
use App\Models\Rch\RchImmunization;
use App\Models\Rch\RchFpVisit;
use App\Models\Rch\RchChildAssessment;

use App\Models\Inventory\SIV_Store;
use App\Models\Inventory\SIV_ProductCategory;
use App\Models\Inventory\SIV_Product;

class RchReportsController extends Controller
{
    /**
     * RCH Reporting Dashboard
     */
    public function index(): InertiaResponse
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->month;

        return Inertia::render('Reports/Rch/Index', [
            'stats' => [
                'active_pregnancies'  => RchAncPregnancy::where('is_active', true)->count(),
                'deliveries_month'    => RchDelivery::whereMonth('delivery_datetime', $thisMonth)->count(),
                'vaccines_today'      => RchImmunization::whereDate('administered_date', $today)->count(),
                'fp_visits_month'     => RchFpVisit::whereMonth('visit_date', $thisMonth)->count(),
                'growth_checks_today' => RchChildAssessment::whereDate('created_at', $today)->count(),
            ]
        ]);
    }

    /**
     * Report: ANC / Maternity Registrations
     */
    public function anc(Request $request): InertiaResponse
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date'   => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
        ]);

        $startDate = Carbon::parse($validated['start_date'] ?? Carbon::today()->startOfMonth())->startOfDay();
        $endDate   = Carbon::parse($validated['end_date']   ?? Carbon::today())->endOfDay();

        $query = RchAncPregnancy::with(['patient'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        // Aggregate Stats
        $statusStats = [
            'Active' => (clone $query)->where('is_active', true)->count(),
            'Delivered / Closed' => (clone $query)->where('is_active', false)->count(),
        ];

        $parityStats = [
            'Nulliparous (0)' => (clone $query)->where('parity', 0)->count(),
            'Multiparous (1-4)' => (clone $query)->whereBetween('parity', [1, 4])->count(),
            'Grand Multiparous (5+)' => (clone $query)->where('parity', '>=', 5)->count(),
        ];

        // Detailed Rows
        $details = $query->orderBy('created_at', 'desc')->get()->map(function ($row) {
            return [
                'id' => $row->id,
                'reg_date' => Carbon::parse($row->created_at)->format('Y-m-d'),
                'mother_name' => $row->patient->first_name . ' ' . $row->patient->last_name,
                'file_number' => $row->patient->code,
                'anc_number' => $row->anc_number ?? '-',
                'gravida_parity' => 'G' . $row->gravida . ' P' . $row->parity,
                'edd' => Carbon::parse($row->edd_date)->format('d M Y'),
                'status' => $row->is_active ? 'Active' : 'Closed'
            ];
        });

        return Inertia::render('Reports/Rch/Anc', [
            'reportData' => [
                'start' => $startDate->format('d M Y'),
                'end'   => $endDate->format('d M Y'),
                'total_registrations' => $details->count(),
                'status_stats' => $statusStats,
                'parity_stats' => $parityStats,
                'rows' => $details
            ],
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date'   => $endDate->format('Y-m-d'),
            ]
        ]);
    }

    /**
     * Report: Deliveries & Birth Outcomes
     */
    public function deliveries(Request $request): InertiaResponse
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date'   => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
        ]);

        $startDate = Carbon::parse($validated['start_date'] ?? Carbon::today()->startOfMonth())->startOfDay();
        $endDate   = Carbon::parse($validated['end_date']   ?? Carbon::today())->endOfDay();

        $query = RchDelivery::with(['pregnancy.patient'])
            ->whereBetween('delivery_datetime', [$startDate, $endDate]);

        // Aggregate Stats
        $modeStats = (clone $query)
            ->select('mode_of_delivery', DB::raw('count(*) as total'))
            ->groupBy('mode_of_delivery')
            ->pluck('total', 'mode_of_delivery');

        $outcomeStats = (clone $query)
            ->select('outcome', DB::raw('count(*) as total'))
            ->groupBy('outcome')
            ->pluck('total', 'outcome');

        // Detailed Rows
        $details = $query->orderBy('delivery_datetime', 'desc')->get()->map(function ($row) {
            return [
                'id' => $row->id,
                'date' => Carbon::parse($row->delivery_datetime)->format('Y-m-d H:i'),
                'mother_name' => $row->pregnancy->patient->first_name . ' ' . $row->pregnancy->patient->last_name,
                'file_number' => $row->pregnancy->patient->code,
                'mode' => $row->mode_of_delivery,
                'outcome' => $row->outcome,
                'gender' => $row->child_gender,
                'weight' => $row->birth_weight_kg,
                'apgar' => $row->apgar_score_1min . ' / ' . $row->apgar_score_5min
            ];
        });

        return Inertia::render('Reports/Rch/Deliveries', [
            'reportData' => [
                'start' => $startDate->format('d M Y'),
                'end'   => $endDate->format('d M Y'),
                'total_deliveries' => $details->count(),
                'mode_stats' => $modeStats,
                'outcome_stats' => $outcomeStats,
                'rows' => $details
            ],
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date'   => $endDate->format('Y-m-d'),
            ]
        ]);
    }

    /**
     * Report: Immunization Summary
     */
    public function immunizations(Request $request): InertiaResponse
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date'   => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
        ]);

        $startDate = Carbon::parse($validated['start_date'] ?? Carbon::today()->startOfMonth())->startOfDay();
        $endDate   = Carbon::parse($validated['end_date']   ?? Carbon::today())->endOfDay();

        $query = RchImmunization::with(['patient', 'vaccine'])
            ->whereBetween('administered_date', [$startDate, $endDate]);

        // Aggregate by Vaccine
        $vaccineStats = (clone $query)
            ->join('rch_vaccines', 'rch_immunizations.vaccine_id', '=', 'rch_vaccines.id')
            ->select('rch_vaccines.name', DB::raw('count(*) as total'))
            ->groupBy('rch_vaccines.name')
            ->get();

        $details = $query->orderBy('administered_date', 'desc')->get()->map(function ($row) {
            return [
                'id' => $row->id,
                'date' => Carbon::parse($row->administered_date)->format('Y-m-d'),
                'child_name' => $row->patient->first_name . ' ' . $row->patient->last_name,
                'file_number' => $row->patient->code,
                'vaccine' => $row->vaccine->name ?? 'Unknown',
                'batch' => $row->batch_number ?? '-',
                'age_at_admin' => Carbon::parse($row->patient->date_of_birth)->diffInWeeks(Carbon::parse($row->administered_date)) . ' wks'
            ];
        });

        return Inertia::render('Reports/Rch/Immunizations', [
            'reportData' => [
                'start' => $startDate->format('d M Y'),
                'end'   => $endDate->format('d M Y'),
                'total_vaccines' => $details->count(),
                'vaccine_stats' => $vaccineStats,
                'rows' => $details
            ],
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date'   => $endDate->format('Y-m-d'),
            ]
        ]);
    }

    /**
     * Report: RCH Stock on Hand
     */
    public function stockOnHand(Request $request): InertiaResponse
    {
        $validated = $request->validate([
            'store_id' => 'nullable|exists:siv_stores,id',
            'category_id' => 'nullable|exists:siv_productcategories,id',
            'product_id' => 'nullable|exists:siv_products,id',
        ]);

        $storeId = $validated['store_id'] ?? null;

        if (!$storeId) {
            $storeIds = SIV_Store::pluck('id');
            // Check if there are stores to prevent SQL errors on empty DB
            if ($storeIds->isEmpty()) {
                $sumColumns = "0"; 
            } else {
                $sumColumns = $storeIds->map(fn($id) => "pc.qty_$id")->join(' + ');
            }

            $stockQuery = DB::table('iv_productcontrol as pc')
                ->join('siv_products as p', 'pc.product_id', '=', 'p.id')
                ->leftJoin('siv_productcategories as cat', 'p.category_id', '=', 'cat.id')
                ->select(
                    'p.id as product_id',
                    'p.name as product_name',
                    'p.costprice',
                    'cat.name as category_name',
                    DB::raw("($sumColumns) as current_quantity")
                )
                ->whereRaw("($sumColumns) > 0"); // Safely filter out zero stock
        } else {
            $qtyColumn = 'pc.qty_' . $storeId;

            $stockQuery = DB::table('iv_productcontrol as pc')
                ->join('siv_products as p', 'pc.product_id', '=', 'p.id')
                ->leftJoin('siv_productcategories as cat', 'p.category_id', '=', 'cat.id')
                ->select(
                    'p.id as product_id',
                    'p.name as product_name',
                    'p.costprice',
                    'cat.name as category_name',
                    DB::raw("$qtyColumn as current_quantity")
                )
                ->where($qtyColumn, '>', 0); 
        }

        if ($request->filled('category_id')) {
            $stockQuery->where('p.category_id', $request->category_id);
        }
        if ($request->filled('product_id')) {
            $stockQuery->where('p.id', $request->product_id);
        }

        $stockOnHand = $stockQuery->orderBy('cat.name')->orderBy('p.name')->get();

        $totalValueSOH = $stockOnHand->sum(function ($item) {
            return (float)$item->current_quantity * (float)$item->costprice;
        });

        // We return the existing Inventory React View so you don't have to write it twice!
        return Inertia::render('Reports/Rch/StockOnHand', [
            'stockOnHand' => $stockOnHand,
            'totalValueSOH' => $totalValueSOH,
            'selectedStoreName' => $storeId ? (SIV_Store::find($storeId)->name ?? 'N/A') : 'All Stores',
            'stores' => SIV_Store::orderBy('name')->get(['id', 'name']),
            'categories' => SIV_ProductCategory::orderBy('name')->get(['id', 'name']),
            'productsList' => SIV_Product::orderBy('name')->get(['id', 'name']),
            'filters' => $validated,
        ]);
    }
}