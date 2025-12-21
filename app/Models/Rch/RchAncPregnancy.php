<?php

namespace App\Models\Rch;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Patient\Patient;

class RchAncPregnancy extends Model
{
    use HasFactory;

    protected $table = 'rch_anc_pregnancies';

    protected $fillable = [
        'patient_code',
        'anc_number',
        'gravida',
        'parity',
        'lmp_date',
        'edd_date',
        'baseline_height_cm', // Optional based on migration
        'is_active'
    ];

    protected $casts = [
        'lmp_date' => 'date',
        'edd_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_code', 'code');
    }

    public function visits()
    {
        return $this->hasMany(RchAncVisit::class, 'pregnancy_id');
    }
}