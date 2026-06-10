<?php

namespace App\Models\Orphanage;

use Illuminate\Database\Eloquent\Model;

class OrpAdoptationType extends Model
{
    protected $table = 'orpadoptationtype';

    protected $primaryKey = 'autocode';

    public $timestamps = false;

    protected $fillable = [
        'CODE',
        'description',
        'orphanagetoorphanages',
        'orphanagetoadoptiveparent',
    ];
}