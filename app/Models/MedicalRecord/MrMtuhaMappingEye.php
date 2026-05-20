<?php

namespace App\Models\MedicalRecord;

use Illuminate\Database\Eloquent\Model;

class MrMtuhaMappingEye extends Model
{
    protected $table = 'mr_mtuha_mappings_eye';
    protected $fillable = ['mtuha_code', 'description', 'exact_codes', 'ranges', 'priority'];

    protected $casts = [
        'exact_codes' => 'array',
        'ranges'      => 'array',
    ];
}