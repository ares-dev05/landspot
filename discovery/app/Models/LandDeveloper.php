<?php

namespace App\Models;

use Illuminate\Database\Query\Builder as QueryBuilder;
use App\Models\InvitedUser;

/**
 * Class LandDeveloper
 * @method static LandDeveloper getUser()
 */
class LandDeveloper extends User
{
    use BuilderCompaniesTrait, EstatePremiumFeaturesTrait;

    function estate()
    {
        return $this->hasMany(Estate::class, 'company_id', 'company_id');
    }

    /**
     * @param QueryBuilder $qb
     * @param string $tableAlias
     * @return QueryBuilder
     */
    protected function availableEstates(QueryBuilder $qb, $tableAlias = 'e')
    {
        return $qb->where([$tableAlias . '.company_id' => $this->company_id]);
    }

    protected function applyUserFiltersForLotsCount(QueryBuilder $lotsQB, $tableAlias = 'estate_lots')
    {
        $lotsQB->where([
            $tableAlias . '.company_id' => \DB::raw((int) $this->company_id)
        ]);
    }
    function invitedUser()
    {
        return $this->belongsToMany(InvitedUser::class, 'user_invited_users', 'company_id', 'invited_user_id', 'company_id')
            ->using(UserInvitedUsers::class)
            ->withPivot([
                'company_id', 'invitation_token', 'status'
            ])->withTimestamps();
    }
    /**
     * Remove the specified resource from storage.
     *
     * @param InvitedUser $client
     */
    function deleteInvitedUser(InvitedUser $client)
    {
        UserInvitedUsers::where('invited_user_id', $client->id)
            ->where('company_id', $this->company_id)
            ->delete();
//        $companyEstateIds = Company::find($this->company_id)->estate->pluck('id')->toArray();
//        $client->estateShortLists()->whereIn('estate_id', $companyEstateIds)->delete();
//        $deleteDocuments = $client->documents()->whereIn('estate_id', $companyEstateIds)->get();
//        $deleteDocuments->each(function ($document) {
//            $document->deleteFile();
//        });
    }
}
