<?php

namespace App\Models\Theatre;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Theatre extends Model
{
    use HasFactory;

    protected $table = 'theatres';
    
    protected $fillable = [
        'name',
        'code',
        'type',
        'location',
        'is_active'
    ];
}