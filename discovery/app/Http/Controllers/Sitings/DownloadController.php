<?php

namespace App\Http\Controllers\Sitings;

use App\Http\Controllers\Controller;
use App\Models\File;
use App\Models\Sitings\{Floorplan, FloorplanFiles, User};
use Symfony\Component\HttpFoundation\{ResponseHeaderBag, StreamedResponse};
use ZipStreamer\ZipStreamer;

class DownloadController extends Controller
{

    /**
     * @param Floorplan $floorplan
     * @return StreamedResponse
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    function getSVG(Floorplan $floorplan)
    {
        $this->authorize('contractor');

        if (app()->environment('production')) {
            File::setDisk('s3-footprints');
        }
        return File::getStreamedResponse($floorplan->svgPath, $floorplan->url);
    }

    function getFloorplanZIP(Floorplan $floorplan)
    {
        $this->authorize('view', $floorplan);
        $fileName = $floorplan->company->name . ' - ' . $floorplan->name . '.zip';
        $files    = $floorplan->files->map(function (FloorplanFiles $f) {
            return [
                'path' => $f->path,
                'name' => $f->name
            ];
        });

        return $this->getStreamedResponse($files->toArray(), $fileName, function () use ($floorplan) {
            /** @var User $user */
            $user = auth()->user();
//            if ($user->has_portal_access == User::PORTAL_ACCESS_CONTRACTOR && $floorplan->status == Floorplan::STATUS_ATTENTION) {
//                $floorplan->update(['status' => Floorplan::STATUS_IN_PROGRESS]);
//            }
        });
    }

    function getFloorplanDWG(FloorplanFiles $file)
    {
        $this->authorize('view', $file);

        return File::getStreamedResponse($file->path, $file->name);
    }


    /**
     * @param array $files
     * @param $fileName
     * @param \Closure|null $completeCallback
     * @return StreamedResponse
     */
    protected function getStreamedResponse(array $files, $fileName, \Closure $completeCallback = null)
    {
        $response = new StreamedResponse();
        $response->setCallback(function () use ($files, $completeCallback) {
            $this->createZip64File($files);
            if ($completeCallback) $completeCallback();
        });
        $response->headers->set('Content-Type', 'application/x-zip-compressed');
        $response->headers->set('Expires', '0');
        $response->headers->set('Cache-Control', 'must-revalidate, post-check=0, pre-check=0, private');
        $response->headers->set('Last-Modified', gmdate('D, d M Y H:i:s'));
        $contentDisposition = $response->headers->makeDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT, basename($fileName)
        );
        $response->headers->set('Content-Disposition', $contentDisposition);

        return $response;
    }

    /**
     * @param array $arrFiles
     * @return void
     * @throws \Exception
     * @throws \League\Flysystem\FileNotFoundException
     */
    private function createZip64File(array $arrFiles)
    {
        $zipStreamer = new ZipStreamer(['zip64' => false]);
        $filenames   = [];
        $index       = 0;
        foreach ($arrFiles as $file) {
            $path = $file['path'];
            $name = $file['name'];

            $lowerCaseName = mb_strtolower($name);
            if (array_key_exists($lowerCaseName, $filenames)) {
                $fileInfo  = pathinfo($name);
                $fileName  = $fileInfo['filename'] ?? '';
                $extension = $fileInfo['extension'] ?? '';
                $fileName  .= '_' . $index++;
                $name      = $extension != '' ? $fileName . '.' . $extension : $fileName;
            } else {
                $filenames[$lowerCaseName] = true;
            }

            $fp = File::appStorage()->getDriver()->readStream($path);
            if (!$fp) throw new \Exception('error');

            $zipStreamer->addFileFromStream($fp, $name);
            if ($fp) fclose($fp);
        }
        $zipStreamer->finalize();
    }
}
