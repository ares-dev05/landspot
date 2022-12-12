<?php

namespace App\Models;

class ImageHelper
{
    public $imagick;
    public $format;
    public $size;
    public $mime;
    protected $sourceImagePath;

    /**
     * ImageHelper constructor.
     * @param $sourceImagePath
     * @param $skipRead
     * @param $referencePlan
     * @throws \Exception
     */
    function __construct($sourceImagePath, $skipRead = false, $referencePlan=false)
    {
        $this->imagick         = new \Imagick();
        $this->sourceImagePath = $sourceImagePath;

        $this->extractImageData();
        if ($skipRead) {
            return $this;
        }
        $this->imagick->clear();

        if ($this->format === 'SVG') {
            return $this;
        }

        if ($this->format === 'PBM') {
            //Fix initial PDF resolution (96dpi)
            $this->imagick->setResolution(300, 300);
        }

        if ($referencePlan) {
            $this->imagick->setColorspace(1);
            $this->imagick->setResolution(120, 120);
        }

        $this->imagick->readImage($this->sourceImagePath);
        $this->imagick->setImageType(\Imagick::IMGTYPE_TRUECOLORMATTE);
        $this->imagick->setImageOrientation(\Imagick::ORIENTATION_UNDEFINED);
        $this->imagick->setBackgroundColor(new \ImagickPixel('transparent'));

        $this->imagick->stripImage();

        return $this;
    }

    function __destruct()
    {
        $this->imagick->clear();
    }

    /**
     * @throws \Exception
     */
    function extractImageData()
    {
        try {
            //Imagemagick 6 has a critical bug which cause complete crash of php-fpm process
            //upon extracting data from SVG. May it would be fixed in Imagemagick 7
            $mime = mime_content_type($this->sourceImagePath);
            if ($mime == 'image/svg+xml') {
                $this->size   = ['height' => 0, 'width' => 0];
                $this->format = 'SVG';
                $this->mime   = $mime;

                return;
            }
            $this->imagick->pingImage($this->sourceImagePath);
            $this->format = $this->imagick->getImageFormat();
            $this->size   = $this->imagick->getImageGeometry();
            $this->mime   = $this->imagick->getImageMimeType();
            if ($this->mime == 'image/png') {
                $this->mime = $mime;
            }
        } catch (\Exception $e) {
            throw new \Exception('Image is invalid');
        };
    }

    /**
     * @param $destPath
     * @param $maxSizeX
     * @param $maxSizeY
     * @param bool $crop
     * @param float $trimTolerance
     * @return string
     * @throws \Exception
     */
    function resizeWithAspectRatio($destPath, $maxSizeX, $maxSizeY, $crop = false, $trimTolerance = 0)
    {
        if ($this->format == 'PNG' || $this->format == 'GIF') {
            if ($this->imagick->getImageAlphaChannel()) {
                $this->imagick->setImageAlphaChannel(\Imagick::ALPHACHANNEL_ACTIVATE);
            }
            $this->imagick->setImageCompression(\Imagick::COMPRESSION_ZIP);
        } else {
            $this->imagick->setImageFormat('JPG');
            $this->imagick->setImageCompression(\Imagick::COMPRESSION_JPEG);
            $this->imagick->setImageCompressionQuality(85);
        }

        if ($trimTolerance) {
            $this->imagick->trimImage($trimTolerance);
        }

        if ($crop) {
            $this->imagick->setImagePage(0, 0, 0, 0);
            $this->imagick->setImageGravity(\Imagick::GRAVITY_CENTER);
            $this->imagick->cropThumbnailImage($maxSizeX, $maxSizeY);
        } else {
            $this->imagick->thumbnailImage($maxSizeX, $maxSizeY, true, false);
        }

        return $this->imagick->writeImage($destPath);
    }

    /**
     * @param $destPath
     * @return bool
     */
    function thumbnailPDF($destPath)
    {
        $this->setImageConfig();

        return $this->imagick->writeImage($destPath);
    }

    protected function setImageConfig($pageNumber = 0)
    {
        $this->imagick->setIteratorIndex($pageNumber);
        $this->imagick->setImageFormat('png');
        $this->imagick->setImageUnits(\Imagick::RESOLUTION_PIXELSPERINCH);
        $this->imagick->setImageResolution(300, 300);
        $this->imagick->setImageCompression(\Imagick::COMPRESSION_ZIP);
        $this->imagick->setCompressionQuality(100);
    }

    function thumbnailPDFPages($destPath)
    {
        $this->setImageConfig();
        $this->imagick->writeImages($destPath, true);
        return $this->getNumberImages();
    }

    function getNumberImages()
    {
        return $this->imagick->getNumberImages();
    }

    function getImageLength()
    {
        return $this->size;
    }

    function resizeImage()
    {
//        $im->trimImage(0);
//        $im->setImagePage(0, 0, 0, 0);
    }
}