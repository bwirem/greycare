<?php

namespace App\Models\Mortuary;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MortuaryCharge extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'mortuary_record_id',
        'charge_date',
        'amount',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'charge_date' => 'date',
        'amount' => 'decimal:2',
    ];

    /**
     * Relationship: A charge belongs to a specific Mortuary Record.
     */
    public function mortuaryRecord()
    {
        return $this->belongsTo(MortuaryRecord::class, 'mortuary_record_id');
    }
}