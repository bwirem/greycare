<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Billing\BILControlNumber;
use App\Services\Billing\ControlNumberService;
use Inertia\Inertia;

class BilControlPaymentController extends Controller
{
    protected $service;

    public function __construct(ControlNumberService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $query = BILControlNumber::with('user');

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('patient_name', 'like', '%' . $request->search . '%')
                  ->orWhere('patient_code', 'like', '%' . $request->search . '%')
                  ->orWhere('controlno', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('status')) {
            $query->where('numberstatus', $request->status);
        }

        $payments = $query->orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('Billing/Payments/Index', [
            'payments' => $payments,
            'filters' => $request->only(['search','status']),
        ]);
    }

    public function requestControlNumber(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|string',
            'patient_name' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'description' => 'nullable|string',
            'mobile_number' => 'required|string',
            'payment_ref' => 'required|string',
        ]);

        $result = $this->service->generateControlNumber($validated);

        return response()->json($result);
    }

    public function checkPaymentStatus(Request $request)
    {
        $request->validate(['payment_ref' => 'required|string']);

        $bill = BILControlNumber::where('payment_reference', $request->payment_ref)->firstOrFail();

        $result = $this->service->checkPayment($bill);

        return response()->json($result);
    }
}