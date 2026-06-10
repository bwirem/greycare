<?php

namespace App\Models\Orphanage;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class OrpDischarge extends Model
{
    protected $table = 'orpdischarges';

    protected $primaryKey = 'autocode';

    protected $fillable = [
        'sysdate',
        'transdate',
        'childcode',
        'parentname',
        'guardianname',
        'relationship',
        'physicaladdress',
        'contact',
        'user_id',
    ];

    protected $casts = [
        'sysdate' => 'datetime',
        'transdate' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getRouteKeyName()
    {
        return 'autocode';
    }
}