<?php

namespace App\Models\Billing;

use Illuminate\Database\Eloquent\Model;

use App\Models\Inventory\SIV_Product;
use App\Models\Laboratory\LabPanel;
use App\Models\Radiology\RadProcedure;
use App\Models\Theatre\TheatreProcedure;
use App\Models\Ipd\IpdWard;

class BLSItem extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'bls_items';

    // Add attributes to $fillable array for mass assignment
    protected $fillable = [
        'itemgroup_id',  
        'name', 
        'price1',                   
        'price2',                         
        'price3',                             
        'price4', 
        'price5', 
        'price6', 
        'price7', 
        'price8', 
        'price9', 
        'price10', 
        'price11', 
        'price12', 
        'price13', 
        'price14', 
        'price15', 
        'defaultqty',                
        'addtocart', 
        'product_id',       
        'lab_panel_id',
        'rad_procedure_id',
        'theatre_procedure_id',
        'ipd_ward_id',
    ];

    public function itemgroup()
    {
        return $this->belongsTo(BLSItemGroup::class, 'itemgroup_id', 'id');
    }

    /**
     * Link to Inventory Product
     */
    public function product()
    {
        return $this->belongsTo(SIV_Product::class, 'product_id', 'id');
    }  
    
    /**
     * Link to Laboratory Panel (Definition)
     */
    public function labPanel() 
    {
        return $this->belongsTo(LabPanel::class, 'lab_panel_id');
    }

    /**
     * Link to Radiology Procedure (Definition)
     */
    public function radProcedure() 
    {
        return $this->belongsTo(RadProcedure::class, 'rad_procedure_id');
    }

    /**
     * Link to Theatre Procedure (Definition)
     */
    public function theatreProcedure() 
    {
        return $this->belongsTo(TheatreProcedure::class, 'theatre_procedure_id');
    }

    /**
     * Link to IPD Ward
     */
    // Add Relationship
    public function ward()
    {
        return $this->belongsTo(IpdWard::class, 'ipd_ward_id');
    }
}