<?php

namespace App\Models\Opd;

use Illuminate\Database\Eloquent\Model;
use App\Models\Patient\Patient;
use App\Models\User;
// Billing
use App\Models\Billing\PatientBillingGroup; // Assuming you created this in App\Models\Billing
use App\Models\Billing\PatientBillingSubgroup;
// Medical Records
use App\Models\MedicalRecord\MrVitalSign;
use App\Models\MedicalRecord\MrHistory;
use App\Models\MedicalRecord\MrHistoryComplain;
use App\Models\MedicalRecord\MrAssessment;
use App\Models\MedicalRecord\MrAssessmentComplain;
use App\Models\MedicalRecord\MrExamination;
use App\Models\MedicalRecord\MrPatientDiagnosisConfirmed;
use App\Models\MedicalRecord\MrPatientDiagnosisProvisional;
use App\Models\MedicalRecord\MrPatientDiagnosisIcdConfirmed;
use App\Models\MedicalRecord\MrPatientDiagnosisIcdProvisional;

class OpdBooking extends Model
{
    protected $table = 'opd_bookings';
    protected $guarded = [];

    // ------------------------------------------------------------------
    // Core Relations
    // ------------------------------------------------------------------

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patientcode', 'code');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function treatmentPoint()
    {
        return $this->belongsTo(OpdTreatmentPoint::class, 'treatmentpoint_id');
    }

    public function billingGroup()
    {
        return $this->belongsTo(PatientBillingGroup::class, 'billinggroup_id');
    }

    public function billingSubgroup()
    {
        return $this->belongsTo(PatientBillingSubgroup::class, 'billingsubgroup_id');
    }

    // ------------------------------------------------------------------
    // Medical Records - Clinical Data
    // ------------------------------------------------------------------

    public function vitalSigns()
    {
        return $this->hasMany(MrVitalSign::class, 'opd_booking_id');
    }

    public function history()
    {
        return $this->hasOne(MrHistory::class, 'opd_booking_id');
    }

    public function historyComplains()
    {
        return $this->hasMany(MrHistoryComplain::class, 'opd_booking_id');
    }

    public function assessment()
    {
        return $this->hasOne(MrAssessment::class, 'opd_booking_id');
    }

    public function assessmentComplains()
    {
        return $this->hasMany(MrAssessmentComplain::class, 'opd_booking_id');
    }

    public function examination()
    {
        return $this->hasOne(MrExamination::class, 'opd_booking_id');
    }

    // ------------------------------------------------------------------
    // Medical Records - Diagnoses (The 4 Categories)
    // ------------------------------------------------------------------

    public function diagnosesConfirmed()
    {
        return $this->hasMany(MrPatientDiagnosisConfirmed::class, 'opd_booking_id');
    }

    public function diagnosesProvisional()
    {
        return $this->hasMany(MrPatientDiagnosisProvisional::class, 'opd_booking_id');
    }

    public function icdDiagnosesConfirmed()
    {
        return $this->hasMany(MrPatientDiagnosisIcdConfirmed::class, 'opd_booking_id');
    }

    public function icdDiagnosesProvisional()
    {
        return $this->hasMany(MrPatientDiagnosisIcdProvisional::class, 'opd_booking_id');
    }
}