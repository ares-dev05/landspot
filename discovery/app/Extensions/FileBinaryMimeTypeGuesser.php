<?php

namespace App\Extensions;

use Symfony\Component\HttpFoundation\File\Exception\{AccessDeniedException, FileNotFoundException};
use Symfony\Component\HttpFoundation\File\MimeType\MimeTypeGuesserInterface;

class FileBinaryMimeTypeGuesser implements MimeTypeGuesserInterface
{
    function guess($path)
    {
        if (!is_file($path)) {
            throw new FileNotFoundException($path);
        }

        if (!is_readable($path)) {
            throw new AccessDeniedException($path);
        }
        $size = (int)filesize($path);
        if ($size > 11) {
            $tag1 = @file_get_contents($path, false, null, 0, 5);
            $tag2 = @file_get_contents($path, false, null, $size - 6, 6);
            if ($tag1 !== false && $tag2 !== false && strtolower($tag1) === '<svg ' && strtolower($tag2) === '</svg>') {
                return 'image/svg';
            }
        }
    }
}