<?php

namespace App\Models\Inventory;

    use Illuminate\Database\Eloquent\Factories\HasFactory;
    use Illuminate\Database\Eloquent\Model;

    use App\Models\User;

    class IVRequistionHistory extends Model
    {
        use HasFactory;

        protected $table = 'iv_requistion_history';

        protected $fillable = [
            'requistion_id',
            'stage',
            'remarks',
            'user_id',
        ];

        /**
         * Get the parent requisition that this history entry belongs to.
         */
        public function requistion()
        {
            return $this->belongsTo(IVRequistion::class, 'requistion_id');
        }

        /**
         * Get the user who made this history entry.
         */
        public function user()
        {
            return $this->belongsTo(User::class, 'user_id');
        }
    }
