<?php

namespace App\Models\Theatre;

use Illuminate\Database\Eloquent\Model;

class TheatreProcedure extends Model
{
    protected $table = 'theatre_procedures';
    protected $guarded = [];

    public function group()
    {
        return $this->belongsTo(TheatreProcedureGroup::class, 'theatre_procedure_group_id');
    }
}