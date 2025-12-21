<?php

namespace App\Models\Rch;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RchVaccine extends Model
{
    use HasFactory;

    protected $table = 'rch_vaccines';
    
    protected $fillable = [
        'code',
        'name',
        'target_age_weeks',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}