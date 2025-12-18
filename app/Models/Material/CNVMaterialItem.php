<?php

namespace App\Models\Material;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\Inventory\SIV_Product;

class CNVMaterialItem extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'cnv_materialitems';

    protected $fillable = ['material_id', 'product_id', 'quantity','price'];

    public function material()
    {
        return $this->belongsTo(CNVMaterial::class, 'material_id', 'id');
    }

    public function item()
    {
        return $this->belongsTo(SIV_Product::class, 'product_id', 'id');
    }

}