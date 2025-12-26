<?php

namespace App\Models\Facility;

use Illuminate\Database\Eloquent\Model;
use App\Models\Accounting\ChartOfAccount;

class FacilityOption extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'facilityoptions';

    // Add attributes to $fillable array for mass assignment
    protected $fillable = [  
        'name',  
        'address', // Added
        'phone',   // Added
        'email',   // Added
        'website', // Added
        'tin',     // Added
        'vrn',     // Added
        'logo_path', // Added
        'chart_of_account_id',
        'default_cash_billing_group_id',
        'affectstockatcashier',
        'doubleentryissuing',
        'allownegativestock',        
        'show_register_button', // Newly added field
    ];


    // In app/Models/FacilityOption.php

    public function chartOfAccount()
    {
        return $this->belongsTo(ChartOfAccount::class);
    }
}