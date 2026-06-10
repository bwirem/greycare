<?php

namespace App\Models\Orphanage;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class OrpAdoptativeParent extends Model
{
    protected $table = 'orpadoptativeparents';

    protected $primaryKey = 'autocode';

    public $timestamps = false; 

    protected $fillable = [
        'sysdate',
        'transdate',
        'childcode',
        'adoptivefather',
        'adoptivemother',
        'maritalstatus',
        'numberofbloodchildren',
        'numberofadoptedchildren',
        'profession',
        'physicaladdress',
        'contact',
        'user_id', // Updated from userid
    ];

    protected $casts = [
        'sysdate'   => 'datetime',
        'transdate' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}