<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\ImageWithThumbnails;
use App\Models\NotificationMedia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Arr;

class NotificationMediaController extends Controller
{
    /**
     * Return the media library.
     */
    public function index()
    {
        if (\request()->expectsJson()) {
            $mediaItems = NotificationMedia::paginate(50);
            return compact('mediaItems');
        }

        return view('user.spa', ['rootID' => 'notifications']);
    }

    /**
     * Display the specified resource.
     * @param NotificationMedia $notificationMedia
     * @return \Symfony\Component\HttpFoundation\StreamedResponse
     */
    public function show(NotificationMedia $notificationMedia)
    {
        $path = $notificationMedia->path;
        $name = $notificationMedia->name;

        $extension = pathinfo($name, PATHINFO_EXTENSION);
        if (!$extension) $name .= '.' . pathinfo($path, PATHINFO_EXTENSION);

        return File::getStreamedResponse($path, $name);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('admin.notification.media.create');
    }

    /**
     * Store a newly created resource in storage.
     * @param Request $request
     * @return NotificationMedia
     * @throws \Exception
     */
    public function store(Request $request)
    {
        $postData = $this->validate(
            $request,
            [
                'image' => 'required|image',
                'name'  => 'nullable|string|max:255'
            ]
        );

        $image = $request->file('image');
        $name  = $image->getClientOriginalName();

        if (Arr::get($postData, 'name')) {
            $name = $postData['name'];
        }

        $image = ImageWithThumbnails::storeToTempFolder($image, $name);

        if ($image) {
            $mediaFile = NotificationMedia::create();

            $tempFilename = Arr::get($image, 'name');

            if ($tempFilename == '') throw  new \Exception('Invalid name');

            $mediaFile->generateThumbnails($tempFilename)->save();
            $mediaFile->update(compact('name'));

            if (request()->expectsJson()) {
                return $mediaFile;
            }
        }

        return redirect(route('media-file.index', [], false))->withSuccess('Media file created');
    }

    /**
     * Remove the specified resource from storage.
     * @param NotificationMedia $notificationMedia
     * @return RedirectResponse
     * @throws \Exception
     */
    public function destroy(NotificationMedia $notificationMedia)
    {
        $notificationMedia->delete();
        $mediaItems = NotificationMedia::paginate(50);
        $message = 'Media-file removed';

        return compact('mediaItems', 'message');
    }
}
