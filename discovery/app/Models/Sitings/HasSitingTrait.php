<?php

namespace App\Models\Sitings;
use Illuminate\Database\Eloquent\{Builder as EloquentBuilder};

/**
 * Trait HasSitingTrait
 * @property Siting siting
 */
trait HasSitingTrait
{
    /**
     * @return Siting
     */
    function siting()
    {
        return $this->hasMany(Siting::class, 'user_id', 'id');
    }

    /**
     * @return LegacySiting
     */
    function legacySiting()
    {
        return $this->hasMany(LegacySiting::class, 'uid', 'id');
    }

    function getClientsForInvite(Siting $siting)
    {
        return $this->invitedUser()
            ->whereDoesntHave('builderSiting', function (EloquentBuilder $b) use ($siting) {
                $b->byId($siting->id);
            })
            ->whereNull('deleted_at')
            ->orderBy('invited_users.id', 'desc')
            ->get(['invited_users.id', 'first_name', 'last_name', 'email']);
    }
}
