<?php

namespace App\Policies\Sitings;

use App\Models\Sitings\{FloorplanFiles, User};
use Illuminate\Auth\Access\HandlesAuthorization;

class FloorplanFilesPolicy
{
    use HandlesAuthorization;


    /**
     * @param User $user
     * @param FloorplanFiles $file
     * @return bool
     */
    public function view(User $user, FloorplanFiles $file)
    {
        return $user->can('view', $file->floorplan()->first());
    }
}
