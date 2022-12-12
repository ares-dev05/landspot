<?php


namespace App\Models\Sitings;


use App\Models\{
    File, ImageHelper, Range
};
use Illuminate\Support\Str;

/**
 * Trait HasSitingsCompany
 * @property string template_thumb
 * @property string templateImage
 * @property Range ranges
 * @property Floorplan floorplans
 */
trait HasSitingsCompany
{
    /**
     * @return string
     * @throws \Exception
     * @throws \Throwable
     */
    function getTemplateImageAttribute()
    {
        return $this->template_thumb
            ? $this->templateThumbUrl()
            : $this->getTemplateThumb();
    }

    /**
     * @return string
     */
    protected function templateThumbUrl()
    {
        return $this->template_thumb
            ? File::storageTempUrl($this->template_thumb, now()->addDay(2))
            : null;
    }

    /**
     * @return string
     * @throws \Exception
     * @throws \Throwable
     */
    protected function getTemplateThumb()
    {
        $areaData = (object) [
            'lotArea'        => 0,
            'layersArea'     => 0,
            'totalHouseArea' => 0,
            'totalCoverage'  => 0
        ];
        $rotation = 0;
        $siting   = new Siting();

        try {
            $pdf = Siting::printBrochure($siting, $this, $areaData, $rotation);

            if ($pdf) {
                $fileName = Str::random(40) . '.png';
                $thumbPath = File::getOSTempDir() . '/thumb_' . $fileName;

                (new ImageHelper($pdf))->thumbnailPDF($thumbPath);

                File::storeToTempFolderFromPath($thumbPath, $fileName);
                $template_thumb = File::moveTemporaryFileToStorage($fileName, 'sitings_template_thumb');
                $this->update(compact('template_thumb'));

                return $this->templateThumbUrl();
            }
        } catch (\Exception $e) {
            throw $e;
        }
    }

    function ranges()
    {
        return $this->hasMany(Range::class, 'cid', 'id');
    }

    function floorplans()
    {
        return $this->hasMany(Floorplan::class);
    }
}