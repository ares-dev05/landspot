<?php

namespace Landconnect\Blog\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\File;
use App\Models\ImageWithThumbnails;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Landconnect\Blog\Models\Media;
use Landconnect\Blog\Models\Post;
use Illuminate\Support\Arr;

class MediaController extends Controller
{
    /**
     * Return the media library.
     */
    public function index()
    {
        $media = Media::get();
        return view('blog::admin.media.index', compact('media'));
    }

    /**
     * Show the application posts index.
     */
    public function uploadFile()
    {
        dd(\request()->all());
    }

    /**
     * Show the application posts index.
     * @param Post $post
     * @return RedirectResponse
     * @throws \Exception
     */
    public function deleteThumb(Post $post)
    {
        $post->update(['thumb_id' => null]);

        return redirect(route('posts.edit', $post, false))->withSuccess('Post updated');
    }

    /**
     * Display the specified resource.
     * @param Media $media
     * @return \Symfony\Component\HttpFoundation\StreamedResponse
     */
    public function show(Media $media)
    {
        $mediaFile = $media->media;
        $path = $mediaFile->path;
        $name = $mediaFile->name;

        return File::appStorage()->download($path, $name);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('blog::admin.media.create');
    }

    /**
     * Store a newly created resource in storage.
     * @param Request $request
     * @return RedirectResponse|\Landconnect\Blog\Models\MediaFile
     * @throws \Exception
     */
    public function store(Request $request)
    {
        $postData = $this->validate(
            $request,
            [
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:10000',
                'name' => 'nullable|string|max:100'
            ],
            [
                'image.max' => 'The picture should be no more than 10mb'
            ]
        );

        $image = $request->file('image');
        $name = $image->getClientOriginalName();

        if (Arr::get($postData,'name')) {
            $name = $postData['name'];
        }

        $image = ImageWithThumbnails::storeToTempFolder($image, $name);

        if ($image) {
            $media = Media::create();

//            $name         = Arr::get($image, 'fileName', 'Noname');
            $tempFilename = Arr::get($image, 'name');

            if ($tempFilename == '') throw  new \Exception('Invalid name');

            $mediaFile = $media->media;
            $mediaFile->generateThumbnails($tempFilename)->save();
            $mediaFile->update(compact('name'));

            if (request()->expectsJson()) {
                return $mediaFile;
            }
        }

        return redirect(route('media.index', [], false))->withSuccess('Media file created');
    }

    /**
     * Remove the specified resource from storage.
     * @param Media $media
     * @return RedirectResponse
     * @throws \Exception
     */
    public function destroy(Media $media)
    {
        $posts = Post::byThumb($media->id)->get();
        $posts->each(function ($post) {
            $post->update(['thumb_id' => null]);
        });
        $media->delete();

        return redirect(route('media.index', [], false))->withSuccess('Media file deleted');
    }
}
