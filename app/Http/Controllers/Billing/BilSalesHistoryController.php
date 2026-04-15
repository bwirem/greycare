<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\HandlesVoiding;
use Illuminate\Http\Request;
use Carbon\Carbon;

use App\Models\Billing\BILSale;
use App\Models\Facility\FacilityOption;
use App\Models\Patient\PatientBillingGroup; // Make sure this is imported

use Illuminate\Support\Facades\Validator;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;
use Carbon\CarbonPeriod; // Potentially useful for date ranges in titles

use Maatwebsite\Excel\Facades\Excel;
use App\Exports\SalesHistoryExport; // We will create this class in Step 2

class BilSalesHistoryController extends Controller
{
    use HandlesVoiding;

    public function saleHistory(Request $request)
    {
        // --- 1. Set Default Dates & Variables ---
        $today = now()->format('Y-m-d');
        $startDate = $request->input('start_date', $today);
        $endDate = $request->input('end_date', $today);
        $billingGroupId = $request->input('billinggroup_id'); 
        $searchTerm = $request->input('search', ''); // Get search term for passing to filters

        // --- 2. Build the Query ---
        $query = BILSale::with(['items', 'customer']); 

        if ($searchTerm) { // Use searchTerm here
            $query->where(function ($q) use ($searchTerm) {
                $q->whereHas('customer', function ($subQ) use ($searchTerm) {
                    $subQ->where('first_name', 'like', '%' . $searchTerm . '%')
                         ->orWhere('surname', 'like', '%' . $searchTerm . '%')
                         ->orWhere('other_names', 'like', '%' . $searchTerm . '%')
                         ->orWhere('company_name', 'like', '%' . $searchTerm . '%');
                })->orWhere('receiptno', 'like', '%' . $searchTerm . '%')
                  ->orWhere('invoiceno', 'like', '%' . $searchTerm . '%');
            });
        }

        // --- 3. Apply Filters ---
        $parsedStartDate = Carbon::parse($startDate)->startOfDay();
        $parsedEndDate = Carbon::parse($endDate)->endOfDay();
        $query->whereBetween('created_at', [$parsedStartDate, $parsedEndDate]);

        if ($billingGroupId) {
            $query->where('billinggroup_id', $billingGroupId);
        }

        $query->where('voided', '=', 0);

        $sales = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();

        // Fetch Billing Groups for the Dropdown
        $billingGroups = PatientBillingGroup::orderBy('name')->get(['id', 'name']);

        // --- 4. Return Data to Inertia View ---
        return Inertia::render('Billing/BilHistory/SaleHistory', [
            'sales' => $sales,
            'billingGroups' => $billingGroups,
            'filters' => [
                'search'          => $searchTerm, // Pass searchTerm back to filters
                'start_date'      => $startDate,
                'end_date'        => $endDate,
                'billinggroup_id' => $billingGroupId,
            ],
        ]);
    }

    /**
     * Export a list of sales based on filter criteria to PDF or Excel.
     * This function will use the same filtering logic as saleHistory().
     *
     * @param Request $request
     * @return \Illuminate\Http\Response|\Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function export(Request $request)
    {
        // 1. Validate Filters and Format
        $validated = $request->validate([
            'search'          => 'nullable|string',
            'start_date'      => 'nullable|date_format:Y-m-d',
            'end_date'        => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
            'billinggroup_id' => 'nullable|exists:patient_billing_groups,id',
            'format'          => 'required|string|in:pdf,excel', // Ensure format is specified
        ]);

        $startDate      = Carbon::parse($validated['start_date'] ?? now()->format('Y-m-d'))->startOfDay();
        $endDate        = Carbon::parse($validated['end_date']   ?? now()->format('Y-m-d'))->endOfDay();
        $billingGroupId = $validated['billinggroup_id'] ?? null;
        $searchTerm     = $validated['search'] ?? null;
        $format         = $validated['format'];

        // 2. Build the Query (similar to saleHistory, but without pagination)
        $query = BILSale::with(['customer']); 

        if ($searchTerm) {
            $query->where(function ($q) use ($searchTerm) {
                $q->whereHas('customer', function ($subQ) use ($searchTerm) {
                    $subQ->where('first_name', 'like', '%' . $searchTerm . '%')
                         ->orWhere('surname', 'like', '%' . $searchTerm . '%')
                         ->orWhere('other_names', 'like', '%' . $searchTerm . '%')
                         ->orWhere('company_name', 'like', '%' . $searchTerm . '%');
                })->orWhere('receiptno', 'like', '%' . $searchTerm . '%')
                  ->orWhere('invoiceno', 'like', '%' . $searchTerm . '%');
            });
        }

        $query->whereBetween('created_at', [$startDate, $endDate]);

        if ($billingGroupId) {
            $query->where('billinggroup_id', $billingGroupId);
        }

        $query->where('voided', '=', 0);

        $sales = $query->orderBy('created_at', 'desc')->get(); // Get all results, not paginated

        // 3. Handle Export Format
        if ($format === 'pdf') {
            $facility = FacilityOption::first(); 
            
            // Get billing group name for display in PDF title/filters
            $billingGroupName = $billingGroupId ? (PatientBillingGroup::find($billingGroupId)->name ?? 'N/A') : 'All';

            $pdf = Pdf::loadView('pdfs.sales_list_report', [
                'sales' => $sales,
                'filters' => [
                    'start_date'      => $startDate,
                    'end_date'        => $endDate,
                    'billinggroup_id' => $billingGroupId,
                    'billing_group_name' => $billingGroupName, // Pass name for display
                    'search'          => $searchTerm,
                ],
                'facility' => $facility,
            ]);

            // Construct a dynamic filename
            $filename = 'Sales_Report_';
            if ($startDate->isSameDay($endDate)) {
                $filename .= $startDate->format('Y-m-d');
            } else {
                $filename .= $startDate->format('Y-m-d') . '_to_' . $endDate->format('Y-m-d');
            }
            if ($billingGroupId) {
                $filename .= '_BG_' . str_replace(' ', '_', $billingGroupName);
            }
            if ($searchTerm) {
                $filename .= '_Search_' . str_replace(' ', '_', $searchTerm);
            }
            $filename .= '.pdf';

            return $pdf->stream($filename);

        } elseif ($format === 'excel') {
            
            // Construct a dynamic filename
            $filename = 'Sales_Report_';
            if ($startDate->isSameDay($endDate)) {
                $filename .= $startDate->format('Y-m-d');
            } else {
                $filename .= $startDate->format('Y-m-d') . '_to_' . $endDate->format('Y-m-d');
            }
            $filename .= '.xlsx';

            // Pass the $sales collection to the Export class
            return Excel::download(
                new SalesHistoryExport($sales), 
                $filename
            );
        }
    }

    /**
     * Display the detailed preview page for a single sale.
     *
     * @param BILSale $sale
     * @return \Inertia\Response
     */
    public function previewSale(BILSale $sale)
    {       
        $sale->load(['customer','items.item']); 

        return Inertia::render('Billing/BilHistory/SalePreview', [
            'sale' => $sale,           
        ]);
    }

    /**
     * Handle the request to void a sale.
     *
     * @param Request $request
     * @param BILSale $sale
     * @return \Illuminate\Http\RedirectResponse
     */    

    public function postVoidSale(Request $request, BILSale $sale)
    {
        $validated = $request->validate([
            'remarks' => 'required|string|min:5|max:255',
        ]);

        try {
            if ($sale->invoiceno) {
                $this->voidInvoice($sale, now(), $validated['remarks']);
            } else {
                $this->voidReceipt($sale->receiptno, now(), $validated['remarks']);
            }
            
            return redirect()->route('billing3.preview', $sale->id)
                            ->with('success', 'Sale voided successfully.');

        } catch (\Exception $e) {
            \Log::error('Failed to void sale: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return back()->with('error', 'Failed to void sale.');
        }
    }

    /**
     * Generate and stream the Invoice/Receipt PDF.
     */
    public function printInvoice(BILSale $sale)
    {
        $sale->load(['customer', 'items.item']);
        $facility = FacilityOption::first(); 
        $pdf = Pdf::loadView('pdfs.sale_invoice', [
            'sale' => $sale,
            'facility' => $facility,
        ]);
        return $pdf->stream('invoice_' . ($sale->invoiceno ?? $sale->receiptno) . '.pdf');
    }

    /**
     * Generate and stream the Delivery Note PDF.
     */
    public function printDeliveryNote(BILSale $sale)
    {
        $sale->load(['customer', 'items.item']);
        $facility = FacilityOption::first();
        $pdf = Pdf::loadView('pdfs.sale_delivery_note', [
            'sale' => $sale,
            'facility' => $facility,
        ]);
        return $pdf->stream('delivery_note_' . ($sale->invoiceno ?? $sale->receiptno) . '.pdf');
    }
}