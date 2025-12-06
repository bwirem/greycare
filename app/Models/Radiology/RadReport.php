<?php

namespace App\Models\Radiology;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class RadReport extends Model
{
    protected $table = 'rad_reports';
    protected $guarded = [];

    public function request()
    {
        return $this->belongsTo(RadRequest::class, 'rad_request_id');
    }

    public function radiologist()
    {
        return $this->belongsTo(User::class, 'radiologist_id');
    }
}