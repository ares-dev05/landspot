<?php

namespace Landconnect\Blog\Http\Controllers;

use App\Http\Controllers\Controller;
use Landconnect\Blog\Models\Post;
use Landconnect\Blog\Models\Topic;
use Illuminate\Http\Request;

class PostController extends Controller
{
    use BrandThemeTrait;

    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View|array
     */
    public function index(Request $request)
    {
        $isBlog = $request->input('blog');

        if ($request->expectsJson()) {
            $posts = Post::with(['user:display_name', 'topic:id,title', 'thumb'])
                ->where('is_blog', ($isBlog ? 1 : 0))
                ->latest();
            $topicTitle = $request->topic;

            $topic = null;
            if ($topicTitle) {
                $topic = Topic::byTitle($topicTitle)->first();
            }

            if ($topic) {
                $posts = $posts->byTopic($topic->id);
            }

            $posts = $posts->paginate(7);

            $topics = Topic::whereHas('posts', function ($q) use ($isBlog) {
                $q->where('is_blog', ($isBlog ? 1 : 0));
            })->get(['id', 'title']);

            return compact('posts', 'topics');
        }

        $theme = $this->getBrandColors();
        return view('blog::insights.index', compact('theme'));
    }

    /**
     * Display a listing of the blogs.
     *
     * @param Request $request
     * @return \Illuminate\Contracts\Foundation\Application|\Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function blogIndex(Request $request)
    {
        $isBlog = $request->is('blog');

        $title = $isBlog ? 'Blog' : 'Insights';
        $description = 'Purchasing House and Land Doesn’t need to be complicated. Lotmix makes buying House and Land easy for new home buyers. Join us today.';

        $posts = Post::with(['user:display_name', 'topic:id,title', 'thumb'])
            ->where('is_blog', ($isBlog ? 1 : 0))
            ->latest();
        $topicTitle = $request->topic;
        $topic = null;

        if ($topicTitle) {
            $topic = Topic::byTitle($topicTitle)->first();
        }

        if ($topic) {
            $posts = $posts->byTopic($topic->id);
        }

        $posts = $posts->paginate(7);

        if ($topic) {
            $posts->appends(['topic' => $topicTitle]);
        }

        $topics = Topic::whereHas('posts', function ($q) use ($isBlog) {
            $q->where('is_blog', ($isBlog ? 1 : 0));
        })->get(['id', 'title']);

        $user = auth()->user();
        $isAdmin = $user && $user->isGlobalAdmin();
        $mainPost = $posts->shift();

        return view('lotmix.blog.index', compact('isBlog', 'title', 'description', 'posts', 'topics', 'isAdmin', 'mainPost'));
    }

    /**
     * @param Post $post
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View|array
     */
    public function show(Post $post)
    {
        if (request()->expectsJson()) {
            $post->load(['thumb']);
            $post->author = $post->user()->first(['display_name']);

            $relatedPosts = $post->relatedPosts;
            $post->relatedPosts = $relatedPosts;

            return compact('post');
        }


        $title = $post->title;
        $description = $post->description;

        return view('lotmix.user.spa', compact('title', 'description'));
    }

    /**
     * @param Post $post
     * @return \Illuminate\Contracts\Foundation\Application|\Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function showBlog(Post $post)
    {
        $isBlog = request()->is('blog*');
        if ((bool)$isBlog !== (bool)$post->is_blog) {
            abort(404);
        }

        $title = "$post->title | " . ($post->is_blog ? 'Blog' : 'Insight') . " | Lotmix";
        $description = $post->description;
        $metaImage = $post->thumb->media->smallImage;
        $post->load(['thumb']);
        $post->author = $post->user()->first(['display_name']);

        $relatedPosts = $post->relatedPosts;
        $post->relatedPosts = $relatedPosts;

        return view('lotmix.blog.show', compact('title', 'description', 'metaImage', 'post'));
    }
}
