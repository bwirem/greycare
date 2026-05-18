<?php

namespace App\Models\Mortuary;

use Illuminate\Database\Eloquent\Model;

class MortuaryCabinet extends Model
{
    /**
     * The table associated with the model.
     * (Optional, but good practice if you want to be explicit)
     */
    protected $table = 'mortuary_cabinets';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'mortuary_room_id',
        'name',
        'status',
    ];

    /**
     * Relationship: A cabinet belongs to a specific Mortuary Room.
     */
    public function room()
    {
        return $this->belongsTo(MortuaryRoom::class, 'mortuary_room_id');
    }
}