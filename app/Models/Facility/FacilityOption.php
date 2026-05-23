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
        'show_register_button', 
        // Newly added API fields
        'corporate_id',
        'token_id',
        'access_token',
        'registration_url',
        'check_payment_url',
        'crdb_payment_type',
        'default_death_status_id',
        'cash_payment_control_number',
        'control_number_prefix'
    ];


    // In app/Models/FacilityOption.php

    public function chartOfAccount()
    {
        return $this->belongsTo(ChartOfAccount::class);
    }

    public function deathStatus()
    {
        return $this->belongsTo(IpdDischargeStatus::class);
    }
}