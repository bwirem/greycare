<?php

namespace App\Models\Procurement;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\Inventory\SPR_Supplier;

class PROTenderQuotation extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'pro_tenderquotations';

    protected $fillable = ['tender_id', 'supplier_id', 'url', 'filename', 'type', 'size', 'description'];

    public function tender()
    {
        return $this->belongsTo(PROTender::class, 'tender_id', 'id');
    }

    public function supplier()
    {
        return $this->belongsTo(SPR_Supplier::class, 'supplier_id', 'id');
    }
   
}