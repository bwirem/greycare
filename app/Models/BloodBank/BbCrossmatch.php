<?php

namespace App\Models\BloodBank;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class BbCrossmatch extends Model
{
    protected $table = 'bb_crossmatches';
    protected $guarded = [];

    public function request()
    {
        return $this->belongsTo(BbIssueRequest::class, 'bb_issue_request_id');
    }

    public function bag()
    {
        return $this->belongsTo(BbBloodBag::class, 'bb_blood_bag_id');
    }

    public function technician()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}