<?php

namespace App\Http\Controllers\HumanResource\Payroll;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

// Models
use App\Models\HumanResource\PayPayrollPeriod;
use App\Models\HumanResource\PaySlip;
use App\Models\HumanResource\PaySlipItem;
use App\Models\HumanResource\HrmEmployee;
use App\Models\HumanResource\PayTaxBracket;
use App\Models\HumanResource\PaySocialSecurityType;
use App\Models\HumanResource\PayInsuranceType;
use App\Models\HumanResource\PayEmployeeLoan;

class PayPayrollController extends Controller
{
    /**
     * List all Payroll Periods (Months).
     */
    public function index(Request $request)
    {
        $query = PayPayrollPeriod::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $periods = $query->orderBy('start_date', 'desc')->paginate(10);

        return Inertia::render('HumanResource/Payroll/Index', [
            'periods' => $periods,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show form to create new period.
     */
    public function create()
    {
        return Inertia::render('HumanResource/Payroll/Create');
    }

    /**
     * Store new payroll period.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'year' => 'required|integer|min:2000|max:2099',
            'month' => 'required|integer|min:1|max:12',
        ]);

        $startDate = Carbon::create($validated['year'], $validated['month'], 1);
        $endDate = $startDate->copy()->endOfMonth();
        $code = $startDate->format('Y-m'); // e.g. 2025-01
        $name = $startDate->format('F Y'); // e.g. January 2025

        // Prevent duplicates
        if (PayPayrollPeriod::where('code', $code)->exists()) {
            return back()->withErrors(['year' => 'Payroll period for this month already exists.']);
        }

        PayPayrollPeriod::create([
            'code' => $code,
            'name' => $name,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => 'Draft'
        ]);

        return redirect()->route('humanresurces3.index')
            ->with('success', 'Payroll Period created.');
    }

    /**
     * Manage a specific period (The Calculation Dashboard).
     */
    public function manage($id)
    {
        $period = PayPayrollPeriod::findOrFail($id);
        
        // Fetch generated slips
        $slips = PaySlip::with(['employee'])
            ->where('payroll_period_id', $id)
            ->paginate(15);

        // Summary Stats
        $stats = [
            'total_gross' => PaySlip::where('payroll_period_id', $id)->sum('gross_salary'),
            'total_net' => PaySlip::where('payroll_period_id', $id)->sum('net_pay'),
            'employee_count' => PaySlip::where('payroll_period_id', $id)->count(),
        ];

        return Inertia::render('HumanResource/Payroll/Manage', [
            'period' => $period,
            'slips' => $slips,
            'stats' => $stats
        ]);
    }

    /**
     * The Engine: Generate Payslips.
     */
    public function generatePayslips(Request $request, $id)
    {
        $period = PayPayrollPeriod::findOrFail($id);

        if ($period->status === 'Paid') {
            return back()->with('error', 'Cannot regenerate. Payroll is already closed/paid.');
        }

        DB::transaction(function () use ($period) {
            // 1. Cleanup existing drafts for this period
            PaySlip::where('payroll_period_id', $period->id)->delete();

            // 2. Fetch Active Employees with Job Details
            $employees = HrmEmployee::with(['currentJob', 'banking'])
                ->where('status', 'Active')
                ->get();

            // 3. Fetch Configurations (Tax, NSSF, NHIF)
            $taxBrackets = PayTaxBracket::orderBy('lower_limit', 'asc')->get();
            // Assuming default types for now, normally linked to employee config
            $nssfConfig = PaySocialSecurityType::first(); 
            $nhifConfig = PayInsuranceType::first();

            foreach ($employees as $emp) {
                if (!$emp->currentJob) continue;

                $job = $emp->currentJob;
                
                // --- A. Earnings ---
                $basic = $job->basic_salary;
                $house = $job->house_allowance ?? 0;
                $transport = $job->transport_allowance ?? 0;
                $gross = $basic + $house + $transport;

                // --- B. Statutory Deductions ---
                
                // 1. NSSF (Simplified Tier logic)
                $nssf = 0;
                if ($nssfConfig) {
                    $pensionable = ($nssfConfig->max_deductible_amount > 0) 
                        ? min($gross, $nssfConfig->max_deductible_amount) 
                        : $gross;
                    $nssf = $pensionable * ($nssfConfig->employee_rate / 100);
                }

                // Taxable Income
                $taxableIncome = $gross - $nssf;

                // 2. PAYE Tax (Bracket Calculation)
                $paye = 0;
                $remainingIncome = $taxableIncome;

                // Simple bracket logic: assuming brackets are non-cumulative/tiered correctly in DB
                // Standard PAYE is usually cumulative. 
                // Logic: Iterate bands.
                $paye = $this->calculatePaye($taxableIncome, $taxBrackets);

                // Personal Relief (Hardcoded for standard KE/EA, should be in config)
                $personalRelief = 2400; 
                $paye = max(0, $paye - $personalRelief);

                // 3. NHIF (Simplified: Rate % or lookup table)
                // Assuming simple % for this example or Fixed from config
                $nhif = 0;
                if ($nhifConfig) {
                    if($nhifConfig->rate > 0) {
                        $nhif = $gross * ($nhifConfig->rate / 100);
                    } else {
                        $nhif = $nhifConfig->fixed_amount; // e.g. 1700 max
                    }
                }
                
                // 4. Housing Levy (1.5% - Standard recent addition)
                $housingLevy = $gross * 0.015;

                // --- C. Loans & Advances ---
                $loanDeduction = 0;
                $activeLoans = PayEmployeeLoan::where('employee_id', $emp->id)
                    ->where('is_active', true)
                    ->get();
                
                $loanItems = [];
                foreach($activeLoans as $loan) {
                    $deduction = min($loan->monthly_installment, $loan->current_balance);
                    $loanDeduction += $deduction;
                    $loanItems[] = [
                        'loan_id' => $loan->id,
                        'amount' => $deduction,
                        'ref' => $loan->loan_reference
                    ];
                }

                // --- D. Net Pay ---
                $totalDeductions = $nssf + $paye + $nhif + $housingLevy + $loanDeduction;
                $netPay = $gross - $totalDeductions;

                // --- E. Save Payslip Header ---
                $slip = PaySlip::create([
                    'payroll_period_id' => $period->id,
                    'employee_id' => $emp->id,
                    'job_title_snapshot' => $job->position->title ?? '',
                    'department_snapshot' => $job->department->name ?? '',
                    'basic_salary' => $basic,
                    'total_allowances' => $house + $transport,
                    'gross_salary' => $gross,
                    'taxable_income' => $taxableIncome,
                    'tax_amount' => $paye,
                    'total_deductions' => $totalDeductions,
                    'net_pay' => $netPay,
                    'is_paid' => false
                ]);

                // --- F. Save Line Items ---
                $this->saveItem($slip, 'Basic Salary', 'Earning', $basic, true);
                if($house > 0) $this->saveItem($slip, 'House Allowance', 'Earning', $house, true);
                if($transport > 0) $this->saveItem($slip, 'Transport Allowance', 'Earning', $transport, true);

                if($nssf > 0) $this->saveItem($slip, 'NSSF', 'Deduction', $nssf);
                if($paye > 0) $this->saveItem($slip, 'PAYE Tax', 'Tax', $paye);
                if($nhif > 0) $this->saveItem($slip, 'NHIF/SHIF', 'Deduction', $nhif);
                if($housingLevy > 0) $this->saveItem($slip, 'Housing Levy', 'Deduction', $housingLevy);

                foreach($loanItems as $l) {
                    PaySlipItem::create([
                        'pay_slip_id' => $slip->id,
                        'name' => 'Loan: ' . $l['ref'],
                        'type' => 'Deduction',
                        'amount' => $l['amount'],
                        'loan_id' => $l['loan_id']
                    ]);
                }
            }

            $period->update(['status' => 'Processing']);
        });

        return back()->with('success', 'Payroll Generated Successfully.');
    }

    /**
     * Helper: Save Slip Item
     */
    private function saveItem($slip, $name, $type, $amount, $taxable = false)
    {
        PaySlipItem::create([
            'pay_slip_id' => $slip->id,
            'name' => $name,
            'type' => $type,
            'amount' => $amount,
            'is_taxable' => $taxable
        ]);
    }

    /**
     * Helper: Calculate Cumulative PAYE
     */
    private function calculatePaye($income, $brackets)
    {
        $tax = 0;
        $previousLimit = 0;

        foreach ($brackets as $bracket) {
            if ($income <= $previousLimit) break;

            $taxableInBand = 0;
            if (!$bracket->upper_limit) {
                // Infinity band
                $taxableInBand = $income - $previousLimit;
            } else {
                $taxableInBand = min($income, $bracket->upper_limit) - $previousLimit;
            }

            if ($taxableInBand > 0) {
                $tax += $taxableInBand * ($bracket->rate / 100);
            }

            $previousLimit = $bracket->upper_limit;
        }

        return $tax;
    }

    /**
     * Approve Payroll (Lock it).
     */
    public function approve($id)
    {
        $period = PayPayrollPeriod::findOrFail($id);
        $period->update(['status' => 'Approved']);
        return back()->with('success', 'Payroll Approved. Ready for Payment.');
    }

    /**
     * Mark as Paid (Update Loans, Close Period).
     */
    public function markAsPaid($id)
    {
        $period = PayPayrollPeriod::findOrFail($id);
        
        if($period->status !== 'Approved') {
            return back()->with('error', 'Payroll must be Approved first.');
        }

        DB::transaction(function () use ($period) {
            // 1. Update Loan Balances
            $loanItems = PaySlipItem::whereHas('slip', function($q) use ($period) {
                    $q->where('payroll_period_id', $period->id);
                })
                ->whereNotNull('loan_id')
                ->get();

            foreach($loanItems as $item) {
                $loan = PayEmployeeLoan::find($item->loan_id);
                if($loan) {
                    $loan->current_balance -= $item->amount;
                    if($loan->current_balance <= 0) {
                        $loan->current_balance = 0;
                        $loan->is_active = false;
                    }
                    $loan->save();
                }
            }

            // 2. Mark Slips as Paid
            PaySlip::where('payroll_period_id', $period->id)->update(['is_paid' => true]);

            // 3. Close Period
            $period->update(['status' => 'Paid', 'pay_date' => Carbon::now()]);
        });

        return back()->with('success', 'Payroll Paid. Loan balances updated.');
    }
}