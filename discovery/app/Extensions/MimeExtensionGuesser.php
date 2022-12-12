<?php

namespace App\Extensions;

use Symfony\Component\HttpFoundation\File\MimeType\MimeTypeExtensionGuesser;

class MimeExtensionGuesser extends MimeTypeExtensionGuesser
{
    protected $defaultExtensions = [
        'image/svg' => 'svg',
    ];
}