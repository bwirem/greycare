<?php

namespace App\Http\Controllers\Orphanage;

use App\Http\Controllers\Controller;
use App\Models\Orphanage\OrpRegistration;
use App\Models\Orphanage\OrpRegistrationType;
use App\Models\Patient\Patient;     
use App\Models\Billing\BLSCustomer; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class OrpRegistrationController extends Controller
{
    public function index(Request $request)
    {
        $query = OrpRegistration::with([
            'registrationType',
            'user'
        ]);

        if ($request->search) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('childcode', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('institution', 'like', "%{$search}%")
                    ->orWhere('physicaladdress', 'like', "%{$search}%")
                    ->orWhere('contact', 'like', "%{$search}%");
            });
        }

        return Inertia::render(
            'Orphanage/Registrations/Index',
            [
                'registrations' => $query
                    ->latest('autocode')
                    ->paginate(10)
                    ->withQueryString(),

                'filters' => [
                    'search' => $request->search
                ]
            ]
        );
    }

    public function create()
    {
        return Inertia::render(
            'Orphanage/Registrations/Create',
            [
                'registrationTypes' => OrpRegistrationType::orderBy('description')
                    ->get([
                        'autocode',
                        'CODE',
                        'description'
                    ])
            ]
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name'           => ['required', 'string', 'max:255'],
            'middle_name'          => ['nullable', 'string', 'max:255'],
            'last_name'            => ['required', 'string', 'max:255'],
            'gender'               => ['required', 'string', 'in:Male,Female,Other'],
            'date_of_birth'        => ['required', 'date'],
            'registration_type_id' => ['required', 'exists:orpregistrationtype,autocode'],
            'institution'          => ['nullable', 'string', 'max:255'],
            'physicaladdress'      => ['nullable', 'string', 'max:255'],
            'contact'              => ['nullable', 'string', 'max:50'],
            'transdate'            => ['required', 'date'],
        ]);

        try {
            DB::beginTransaction();

            // 1. Generate the unique child code
            $childcode = $this->generateChildCode();

            // 2. Create Orphanage Registration
            OrpRegistration::create([
                'sysdate'              => now(),
                'transdate'            => $validated['transdate'],
                'childcode'            => $childcode,
                'first_name'           => $validated['first_name'],
                'middle_name'          => $validated['middle_name'],
                'last_name'            => $validated['last_name'],
                'gender'               => $validated['gender'],
                'date_of_birth'        => $validated['date_of_birth'],
                'registration_type_id' => $validated['registration_type_id'],
                'institution'          => $validated['institution'],
                'physicaladdress'      => $validated['physicaladdress'],
                'contact'              => $validated['contact'],
                'user_id'              => Auth::id(),
            ]);

            // 3. Sync to Patient records using childcode as the patient code
            Patient::create([
                'code'          => $childcode,
                'first_name'    => $validated['first_name'],
                'middle_name'   => $validated['middle_name'],
                'last_name'     => $validated['last_name'],
                'gender'        => $validated['gender'],
                'date_of_birth' => $validated['date_of_birth'],
                'phone_number'  => $validated['contact'] ?? 'N/A', 
                'address'       => $validated['physicaladdress'],  
                
                // Defaults since this is an orphanage registration
                'payment_category'        => 'Exemption', 
                'insurance_provider_id'   => null,
                'insurance_provider_name' => 'Orphanage Registration',
                'insurance_member_no'     => null,
            ]);

            // 4. Ensure Billing Customer exists
            BLSCustomer::firstOrCreate(
                ['patient_code' => $childcode], 
                [
                    'customer_type' => 'individual',
                    'first_name'    => $validated['first_name'],
                    'surname'       => $validated['last_name'],
                    'other_names'   => $validated['middle_name'],
                    'phone'         => $validated['contact'] ?? 'N/A',
                    'patient_code'  => $childcode,                    
                ]
            );

            DB::commit();

            return redirect()
                ->route('orphanage0.index')
                ->with('success', 'Registration created successfully. Child Code: ' . $childcode);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Orphanage Registration Store Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to create registration: ' . $e->getMessage()]);
        }
    }

    public function edit(OrpRegistration $registration)
    {
        return Inertia::render(
            'Orphanage/Registrations/Edit',
            [
                'registration' => $registration,
                'registrationTypes' => OrpRegistrationType::orderBy('description')
                    ->get(['autocode', 'CODE', 'description'])
            ]
        );
    }

    public function update(Request $request, OrpRegistration $registration)
    {
        $validated = $request->validate([
            'first_name'           => ['required', 'string', 'max:255'],
            'middle_name'          => ['nullable', 'string', 'max:255'],
            'last_name'            => ['required', 'string', 'max:255'],
            'gender'               => ['required', 'string', 'in:Male,Female,Other'],
            'date_of_birth'        => ['required', 'date'],
            'registration_type_id' => ['required', 'exists:orpregistrationtype,autocode'],
            'institution'          => ['nullable', 'string', 'max:255'],
            'physicaladdress'      => ['nullable', 'string', 'max:255'],
            'contact'              => ['nullable', 'string', 'max:50'],
            'transdate'            => ['required', 'date'],
        ]);

        try {
            DB::beginTransaction();

            // 1. Update Orphanage Registration
            $registration->update([
                'transdate'            => $validated['transdate'],
                'first_name'           => $validated['first_name'],
                'middle_name'          => $validated['middle_name'],
                'last_name'            => $validated['last_name'],
                'gender'               => $validated['gender'],
                'date_of_birth'        => $validated['date_of_birth'],
                'registration_type_id' => $validated['registration_type_id'],
                'institution'          => $validated['institution'],
                'physicaladdress'      => $validated['physicaladdress'],
                'contact'              => $validated['contact'],
            ]);

            // 2. Update existing Patient record (or create if it somehow didn't exist)
            Patient::updateOrCreate(
                ['code' => $registration->childcode],
                [
                    'first_name'    => $validated['first_name'],
                    'middle_name'   => $validated['middle_name'],
                    'last_name'     => $validated['last_name'],
                    'gender'        => $validated['gender'],
                    'date_of_birth' => $validated['date_of_birth'],
                    'phone_number'  => $validated['contact'] ?? 'N/A',
                    'address'       => $validated['physicaladdress'],
                    // Fallback fields in case it needs to be created from scratch
                    'payment_category'        => 'Exemption', 
                    'insurance_provider_id'   => null,
                    'insurance_provider_name' => 'Orphanage Registration',
                    'insurance_member_no'     => null,
                ]
            );

            // 3. Update existing Billing Customer (or create if it somehow didn't exist)
            BLSCustomer::updateOrCreate(
                ['patient_code' => $registration->childcode],
                [
                    'customer_type' => 'individual',
                    'first_name'    => $validated['first_name'],
                    'surname'       => $validated['last_name'],
                    'other_names'   => $validated['middle_name'],
                    'phone'         => $validated['contact'] ?? 'N/A',
                ]
            );

            DB::commit();

            return redirect()
                ->route('orphanage0.index')
                ->with('success', 'Registration updated successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Orphanage Registration Update Error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update registration: ' . $e->getMessage()]);
        }
    }

    public function destroy(OrpRegistration $registration)
    {
        $registration->delete();

        return back()->with('success', 'Registration deleted successfully.');
    }

    /**
     * Generates a unique child code formatted as CHD-YYYY-XXXX (e.g. CHD-2024-0001)
     */
    private function generateChildCode(): string
    {
        $prefix = 'CHD-' . date('Y') . '-';
        
        $lastRegistration = OrpRegistration::where('childcode', 'like', $prefix . '%')
            ->latest('autocode')
            ->first();

        if (!$lastRegistration) {
            return $prefix . '0001';
        }

        $lastCode = $lastRegistration->childcode;
        $number = (int) substr($lastCode, strrpos($lastCode, '-') + 1);
        
        return $prefix . str_pad($number + 1, 4, '0', STR_PAD_LEFT);
    }
}