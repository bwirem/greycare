<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Enums\StaffCategory;

class UserGroup extends Model
{
    use HasFactory;

    protected $table = 'usergroups';

    protected $fillable = ['name', 'staffcategory'];

    protected $appends = ['staff_category_label'];

    public function getStaffCategoryLabelAttribute()
    {
        return StaffCategory::getLabel($this->staffcategory);
    }

    /**
     * Get the functions associated with the user group.
     */
    public function userGroupFunctions()
    {
        return $this->hasMany(UserGroupFunction::class, 'usergroup_id');
    }

    /**
     * Get the module items associated with the user group.
     */
    public function userGroupModuleItems()
    {
        return $this->hasMany(UserGroupModuleItem::class, 'usergroup_id');
    }
}
