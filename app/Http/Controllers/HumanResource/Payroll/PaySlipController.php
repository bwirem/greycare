<?php

namespace App\Http\Controllers\HumanResource\Payroll;

use App\Http\Controllers\Controller;
use App\Models\HumanResource\PaySlip;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf; // Optional if you use dompdf, otherwise we use window.print() in JS

class PaySlipController extends Controller
{
    /**
     * Display a global list of payslips (Searchable by employee across periods).
     */
    public function index(Request $request)
    {
        $query = PaySlip::with(['employee', 'payrollPeriod']);

        if ($request->filled('search')) {
            $query->whereHas('employee', function($q) use ($request) {
                $q->where('first_name', 'like', '%' . $request->search . '%')
                  ->orWhere('last_name', 'like', '%' . $request->search . '%')
                  ->orWhere('employee_code', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('period')) {
            $query->whereHas('payrollPeriod', function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->period . '%');
            });
        }

        $slips = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('HumanResource/Payslips/Index', [
            'slips' => $slips,
            'filters' => $request->only(['search', 'period']),
        ]);
    }

    /**
     * Display the specific payslip details.
     */
    public function show(PaySlip $slip)
    {
        // Load relationships: Items (earnings/deductions), Employee, Period
        $slip->load(['items', 'employee', 'payrollPeriod']);

        return Inertia::render('HumanResource/Payslips/Show', [
            'slip' => $slip,
        ]);
    }

    /**
     * Print View (Simplified Layout).
     * Usually handled by the frontend print style, but can be a separate Inertia page if needed.
     * Here we redirect to Show with a mode, or just reuse Show.
     */
    public function print(PaySlip $slip)
    {
        $slip->load(['items', 'employee', 'payrollPeriod']);
        return Inertia::render('HumanResource/Payslips/Print', [
            'slip' => $slip,
        ]);
    }

    /**
     * Email Payslip (Stub).
     */
    public function email(PaySlip $slip)
    {
        // Logic to generate PDF and mail it would go here.
        // Mail::to($slip->employee->email)->send(new PayslipMail($slip));
        
        return back()->with('success', 'Email queued successfully (Simulation).');
    }
}