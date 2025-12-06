<?php

namespace App\Models\Theatre;

use Illuminate\Database\Eloquent\Model;

class TheatreProcedureGroup extends Model
{
    protected $table = 'theatre_procedure_groups';
    protected $guarded = [];

    public function procedures()
    {
        return $this->hasMany(TheatreProcedure::class, 'theatre_procedure_group_id');
    }
}