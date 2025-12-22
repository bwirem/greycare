<?php

namespace App\Services;

use App\Models\Opd\OpdBooking;
use App\Models\Opd\Config\DoctorSpecialization;
use App\Models\User;
use Carbon\Carbon;

class ConsultationPricingService
{
    public function determineConsultationCharge($patientCode, $doctorId = null)
    {
        // 1. Identify Specialization
        $specialization = null;
        if ($doctorId) {
            $doctor = User::with('specialization')->find($doctorId);
            $specialization = $doctor?->specialization;
        }

        // Fallback: If no doctor/spec, try to find a "General" one or default
        if (!$specialization) {
            $specialization = DoctorSpecialization::where('name', 'General')->first() 
                              ?? DoctorSpecialization::first(); 
        }

        if (!$specialization) return null; 

        // 2. Check History for THIS Specialization
        $lastVisit = OpdBooking::where('patientcode', $patientCode)
            ->whereHas('user.specialization', function($q) use ($specialization) {
                $q->where('id', $specialization->id);
            })
            ->latest('created_at')
            ->first();

        // 3. Logic: Calculate Days
        $isRevisit = false;
        if ($lastVisit) {
            $daysSince = Carbon::parse($lastVisit->created_at)->diffInDays(now());
            if ($daysSince <= $specialization->revisit_days) {
                $isRevisit = true;
            }
        }

        // 4. Fetch the Billing Item Rule
        $ruleType = $isRevisit ? 'revisit' : 'new';
        $rule = $specialization->getRule($ruleType);

        return [
            'bill_item_id' => $rule?->bill_item_id,
            'classification' => $isRevisit ? 'Revisit' : 'New Case',
            'specialization_name' => $specialization->name
        ];
    }
}