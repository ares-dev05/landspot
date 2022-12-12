<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;

/**
 * Class UserGroup
 * @method static developerAdmins(...$args)
 * @method static builderAdmins(...$args)
 * @method static defaultUsers(...$args)
 * @method static superAdmins(...$args)
 */
class UserGroup extends Model
{
    protected $table = 'uf_groups';

    protected $fillable = ['name'];
    protected $guarded = ['name'];
    protected $hidden = ['is_default', 'home_page_id', 'can_delete'];

    const GroupDeveloperAdmins = 'Developer Admins';
    const GroupDefault = 'User';
    const GroupGlobalAdmins = 'Global Admins';
    const GroupBuilderAdmins = 'Builder Admins';

    function user()
    {
        return $this->belongsToMany(User::class, 'uf_user_group_matches', 'group_id', 'user_id');
    }

    function scopeDeveloperAdmins(EloquentBuilder $b)
    {
        return $b->where('name', self::GroupDeveloperAdmins);
    }

    function scopeBuilderAdmins(EloquentBuilder $b)
    {
        return $b->where('name', self::GroupBuilderAdmins);
    }

    function scopeDefaultUsers(EloquentBuilder $b)
    {
        return $b->where('name', self::GroupDefault);
    }

    function scopeSuperAdmins(EloquentBuilder $b)
    {
        return $b->where('name', self::GroupGlobalAdmins);
    }
}