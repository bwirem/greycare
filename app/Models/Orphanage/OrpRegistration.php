<?php

namespace App\Models\Orphanage;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class OrpRegistration extends Model
{
    protected $table = 'orpregistration';

    protected $primaryKey = 'autocode';

    protected $fillable = [
        'sysdate',
        'transdate',
        'childcode',
        'first_name',
        'middle_name',
        'last_name',
        'gender',
        'date_of_birth',
        'registration_type_id',
        'institution',
        'physicaladdress',
        'contact',
        'user_id',
    ];

    protected $casts = [
        'sysdate' => 'datetime',
        'transdate' => 'datetime',
        'date_of_birth' => 'date',
    ];

    public function registrationType()
    {
        return $this->belongsTo(
            OrpRegistrationType::class,
            'registration_type_id',
            'autocode'
        );
    }

    public function user()
    {
        return $this->belongsTo(
            User::class,
            'user_id'
        );
    }
}