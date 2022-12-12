<?php

namespace App\Models;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\{Str};

class ImageFromPDF extends File
{
    public static $imagesSize = ['A4_300DPI' => 2480];

    /**
     * Store PDF to temporary folder and generate thumbnail for preview
     *
     * @param UploadedFile $uploadedFile
     * @param null $fileName
     * @param bool $private
     * @return array
     * @throws \Exception
     */
    public static function storeToTempFolder(UploadedFile $uploadedFile, $fileName = null, $private = false)
    {
        $fileName = Str::random(40);
        $fileExt  = '.' . $uploadedFile->guessExtension();

        $path      = $uploadedFile->getRealPath();
        $thumbPath = self::getOSTempDir() . '/thumb_' . $fileName . '.png';

        (new ImageHelper($path))->thumbnailPDF($thumbPath);

        $fs     = null;
        $result = null;

        $thumbStoragePath = self::$tmpDir . '/thumb_' . $fileName . '.png';
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
            'name'     => $fileName,
            'fileName' => $result['fileName'],
            'storagePath' => $result['storagePath'],
            'url'      => self::appStorage()->url($thumbStoragePath)
        ];
    }

    /**
     * @param $fileName
     * @param $referencePlan boolean
     * @return array
     * @throws \Exception
     */
    static function storePagesToTempFolder($fileName, $referencePlan=false)
    {
        $path = self::storageToLocalPath(self::$tmpDir . '/' . $fileName);
        $name = pathinfo($fileName, PATHINFO_FILENAME);
        if (!$name) $name = Str::random();

        $thumbPath = self::getOSTempDir() . '/thumb_' . $name . '.png';

        $pagesCount = (new ImageHelper($path, false, $referencePlan))->thumbnailPDFPages($thumbPath);

        $fs = null;

        $pages = [];
        $i = 0;

        try {
            for (; $i < $pagesCount; $i++) {
                $imageName = 'thumb_' . $name . ($pagesCount == 1 ? '' : '-' . $i) . '.png';
                $pagePath         = self::getOSTempDir() . '/' . $imageName;
                $thumbStoragePath = self::$tmpDir . '/' . $imageName;
                $fs = @fopen($pagePath, 'rb');

                if (!$fs) {
                    throw new \Exception('Unable to open thumb');
                }

                if (!self::appStorage()->put($thumbStoragePath, $fs)) {
                    throw new \Exception('Unable to store thumb');
                }
                $size    = (new ImageHelper($pagePath, true))->getImageLength();

                $pages[] = [
                    'filename' => $imageName,
                    'size' => $size
                ];

                fclose($fs);
                unlink($pagePath);
                $fs = null;
            }
        } catch (\Exception $e) {
            throw $e;
        } finally {
            for (; $i < $pagesCount; $i++) {
                $imageName = 'thumb_' . $name . ($pagesCount == 1 ? '' : '-' . $i) . '.png';
                $pagePath  = self::getOSTempDir() . '/' . $imageName;
                @unlink($pagePath);
            }
            if ($fs) fclose($fs);
        }

        return $pages;
    }


    /**
     * @param $fileName
     * @return int
     * @throws \Exception
     */
    static function getDocumentPages($fileName)
    {
        $path       = self::storageToLocalPath(self::$tmpDir . '/' . $fileName);
        $pagesCount = (new ImageHelper($path))->getNumberImages();
        return $pagesCount;
    }

    /**
     * @param $fileName
     * @return array
     * @throws \Exception
     */
    static function getPageSize($fileName)
    {
        $path = self::storageToLocalPath(self::$tmpDir . '/' . $fileName);
        return (new ImageHelper($path))->getImageLength();
    }
}
