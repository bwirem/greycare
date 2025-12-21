<?php
namespace App\Models\Physiotherapy;

use Illuminate\Database\Eloquent\Model;

class PhySessionItem extends Model
{
    protected $table = 'phy_session_items';
    protected $fillable = ['phy_session_id', 'treatment_type_id', 'body_part', 'duration_minutes', 'remarks'];

    public function type() {
        return $this->belongsTo(PhyTreatmentType::class, 'treatment_type_id');
    }
}