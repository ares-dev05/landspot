<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


/**
 * Class InvitedUserDocument
 * @property int id
 * @property int invited_user_id
 * @property int estate_id
 * @property int type
 * @property string name
 * @property string path
 * @property string thumb
 * @property int open_count
 * @property int document_owner_id
 * @property int notified_at
 * @property array static TYPES
 * 
 * @property string thumbImage
 * @property string estate_name (accessor)
 * @property string type_name (accessor)
 * @property string file_path_from_s3 (accessor)
 *
 * @property Estate estate
 * @property InvitedUser invitedUser
 */
class InvitedUserDocument extends Model
{
    /**
     * The array of document types.
     *
     * @var array
     */
    const TYPES = [
        'quote'     => 0,
        'drawings'  => 1,
        'brochures' => 2,
        'package'   => 3,
        'other'     => 4
    ];
    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['estate_name', 'type_name', 'thumbImage', 'file_path_from_s3'];
    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];

    public static function boot()
    {
        parent::boot();

        static::created(function(InvitedUserDocument $invitedUserDocument)
        {
            $invitedUserDocument->unreadedDocument()->create([
                'invited_user_id' => $invitedUserDocument->invited_user_id,
                'document_id' => $invitedUserDocument->id,
            ]);
        });

        static::deleting(function(InvitedUserDocument $invitedUserDocument)
        {
            $invitedUserDocument->unreadedDocument()->each(function (UnreadedDocument $unreadedDocument) {
                $unreadedDocument->delete();
            });
        });
    }

    // Relations

    public function unreadedDocument()
    {
        return $this->morphMany(UnreadedDocument::class, 'document');
    }

    function invitedUser()
    {
        return $this->belongsTo(InvitedUser::class);
    }

    function estate()
    {
        return $this->belongsTo(Estate::class);
    }
    function user()
    {
        return $this->belongsTo(User::class, 'document_owner_id');
    }

    /**
     * Delete file from database and Storage
     * @return bool|null
     * @throws \Exception
     */
    function deleteFile()
    {
        File::deleteFile($this->path);
        return $this->delete();
    }

    // attributes
    function getThumbImageAttribute()
    {
        return $this->thumb ? ImageFromPDF::storageTempUrl($this->thumb, now()->addDay(2)) : null;
    }

    function getFileURLAttribute()
    {
        return $this->path ? ImageFromPDF::storageTempUrl($this->path, now()->addDay(2)) : null;
    }

    public function getFilePathFromS3Attribute()
    {
        return $this->path
            ?  ($this->path == '' || strpos($this->path, 'http') === 0)
                ? $this->path
                : File::storageUrl($this->path)
            :  null;
    }

    /**
     * Get the estate name flag for the invited user documents table.
     *
     * @return string
     */
    public function getEstateNameAttribute()
    {
        return $this->estate()->first()->name ?? '';
    }
    /**
     * Get the stage name flag for the stage table.
     *
     * @return string
     */
    public function getTypeNameAttribute()
    {
        return array_search($this->type, self::TYPES);
    }
}
