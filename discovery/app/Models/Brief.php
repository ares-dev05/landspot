<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Brief extends Model
{
    protected $fillable = [
        'invited_user_id',
        'buyer_type_id',
        'land',
        'lot_number',
        'street_name',
        'estate_name',
        'file_path',
        'pre_approval',
        'process_of_personal_data',
        'completed_form',
        'origin_name_file',
        'thumb'
    ];

    public static function boot()
    {
        parent::boot();

        static::created(function(Brief $brief)
        {
            $brief->unreadedDocument()->create([
                'invited_user_id' => $brief->invited_user_id,
                'document_id' => $brief->id,
            ]);
        });

        static::deleting(function(Brief $brief)
        {
            $brief->unreadedDocument()->each(function (UnreadedDocument $unreadedDocument) {
                $unreadedDocument->delete();
            });
        });
    }

    public function unreadedDocument()
    {
        return $this->morphMany(UnreadedDocument::class, 'document');
    }

    public function companies()
    {
        return $this->belongsToMany(Company::class)
            ->withTimestamps()
            ->withPivot('accepted_brief');
    }

    public function builderCompanies()
    {
        return $this->companies()->builderCompany();
    }

    public function builderCompany()
    {
        return $this->builderCompanies();
    }

    public function developerCompanies()
    {
        return $this->companies()->developerCompany();
    }

    public function developerCompany()
    {
        return $this->developerCompanies();
    }

    public function regions()
    {
        return $this->belongsToMany(Region::class)->withTimestamps();
    }

    public function estates()
    {
        return $this->belongsToMany(Estate::class)->withTimestamps();
    }

    public function houseRequirement()
    {
        return $this->hasOne(HouseRequirement::class);
    }

    public function budget()
    {
        return $this->hasOne(Budget::class);
    }

    public function buyerType()
    {
        return $this->belongsTo(BuyerType::class);
    }

    public function invitedUser()
    {
        return $this->belongsTo(InvitedUser::class);
    }

    public function documents()
    {
        return $this->hasManyThrough(
            InvitedUserDocument::class,
            InvitedUser::class,
            'invited_users.id',
                    'invited_user_documents.invited_user_id',
            'invited_user_id',
            'id'
        );
    }
}
