<?php

namespace App\Models\Billing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BILInvoice extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'bil_invoices';
  

    protected $fillable = ['transdate','invoiceno','customer_id',
                           'voided','voidsysdate','voidtransdate','voidno','voiduser_id',
                           'totaldue','totalpaid','balancedue','paidforinvoice','currency_id',
                           'yearpart','monthpart','transtype','status', 'user_id'];


    public function items()
    {        
        return $this->hasMany(BILInvoiceItem::class, 'invoice_id', 'id')
                    ->with('item'); // Include the relationship to IV Items
    }
   
    public function customer()
    {
        return $this->belongsTo(BLSCustomer::class, 'customer_id', 'id');
    }

    public function getBalanceAttribute()
    {
        $invoiceTotal = $this->items->sum(function ($item) {
            return $item->quantity * $item->price;
        });

        $totalPaid = \App\Models\Billing\BILInvoicePaymentDetail::where(
            'invoiceno',
            $this->invoiceno
        )->sum('totalpaid');

        return $invoiceTotal - $totalPaid;
    }   
   
}
