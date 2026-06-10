<?php

namespace App\Models\Orphanage;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class OrpAdoptativeOrphanage extends Model
{
    protected $table = 'orpadoptativeorphanages';

    protected $primaryKey = 'autocode';

    public $timestamps = false;

    protected $fillable = [
        'sysdate',
        'transdate',
        'childcode',
        'orphanagename',
        'personincharge',
        'position',
        'institution',
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