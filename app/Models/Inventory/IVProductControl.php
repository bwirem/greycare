<?php

namespace App\Models\Inventory;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// Make sure SIV_Product is imported if it's in a different namespace, 
// e.g., use App\Models\SIV_Product; 

class IVProductControl extends Model
{
    use HasFactory; // Added this so the imported HasFactory trait is actually used

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'iv_productcontrol';
  
    public function __construct(array $attributes = [])
    {
        // Define base columns
        $fillable = ['product_id'];

        // Dynamically add qty_1 to qty_20
        for ($i = 1; $i <= 20; $i++) {
            $fillable[] = "qty_{$i}";
        }

        $this->fillable = $fillable;

        // Call parent constructor *after* setting fillable
        // so that if you do new IVProductControl(['qty_15' => 10]), it works.
        parent::__construct($attributes);
    }

    public function product()
    {
        // Ensure SIV_Product::class is resolvable
        return $this->belongsTo(SIV_Product::class, 'product_id', 'id');
    }
}