<?php

namespace App\Models\Procurement;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\Facility\FacilityOption;

class PROTender extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'pro_tender';
  

    protected $fillable = ['transdate', 'facilityoption_id','description','stage', 'user_id'];


    public function tenderitems()
    {        
        return $this->hasMany(PROTenderItem::class, 'tender_id', 'id');              
    }

    public function tenderquotations()
    {        
        return $this->hasMany(PROTenderQuotation::class, 'tender_id', 'id');              
    }
    

    public function facilityoption()
    {
        return $this->belongsTo(FacilityOption::class, 'facilityoption_id', 'id');
    }
        
   
}
