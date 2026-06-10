<?php

namespace App\Models\Orphanage;

use Illuminate\Database\Eloquent\Model;

class OrpRegistrationType extends Model
{
    protected $table = 'orpregistrationtype';

    protected $primaryKey = 'autocode';

    public $timestamps = false;

    protected $fillable = [
        'CODE',
        'description',
    ];

    public function registrations()
    {
        return $this->hasMany(
            OrpRegistration::class,
            'registration_type_id',
            'autocode'
        );
    }

}