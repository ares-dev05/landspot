<?php

namespace App\Models\Sitings;

use App\Models\File;
use Illuminate\Database\Eloquent\Model;

trait DeleteStorageFilesTrait
{
    protected static function bootDeleteStorageFilesTrait()
    {
        static::deleting(function (Model $model) {
            foreach ($model::storageFileFields as $field) {
                if (isset($original[$field])) {
                    File::deleteFile($model->{$field});
                }
            }
        });

        static::saved(function ($item) {
            /** @var Model $item */
            $original = $item->getOriginal();

            foreach (self::storageFileFields as $field) {
                if (isset($original[$field]) && $item->{$field} != $original[$field]) {
                    File::deleteFile($original[$field]);
                }
            }

            return true;
        });
    }
}