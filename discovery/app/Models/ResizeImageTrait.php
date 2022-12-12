<?php

namespace App\Models;
/**
 * Trait ResizeImageTrait
 * @property string $path
 */
trait ResizeImageTrait
{
    use FileStorageTrait;

    public static $imageSizes = ['thumb', 'small', 'medium', 'large'];
    public static $fullSizeField = 'path';
    protected static $imageModel = ImageWithThumbnails::class;

    static function getFilesStorageFields()
    {
        return array_merge(static::$imageSizes, [static::$fullSizeField]);
    }

    /**
     * @param $tempImageName
     * @param bool $trimTolerance
     * @return $this
     * @throws \Exception
     */
    function generateThumbnails($tempImageName, $trimTolerance = false)
    {
        if (!static::$storageFolder) {
            throw new \Exception('Storage folder required');
        }

        $tempImageName = basename($tempImageName);
        $images = call_user_func(
            [self::$imageModel, 'resizeImage'],
            $tempImageName, static::$storageFolder, $trimTolerance, self::$imageSizes, self::$fullSizeField
        );

        foreach ($images as $field => $image) {
            $this->attributes[$field] = $image;
        }

        return $this;
    }

    function getThumbImageAttribute()
    {
        return static::getValidPath($this->thumb ?? $this->getOriginal(static::$fullSizeField));
    }

    function getSmallImageAttribute()
    {
        return static::getValidPath($this->small ?? $this->getOriginal(static::$fullSizeField));
    }

    function getMediumImageAttribute()
    {
        return static::getValidPath($this->medium ?? $this->getOriginal(static::$fullSizeField));
    }

    function getLargeImageAttribute()
    {
        return static::getValidPath($this->large ?? $this->getOriginal(static::$fullSizeField));
    }


    static function getValidPath($path)
    {
        return ($path == '' || strpos($path, 'http') === 0) ? $path : ImageWithThumbnails::storageUrl($path);
    }

    /**
     * @param string $size
     * @return string
     * @throws \Exception
     */
    function getImage($size = 'thumb')
    {
        if (!in_array($size, static::$imageSizes)) throw new \Exception('Invalid image size ' . $size);

        $value = (isset($this->{$size}) && $this->{$size} != '')
            ? $this->{$size}
            : $this->getOriginal(static::$fullSizeField);

        return static::getValidPath($value);
    }
}
