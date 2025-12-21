<?php

namespace App\Models\Rch;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RchFpMethod extends Model
{
    use HasFactory;

    protected $table = 'rch_fp_methods';

    protected $fillable = [
        'code',
        'name',
        'type', // Hormonal, Barrier, etc.
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}