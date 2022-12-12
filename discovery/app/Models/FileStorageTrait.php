<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;

trait FileStorageTrait
{
    protected static function bootFileStorageTrait()
    {
        static::saved(function (Model $item) {
            $fields   = $item::getFilesStorageFields();
            $original = $item->getOriginal();

            foreach ($fields as $field) {
                if (isset($original[$field]) &&
                    $item->{$field} != $original[$field] &&
                    $original[$field] != '') {
                    File::deleteFile($original[$field]);
                }
            }

            return true;
        });

        static::deleted(function ($item) {
            $fields = $item::getFilesStorageFields();
            foreach ($fields as $field) {
                if (isset($item->{$field})) File::deleteFile($item->{$field});
            };
        });
    }
}