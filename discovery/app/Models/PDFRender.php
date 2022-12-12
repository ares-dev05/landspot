<?php

namespace App\Models;

use Illuminate\View\View;
use Illuminate\Support\Facades\Storage;

class PDFRender
{
    /**
     * @param View $view
     * @return string
     * @throws \Exception
     * @throws \Throwable
     */
    static function html2pdf(View $view)
    {
        return self::html2pdf_raw($view->render());
    }

    /**
     * string $htmlData
     * @throws \Exception
     * @throws \Throwable
     */
    static function html2pdf_raw($htmlData) {
        $filenamePDF  = sys_get_temp_dir() . '/' . uniqid('', true) . '.pdf';

        $tempFile = File::generateOSTempfilename('.html');
        $result       = file_put_contents($tempFile, $htmlData);
        if (!$result) {
            throw new \Exception('Error writing html');
        }

        $phantomJS = public_path(
            'js/vendor/phantomjs'
        );

        if (!is_executable($phantomJS)) {
            throw new \Exception('Phantomjs required');
        }

        $rasterizeJS = public_path(
            'js/rasterize.js'
        );

        if (!is_readable($rasterizeJS)) {
            throw new \Exception('rasterize.js required');
        }

        $cmdLine = sprintf(
            '%s --ignore-ssl-errors=yes %s %s %s A4',
            escapeshellcmd($phantomJS),
            escapeshellarg($rasterizeJS),
            escapeshellarg($tempFile),
            escapeshellarg($filenamePDF)
        );

        /*exec() removed due to bug in php7.1-fpm */

        $descriptorspec = [
            0 => ['pipe', 'r'],
            1 => ['pipe', 'w'],
            2 => ['file', '/dev/null', 'a']
        ];

        $process = proc_open($cmdLine, $descriptorspec, $pipes, '/tmp');

        stream_get_contents($pipes[1]);
        @fclose($pipes[0]);
        @fclose($pipes[1]);

        proc_close($process);

        unlink($tempFile);

        if (!@filesize($filenamePDF)) {
            throw new \Exception('Error creating pdf');
        }

        return $filenamePDF;
    }

    /**
     * @param View $view
     * @return string
     * @throws \Exception
     * @throws \Throwable
     */
    static function html2png(View $view)
    {
        $filenamePDF  = sys_get_temp_dir() . '/' . uniqid('', true) . '.png';

        $tempFile = File::generateOSTempfilename('.html');
        $result       = file_put_contents($tempFile, $view->render());
        if (!$result) {
            throw new \Exception('Error writing html');
        }

        $phantomJS = public_path(
            'js/vendor/phantomjs'
        );

        if (!is_executable($phantomJS)) {
            throw new \Exception('Phantomjs required');
        }

        $rasterizeJS = public_path(
            'js/rasterize.js'
        );

        if (!is_readable($rasterizeJS)) {
            throw new \Exception('rasterize.js required');
        }

        $cmdLine = sprintf(
            '%s --ignore-ssl-errors=yes %s %s %s A4',
            escapeshellcmd($phantomJS),
            escapeshellarg($rasterizeJS),
            escapeshellarg($tempFile),
            escapeshellarg($filenamePDF)
        );

        /*exec() removed due to bug in php7.1-fpm */

        $descriptorspec = [
            0 => ['pipe', 'r'],
            1 => ['pipe', 'w'],
            2 => ['file', '/dev/null', 'a']
        ];

        $process = proc_open($cmdLine, $descriptorspec, $pipes, '/tmp');

        stream_get_contents($pipes[1]);
        @fclose($pipes[0]);
        @fclose($pipes[1]);

        proc_close($process);

        unlink($tempFile);

        if (!@filesize($filenamePDF)) {
            throw new \Exception('Error creating pdf');
        }

        return $filenamePDF;
    }
}
