<?php

namespace App\Models;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\{Str};

class ImageWithThumbnails extends File
{
    public static $storageDirectory = 'images';
    public static $imagesSize = ['thumb' => 320, 'small' => 992, 'medium' => 1200, 'large' => 1920];


    /**
     * Store image to temporary folder and generate thumbnail for preview
     * @param UploadedFile $uploadedFile
     * @param null $fileName
     * @param bool $private
     * @param int $trim
     * @param null $imageSize
     * @return array
     * @throws \Exception
     */
    public static function storeToTempFolder(UploadedFile $uploadedFile, $fileName = null, $private = false, $trim = 0, $imageSize = null)
    {
        $imageSize = static::$imagesSize[$imageSize] ?? static::$imagesSize['thumb'];
        $fileName = Str::random(40);
        $fileExt  = '.' . $uploadedFile->guessExtension();

        $mime = $uploadedFile->getMimeType();
        if ($mime === 'image/svg+xml' || $mime === 'image/svg') {
            $thumbPath = $uploadedFile->getRealPath();
        } else {
            $thumbPath   = self::getOSTempDir() . '/thumb_' . $fileName;
            $imageHelper = new ImageHelper($uploadedFile->getRealPath());
            $imageHelper->resizeWithAspectRatio(
                $thumbPath, $imageSize, $imageSize, false, $trim
            );
        }

        $fs     = null;
        $result = null;

        $thumbStoragePath = self::$tmpDir . '/thumb_' . $fileName . $fileExt;

        try {
            $result = parent::storeToTempFolder($uploadedFile, $fileName . $fileExt);
            $fs     = @fopen($thumbPath, 'rb');
            if (!$fs) throw new \Exception('Unable to open thumb');
            if (!self::appStorage()->put($thumbStoragePath, $fs)) {
                throw new \Exception('Unable to store thumb');
            }
        } catch (\Exception $e) {
            if ($result) {
                self::appStorage()->delete($result['storagePath']);
            }
            throw $e;
        } finally {
            if ($fs) fclose($fs);
            unlink($thumbPath);
        }

        return [
            'name'     => $fileName . $fileExt,
            'fileName' => $result['fileName'],
            'url'      => self::appStorage()->url($thumbStoragePath)
        ];
    }

    /**
     * @param string|resource $tempImage Relative local storage path
     * @param $storageSubDir
     * @param $trimTolerance
     * @param $imagesSize
     * @param $fullSizeField
     * @return array
     * @throws \Exception
     */
    public static function resizeImage($tempImage, $storageSubDir, $trimTolerance = false, $imagesSize = [], $fullSizeField = null)
    {
        $extensions = [
            'image/jpeg'    => '.jpg',
            'image/png'     => '.png',
            'image/gif'     => '.gif',
            'image/svg+xml' => '.svg',
            'image/svg'     => '.svg',
        ];
        $images        = [];

        $tempRelativeFileName = self::$tmpDir . '/' . $tempImage;
        if (!self::appStorage()->exists($tempRelativeFileName)) {
            throw new \Exception('Temp image not found');
        }

        $sourceImage   = self::storageToLocalPath($tempRelativeFileName);
        $imageHelper = new ImageHelper($sourceImage);
        $mime          = $imageHelper->mime;
        $fileExtension = isset($extensions[$mime]) ? $extensions[$mime] : '.jpg';

        $relativeDirName = static::$storageDirectory . '/' . $storageSubDir . '/' . date('y/m') . '/';

        $width = $imageHelper->size['width'];
        $height = $imageHelper->size['height'];

        $imagesSize = array_flip($imagesSize);
        if ($imagesSize) {
            $imagesSize = array_intersect_key($imagesSize, static::$imagesSize);
        } else {
            $imagesSize = static::$imagesSize;
        }

        $pathInfo = pathinfo($tempImage);

        $storeFileName = $pathInfo['filename'] ?? Str::random(40);
        $storeFileName .= '.' . ($pathInfo['extension'] ?? $fileExtension);

        $appStorage = self::appStorage();
        $allFieldsAreEmpty = true;

        foreach ($imagesSize as $fieldName => $v) {
            if ($mime === 'image/svg+xml') {
                $images[$fieldName] = null;
                continue;
            }
            $fieldSize = static::$imagesSize[$fieldName];
            if ($width <= $fieldSize && $height <= $fieldSize) {
                $images[$fieldName] = null;
                continue;
            }

            $thumbName = $fieldName . '_' . $storeFileName;
            if ($fieldName === 'thumb' && $appStorage->has(self::$tmpDir . '/' . $thumbName)) {
                if (!$appStorage->move(self::$tmpDir . '/' . $thumbName, $relativeDirName . $thumbName)) {
                    throw new \Exception('Unable to store file to storage');
                }
                $images[$fieldName] = $relativeDirName . $thumbName;
                $allFieldsAreEmpty = false;
                continue;
            };

            $tempFile = self::generateOSTempfilename($fileExtension);
            if(!$imageHelper) {
                $imageHelper = new ImageHelper($sourceImage);
            }
            $imageHelper->resizeWithAspectRatio($tempFile, $fieldSize, $fieldSize, false, $trimTolerance);
            $imageHelper = null;

            $fs = fopen($tempFile, 'rb');
            if (!$fs) throw new \Exception('Image not found');

            if (!$appStorage->put($relativeDirName . $thumbName, $fs)) {
                throw new \Exception('Unable to store file to storage');
            }
            $images[$fieldName] = $relativeDirName . $thumbName;
            fclose($fs);
            unlink($tempFile);
            $allFieldsAreEmpty = false;
        }

        if($fullSizeField) {
            $images[$fullSizeField] = $relativeDirName . $storeFileName;
            if (!$appStorage->move($tempRelativeFileName, $relativeDirName . $storeFileName)) {
                throw new \Exception('Unable to move file to storage');
            }
        } elseif($allFieldsAreEmpty) {
            foreach ($imagesSize as $fieldName => $v) {
                if(!$images[$fieldName]) {
                    $images[$fieldName] = $relativeDirName . $storeFileName;
                    if (!$appStorage->move($tempRelativeFileName, $relativeDirName . $storeFileName)) {
                        throw new \Exception('Unable to store file to storage');
                    }
                    break;
                }
            }
        }

        if(is_file($sourceImage)) unlink($sourceImage);

        return $images;
    }

}
