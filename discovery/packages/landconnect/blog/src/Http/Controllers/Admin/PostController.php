<?php

namespace Landconnect\Blog\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Landconnect\Blog\Models\Connection;
use Landconnect\Blog\Models\Media;
use Landconnect\Blog\Models\Post;
use Landconnect\Blog\Models\Topic;
use Illuminate\Support\Str;

class PostController extends Controller
{
    /**
     * Show the application posts index.
     */
    public function index()
    {
        $posts = Post::latest()->paginate(50);
        return view('blog::admin.posts.index', compact('posts'));
    }

    /**
     * Display the specified resource edit form.
     */
    public function edit(Post $post)
    {
        $media  = Media::all();
        $topics = Topic::get(['id','title']);
        return view('blog::admin.posts.edit', compact('topics', 'media', 'post'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $media  = Media::all();
        $topics = Topic::get(['id','title']);
        return view('blog::admin.posts.create', compact('topics', 'media'));
    }

    /**
     * Store a newly created resource in storage.
     * @param Request $request
     * @return RedirectResponse
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {
        if(!$request->filled('slug')){
            $request->merge([
                'slug' => Str::slug($request->input('title'))
            ]);
        }


        $connection = Connection::i()->getConnection();
        $postData = $this->validate(
            $request,
            [
                'title'       => 'required',
                'content'     => 'required',
                'thumb_id'    => 'nullable|exists:' . $connection . '.blog_media,id',
                'topic_id'    => 'nullable|exists:' . $connection . '.blog_topics,id',
                'description' => 'required|string|max:155',
                'is_blog'        => 'nullable|in:1',
                'slug'        => 'unique:' . $connection . '.blog_posts,slug',
            ],
            [
                'topic_id.required' => 'Please choose a topic from the list',
                'slug.unique'       => 'Post with this title already exists'
            ]
        );

        $post = Post::create($postData);

        return redirect(route('posts.edit', $post, false))->withSuccess('Post created');
    }

    /**
     * Update the specified resource in storage.
     * @param Request $request
     * @param Post $post
     * @return RedirectResponse
     * @throws \Illuminate\Validation\ValidationException
     */
    public function update(Request $request, Post $post)
    {
        if(!$request->filled('slug')){
            $request->merge([
                'slug' => Str::slug($request->input('title'))
            ]);
        }
        $connection = Connection::i()->getConnection();
        $postData = $this->validate(
            $request,
            [
                'title'       => 'required',
                'content'     => 'required',
                'thumb_id'    => 'nullable|exists:' . $connection . '.blog_media,id',
                'topic_id'    => 'nullable|exists:' . $connection . '.blog_topics,id',
                'description' => 'required|string|max:155',
                'is_blog'      => 'nullable|in:1',
                'slug'        => 'unique:' . $connection . '.blog_posts,slug,' . (optional($request->post)->id ?: 'NULL'),
            ],
            [
                'topic_id.required' => 'Please choose a topic from the list',
            ]
        );
        $postData['is_blog'] = $request->input('is_blog', 0);

        $post->update($postData);

        return redirect(route('posts.edit', $post, false))->withSuccess('Post updated');
    }

    /**
     * Remove the specified resource from storage.
     * @param Post $post
     * @return RedirectResponse
     * @throws \Exception
     */
    public function destroy(Post $post)
    {
        $post->delete();

        return redirect(route('posts.index', [], false))->withSuccess('Post deleted');
    }
}
