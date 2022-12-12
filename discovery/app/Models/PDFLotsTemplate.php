<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class PDFLotsTemplate
 * @property int estate_id
 * @property string header_logo
 * @property string footer_logo
 * @property string template_data
 * @property Estate estate
 */
class PDFLotsTemplate extends Model implements FileStorageInterface
{
    use FileStorageTrait;

    protected $table = 'pdf_lots_template';
    protected $fillable = [
        'estate_id', 'header_logo', 'footer_logo', 'template_data'
    ];

    protected $appends = ['headerImage', 'footerImage'];
    protected $visible = ['headerImage', 'footerImage', 'template_data'];
    protected $casts = ['template_data' => 'array'];

    const imageFields = ['header_logo', 'footer_logo'];

    public $timestamps = false;

    public function estate()
    {
        return $this->belongsTo(Estate::class);
    }

    function getHeaderImageAttribute()
    {
        return $this->header_logo ? ImageWithThumbnails::storageUrl($this->header_logo) : null;
    }

    function getFooterImageAttribute()
    {
        return $this->footer_logo ? ImageWithThumbnails::storageUrl($this->footer_logo) : null;
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function (PDFLotsTemplate $item) {
            if (is_array($item->template_data)) {
                $validFields         = array_flip([
                    'disclaimerText',
                    'introText',
                    'titleText',
                    'templateFont',
                    'tableHeadFontColor',
                    'tableHeadColor',
                    'tableBodyOddRowColor',
                    'tableBodyEvenRowColor',
                    'tableTextColor',
                ]);
                $item->template_data = array_intersect_key($item->template_data, $validFields);
            }
        });
    }

    static function getFilesStorageFields()
    {
        return static::imageFields;
    }
}
