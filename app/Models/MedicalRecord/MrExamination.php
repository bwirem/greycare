<?php

namespace App\Models\MedicalRecord;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MrExamination extends Model
{
    use HasFactory;

    protected $table = 'mr_examinations';
    
    protected $guarded = ['id'];

    // Optional: Cast integers to boolean if you treat them as Checkboxes in React
    protected $casts = [
        'pallor' => 'boolean',
        'jaundice' => 'boolean',
        'cyanosis' => 'boolean',
        'rash' => 'boolean',
        'neck_stiffness' => 'boolean',
        'finger_clubbing' => 'boolean',
        'oral_thrush' => 'boolean',
    ];

    /**
     * Get the parent examinable model.
     * Can be: OpdBooking, IpdWardRound
     */
    public function examinable()
    {
        return $this->morphTo();
    }
}