<?php
namespace App\Models\Ipd;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\MedicalRecord\MrExamination;
use App\Models\MedicalRecord\MrAssessment;

class IpdWardRound extends Model
{
    protected $guarded = [];
    protected $casts = ['round_date' => 'datetime'];

    public function admission() { return $this->belongsTo(IpdAdmission::class, 'ipd_admission_id'); }
    public function doctor() { return $this->belongsTo(User::class, 'user_id'); }

    // Polymorphic Relationship to Examination
    public function examination() { return $this->morphOne(MrExamination::class, 'examinable'); }
    
    // Relationship to Daily Assessment
    public function assessment() { return $this->hasOne(MrAssessment::class, 'ipd_ward_round_id'); }
}