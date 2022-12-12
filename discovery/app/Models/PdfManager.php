<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class PdfManager extends Builder
{
    /**
     * @return BelongsToMany
     */
    //These are estates to which ones a PDF manager can upload packages. Pdf manager sees all estates
    function estatePDF()
    {
        return $this->belongsToMany(Estate::class, 'pdf_managers', 'manager_id');
    }
}
