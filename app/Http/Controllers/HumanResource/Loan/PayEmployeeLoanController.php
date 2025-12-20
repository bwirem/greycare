<?php

namespace App\Http\Controllers\HumanResource\Loan;

use App\Http\Controllers\Controller;
use App\Models\HumanResource\PayEmployeeLoan;
use App\Models\HumanResource\HrmEmployee;
use App\Models\HumanResource\PayFinancier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class PayEmployeeLoanController extends Controller
{
    /**
     * Display listing of loans.
     */
    public function index(Request $request)
    {
        $query = PayEmployeeLoan::with(['employee', 'financier']);

        if ($request->filled('search')) {
            $query->whereHas('employee', function($q) use ($request) {
                $q->where('first_name', 'like', '%' . $request->search . '%')
                  ->orWhere('last_name', 'like', '%' . $request->search . '%');
            })->orWhere('loan_reference', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('status')) {
            if ($request->status === 'active') $query->where('is_active', true);
            if ($request->status === 'completed') $query->where('is_active', false);
        }

        $loans = $query->orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('HumanResource/Loan/Index', [
            'loans' => $loans,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show form to create new loan.
     */
    public function create()
    {
        return Inertia::render('HumanResource/Loan/Create', [
            'employees' => HrmEmployee::select('id', 'first_name', 'last_name', 'employee_code')
                ->where('status', 'Active')
                ->get(),
            'financiers' => PayFinancier::select('id', 'name')->get(),
        ]);
    }

    /**
     * Store a newly created loan.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:hrm_employees,id',
            'financier_id' => 'nullable|exists:pay_financiers,id', // Null = Company Loan
            'loan_reference' => 'nullable|string|max:50',
            'principal_amount' => 'required|numeric|min:1',
            'interest_rate' => 'required|numeric|min:0', // % per annum or flat? Usually per annum or flat rate.
            'monthly_installment' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'duration_months' => 'required|integer|min:1', 
        ]);

        // Auto-calculate end date based on duration
        $startDate = Carbon::parse($validated['start_date']);
        $endDate = $startDate->copy()->addMonths($validated['duration_months']);

        // Current balance starts as principal (assuming interest is calculated monthly or flat added)
        // For simple payroll, usually Total Repayable = Principal + Interest. 
        // Here we keep it simple: Balance tracks what is left to pay.
        
        PayEmployeeLoan::create([
            'employee_id' => $validated['employee_id'],
            'financier_id' => $validated['financier_id'],
            'loan_reference' => $validated['loan_reference'] ?? 'LN-' . time(),
            'principal_amount' => $validated['principal_amount'],
            'interest_rate' => $validated['interest_rate'],
            'monthly_installment' => $validated['monthly_installment'],
            'current_balance' => $validated['principal_amount'], // Logic depends on your interest policy
            'start_date' => $validated['start_date'],
            'end_date' => $endDate,
            'is_active' => true,
        ]);

        return redirect()->route('humanresurces2.index')
            ->with('success', 'Loan created successfully.');
    }

    /**
     * Show form for editing.
     */
    public function edit(PayEmployeeLoan $loan)
    {
        return Inertia::render('HumanResource/Loan/Edit', [
            'loan' => $loan,
            'employees' => HrmEmployee::select('id', 'first_name', 'last_name')->get(), // Read-only mostly
            'financiers' => PayFinancier::select('id', 'name')->get(),
        ]);
    }

    /**
     * Update loan details.
     */
    public function update(Request $request, PayEmployeeLoan $loan)
    {
        $validated = $request->validate([
            'loan_reference' => 'nullable|string',
            'monthly_installment' => 'required|numeric',
            'current_balance' => 'required|numeric', // Allow manual adjustment
            'end_date' => 'required|date',
            'is_active' => 'boolean'
        ]);

        $loan->update($validated);

        return redirect()->route('humanresurces2.index')
            ->with('success', 'Loan details updated.');
    }

    /**
     * Stop/Pause a loan deduction.
     */
    public function stopDeduction(PayEmployeeLoan $loan)
    {
        $loan->update(['is_active' => false]);
        return back()->with('success', 'Loan deduction stopped.');
    }

    /**
     * Delete a loan record.
     */
    public function destroy(PayEmployeeLoan $loan)
    {
        $loan->delete();
        return redirect()->route('humanresurces2.index')
            ->with('success', 'Loan record deleted.');
    }

    /**
     * View Repayment Schedule (Simulation).
     */
    public function viewSchedule(PayEmployeeLoan $loan)
    {
        // Simple projection logic
        $schedule = [];
        $balance = $loan->current_balance;
        $date = Carbon::parse($loan->start_date);
        
        // If loan started in past, adjust date to next pay cycle
        if($date->isPast()) {
            $date = Carbon::now()->startOfMonth()->addMonth();
        }

        while ($balance > 0) {
            $amount = min($balance, $loan->monthly_installment);
            $balance -= $amount;
            $schedule[] = [
                'date' => $date->format('M Y'),
                'amount' => $amount,
                'balance' => $balance
            ];
            $date->addMonth();
            if(count($schedule) > 60) break; // Safety break
        }

        return Inertia::render('HumanResource/Loan/Schedule', [
            'loan' => $loan->load('employee'),
            'schedule' => $schedule
        ]);
    }
}