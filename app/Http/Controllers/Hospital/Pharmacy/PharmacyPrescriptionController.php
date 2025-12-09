<?php

namespace App\Http\Controllers\Hospital\Pharmacy;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Pharmacy\PharmacyPrescription;

class PharmacyPrescriptionController extends Controller
{
    /**
     * List All Prescriptions (History)
     */
    public function index(Request $request)
    {
        $query = PharmacyPrescription::with(['patient', 'product', 'doctor'])
            ->orderBy('created_at', 'desc');

        if ($request->search) {
            $query->whereHas('patient', function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%");
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return Inertia::render('Hospital/Pharmacy/Prescriptions/Index', [
            'prescriptions' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    /**
     * Show Details
     */
    public function show(PharmacyPrescription $prescription)
    {
        $prescription->load(['patient', 'product', 'doctor', 'dispensations.pharmacist']);

        return Inertia::render('Hospital/Pharmacy/Prescriptions/Show', [
            'prescription' => $prescription
        ]);
    }

    /**
     * Cancel Prescription
     */
    public function cancel(Request $request, PharmacyPrescription $prescription)
    {
        if ($prescription->status === 'Dispensed') {
            return back()->withErrors(['error' => 'Cannot cancel a dispensed prescription.']);
        }

        $prescription->update(['status' => 'Cancelled']);

        return back()->with('success', 'Prescription cancelled.');
    }
}