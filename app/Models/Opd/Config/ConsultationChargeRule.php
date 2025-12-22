<?php

namespace App\Models\Opd\Config;

use Illuminate\Database\Eloquent\Model;
use App\Models\Billing\BLSItem;

class ConsultationChargeRule extends Model
{
    protected $table = 'consultation_charge_rules';
    protected $guarded = [];

    /**
     * The specialization this rule belongs to.
     */
    public function specialization()
    {
        return $this->belongsTo(DoctorSpecialization::class, 'specialization_id');
    }

    /**
     * The Billing Item (Price definition).
     */
    public function billItem()
    {
        return $this->belongsTo(BLSItem::class, 'bill_item_id');
    }
}