<?php

namespace App\Models;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\{Str};
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class File
{
    public static $storageDirectory = 'documents';
    public static $tmpDir = 'temporary_files';
    public static $disk   = 'public';

    /**
     * Configure File filesystem "disk".
     *
     * @param string $disk
     * @return static
     */
    public static function setDisk($disk)
    {
        static::$disk = $disk;

        return new static;
    }


    /**
     * Configure base storage directory.
     *
     * @param string $storageDirectory
     * @return static
     */
    public static function setStorageDirectory($storageDirectory)
    {
        static::$storageDirectory = $storageDirectory;

        return new static;
    }

    /**
     * @param UploadedFile $file
     * @param string $fileName
     * @param bool $private
     *
     * @return array
     */
    public static function storeToTempFolder(UploadedFile $file, $fileName = null, $private = false)
    {
        $options = $private ? ['visibility' => 'hidden', 'ACL' => 'private'] : ['visibility' => 'public', 'ACL' => 'public-read'];
        $path    = self::appStorage()->putFileAs(self::$tmpDir, $file, $fileName ?? $file->hashName(), $options);

        return [
            'name'        => basename($path),
            'storagePath' => $path,
            'fileName'    => trim(basename($file->getClientOriginalName())),
        ];
    }

    static function tempFileExists($fileName)
    {
        return self::appStorage()->exists(self::$tmpDir . '/' . $fileName);
    }

    /**
     * @param resource|string $fileSource
     * @param $fileName
     * @return string
     * @throws \Exception
     */
    public static function storeToTempFolderFromPath($fileSource, $fileName)
    {
        $fs = is_resource($fileSource) ? $fileSource : @fopen($fileSource, 'rb');
        if (!$fs) throw new \Exception('Unable to open file');
        if (!rewind($fs)) {
            throw new \Exception('Unable to set pointer');
        }
        if (!self::appStorage()->put(self::$tmpDir . '/' . $fileName, $fs)) {
            throw new \Exception('Unable to store file');
        };

        return $fileName;
    }

    static function storageUrl($path)
    {
        return static::appStorage()->url($path);
    }

    static function storageTempUrl($path, $dateTime)
    {
        return
            App::environment('local')
                ? self::storageUrl($path)
                : static::appStorage()->temporaryUrl($path, $dateTime);
    }

    static function deleteFile($path)
    {
        if ($path == '' || strpos($path, 'http') === 0) return;

        if (self::appStorage()->exists($path)) {
            self::appStorage()->delete($path);
        }
    }

    /**
     * @return \Illuminate\Filesystem\FilesystemAdapter
     */
    static function appStorage()
    {
        return Storage::disk(self::$disk);
    }

    /**
     * @param $tempFileName
     * @param $subDirectory
     * @return string
     * @throws \Exception
     */
    public static function moveTemporaryFileToStorage($tempFileName, $subDirectory)
    {
        if ($tempFileName == '') {
            throw new \Exception('Empty file name');
        }

        $fileTemporaryPath = self::$tmpDir . '/' . $tempFileName;
        if (!self::appStorage()->exists($fileTemporaryPath)) {
            throw new \Exception('Temp file not found');
        }

        $relativeDirName = static::generateStoragePath($subDirectory);

        if (self::appStorage()->exists($relativeDirName . $tempFileName)) {
            self::appStorage()->delete($relativeDirName . $tempFileName);
        }

        if (!self::appStorage()->move($fileTemporaryPath, $relativeDirName . $tempFileName)) {
            throw new \Exception('Unable to move temporary file to storage');
        }

        return $relativeDirName . $tempFileName;
    }

    static function generateStoragePath($subDirectory)
    {
        return static::$storageDirectory . '/' . $subDirectory . '/' . date('y/m') . '/';
    }

    /**
     * Clone file on storage
     * @param string $sourcePath Relative pathname
     * @return string New relative path
     * @throws \Exception
     */
    static function cloneFile($sourcePath)
    {
        $pathInfo  = pathinfo($sourcePath);
        $dirName   = $pathInfo['dirname'] ?? '';
        $extension = $pathInfo['extension'] ?? '';
        $newPath   = $dirName . '/' . Str::random(40) . ($extension != '' ? '.' . $extension : '');
        $result    = static::appStorage()->copy($sourcePath, $newPath);
        if (!$result) {
            throw  new \Exception('Unable to copy file');
        }

        return $newPath;
    }

    /**
     * Clone file on storage
     * @param string $sourcePath Relative pathname
     * @return string New relative path
     * @throws \Exception
     */
    static function cloneFileToTempFolder($sourcePath)
    {
        if (File::appStorage()->exists($sourcePath)) {
            $pathInfo  = pathinfo($sourcePath);
            $extension = $pathInfo['extension'] ?? '';
            $newPath   = self::$tmpDir . '/' . Str::random(40) . ($extension != '' ? '.' . $extension : '');
            $result    = static::appStorage()->copy($sourcePath, $newPath);
            if (!$result) {
                throw  new \Exception('Unable to copy file');
            }
            return $newPath;
        } else {
            throw new BadRequestHttpException('File not found');
        }
    }

    static function moveUploadedFileToStorage(UploadedFile $file, $subDirectory, $footprints = false)
    {
        $relativeDirName = $footprints ? rtrim($subDirectory, '/') : rtrim(static::generateStoragePath($subDirectory), '/');
        $name            = $footprints ? $file->getClientOriginalName() : $file->hashName();
        $path            = self::appStorage()->putFileAs($relativeDirName, $file, $name);

        return [
            'name'        => basename($path),
            'storagePath' => $path,
            'size'        => $file->getSize(),
            'fileName'    => trim(basename($file->getClientOriginalName())),
        ];
    }

    /**
     * Copy file from storage S3 to temporary folder
     * @param $storagePath
     * @return string
     * @throws \Exception
     */
    static function storageToLocalPath($storagePath)
    {
        if (App::environment('production')) {
            $extension = pathinfo($storagePath, PATHINFO_EXTENSION);
            if ($extension) $extension = '.' . $extension;
            $tempFile = self::generateOSTempfilename($extension);
            if (!file_put_contents($tempFile, self::appStorage()->get($storagePath))) {
                throw new \Exception('Unable to get file from storage');
            }

            return $tempFile;
        } else {
            return Storage::disk('public')->path($storagePath);
        }
    }

    static function generateOSTempfilename($ext = '.tmp')
    {
        return sys_get_temp_dir() . '/' . Str::random(40) . $ext;
    }

    static function getOSTempDir()
    {
        return sys_get_temp_dir();
    }

    /**
     * @param string $storageFilePath
     * @param $fileName
     * @return StreamedResponse
     */
    static function getStreamedResponse(string $storageFilePath, $fileName)
    {
        if (!$storageFilePath) {
            throw new BadRequestHttpException('No uploaded file');
        }
        $response = new StreamedResponse();
        $response->setCallback(function () use ($storageFilePath) {
            $stream = File::appStorage()->getDriver()->readStream($storageFilePath);
            fpassthru($stream);
            fclose($stream);
        });
        $response->headers->set('Content-Type', File::appStorage()->mimeType($storageFilePath));
        $response->headers->set('Expires', '0');
        $response->headers->set('Cache-Control', 'must-revalidate, post-check=0, pre-check=0, private');
        $response->headers->set('Last-Modified', gmdate('D, d M Y H:i:s'));
        $contentDisposition = $response->headers->makeDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT, strip_tags($fileName), Str::ascii(strip_tags($fileName))
        );
        $response->headers->set('Content-Disposition', $contentDisposition);

        return $response;
    }
}
