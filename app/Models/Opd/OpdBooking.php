<?php

namespace App\Models\Opd;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute; // <--- Added this import for visitNumber()
use App\Models\Patient\Patient;
use App\Models\User;
use App\Models\Opd\OpdTreatmentPoint; // <--- Added this import
use App\Models\Opd\Appointment; // <--- Added this import

// Billing
use App\Models\Patient\PatientBillingGroup;
use App\Models\Patient\PatientBillingSubgroup;

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
// Laboratory
use App\Models\Laboratory\LabPrescription;
// Radiology
use App\Models\Radiology\RadRequest;

class OpdBooking extends Model
{
    protected $table = 'opd_bookings';
    protected $guarded = [];

    // ------------------------------------------------------------------
    // Accessors
    // ------------------------------------------------------------------

    /**
     * Generates a Human Readable Visit Number (e.g., OPD-2025-000045)
     * Accessed via $booking->visit_number
     */
    protected function visitNumber(): Attribute
    {
        return Attribute::make(
            get: fn () => 'OPD-' . $this->created_at->format('Y') . '-' . str_pad($this->id, 6, '0', STR_PAD_LEFT),
        );
    }

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

    /**
     * Inverse relationship: Find the appointment that created this visit (if any).
     */
    public function appointment()
    {
        return $this->hasOne(Appointment::class, 'opd_booking_id');
    }

    // ------------------------------------------------------------------
    // Medical Records - Clinical Data
    // ------------------------------------------------------------------

    public function vitalSigns()
    {
        return $this->hasMany(MrVitalSign::class, 'opd_booking_id');
    }

    // New Helper Relationship: Get the most recent vital sign entry
    public function latestVitalSign()
    {
        return $this->hasOne(MrVitalSign::class, 'opd_booking_id')->latestOfMany();
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

    // Add these methods to your existing OpdBooking model
    public function examination()
    {
        return $this->morphOne(MrExamination::class, 'examinable');
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

    // ------------------------------------------------------------------
    // Laboratory Relations 
    // ------------------------------------------------------------------
    public function labRequests()
    {
        return $this->hasMany(LabPrescription::class, 'opd_booking_id');
    }

    // ------------------------------------------------------------------
    // Radiology Relations

    public function radiologyRequests()
    {
        return $this->hasMany(RadRequest::class, 'opd_booking_id');
    }
}