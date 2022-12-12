<?php

namespace App\Policies;

use App\Models\InvitedUser;
use App\Models\InvitedUserDocument;
use Illuminate\Auth\Access\HandlesAuthorization;

class InvitedUserDocumentPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can update the current user profile.
     *
     * @param  $authUser
     * @param  \App\Models\InvitedUserDocument $document
     * @return mixed
     */
    public function viewDocument($authUser, InvitedUserDocument $document)
    {
        return $authUser->invitedUserDocuments->contains($document->id);
    }

    //TODO: deprecated
    /**
     * Determine whether the user can update the current user profile.
     *
     * @param InvitedUser $invitedUser
     * @param \App\Models\InvitedUserDocument $document
     * @return mixed
     */
    public function viewDocumentByInvitedUser(InvitedUser $invitedUser, InvitedUserDocument $document)
    {
        return $invitedUser->documents->contains($document);
    }
}
