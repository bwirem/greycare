<?php
namespace App\Models\Mortuary;
use Illuminate\Database\Eloquent\Model;
use App\Models\Billing\BLSItem;

class MortuaryRoom extends Model
{
    protected $fillable = ['mortuary_id', 'name'];

    public function mortuary()
    {
        return $this->belongsTo(Mortuary::class);
    }

    public function cabinets()
    {
        return $this->hasMany(MortuaryCabinet::class);
    }

    public function blsItem()
    {
        return $this->hasOne(BLSItem::class, 'mortuary_room_id');
    }
}