<?php

namespace Landconnect\Blog\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Landconnect\Blog\Models\Post;
use Landconnect\Blog\Models\Topic;

class TopicController extends Controller
{
    /**
     * Show the application topics index.
     */
    public function index()
    {
        $topics = Topic::paginate(50);
        return view('blog::admin.topics.index', compact('topics'));
    }

    /**
     * Display the specified resource edit form.
     * @param Topic $topic
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function edit(Topic $topic)
    {
        return view('blog::admin.topics.edit', compact('topic'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('blog::admin.topics.create');
    }

    /**
     * Store a newly created resource in storage.
     * @param Request $request
     * @return RedirectResponse
     */
    public function store(Request $request)
    {
        $postData = $this->validate(
            $request,
            [
                'title'       => 'required',
            ]
        );

        $topic = Topic::create($postData);

        return redirect(route('topics.edit', $topic, false))->withSuccess('Topic created');
    }

    /**
     * Update the specified resource in storage.
     * @param Request $request
     * @param Topic $topic
     * @return RedirectResponse
     */
    public function update(Request $request, Topic $topic)
    {
        $postData = $this->validate(
            $request,
            [
                'title'       => 'required',
            ]
        );

        $topic->update($postData);

        return redirect(route('topics.edit', $topic, false))->withSuccess('Topic updated');
    }

    /**
     * Remove the specified resource from storage.
     * @param Topic $topic
     * @return RedirectResponse
     * @throws \Exception
     */
    public function destroy(Topic $topic)
    {
        $posts = Post::byTopic($topic->id)->get();
        $posts->each(function ($post) {
            $post->update(['topic_id' => null]);
        });
        $topic->delete();

        return redirect(route('topics.index', [], false))->withSuccess('Topic deleted. Please update posts');
    }
}
