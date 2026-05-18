<?php
namespace App\Models\Mortuary;
use Illuminate\Database\Eloquent\Model;

class Mortuary extends Model
{
    protected $fillable = ['name', 'type'];

    public function rooms()
    {
        return $this->hasMany(MortuaryRoom::class);
    }
}