@extends('lotmix.layouts.lotmix-with-nav')

@section('body-content')
    <div class="primary-container responsive-container">
        <section class="content insights">
            <div class="container">
                <div class="posts" itemscope>
                    @if(isset($mainPost) && $mainPost)
                        <div class="post main">
                            <div class="landspot-thumb-item" itemtype="http://schema.org/House">
                                <img src="{{$mainPost->thumb && $mainPost->thumb->media && $mainPost->thumb->media->smallImage ? $mainPost->thumb->media->smallImage : ''}}"
                                     class="catalog-img post-image"
                                     itemprop="image"
                                     alt="post image">
                            </div>
                            <div class="description">
                                <span class="category">{{$mainPost->topic && $mainPost->topic->title ? $mainPost->topic->title : ''}}</span>
                                <h1 class="title" itemprop="name">
                                    <a itemprop="url"
                                       href="{{ UrlHelper::securePath('/' . ($isBlog ? 'blog' : 'insights') . '/' . $mainPost->slug) }}">{{$mainPost->title}}</a>
                                </h1>
                                <span class="desc" itemprop="description">{{$mainPost->description}}</span>
                                <button class="button default read-more">Read more</button>
                            </div>
                        </div>
                        <nav class="topics">
                            <ul class="main-nav">
                                <li class="nav-item">
                                    <a class="button {{request()->get('topic') === null ? 'primary' : 'default'}}"
                                       href="{{secure_url('/' . ($isBlog ? 'blog' : 'insights')) . '/'}}">All
                                        topics</a>
                                </li>
                                @foreach($topics as $topic)
                                    <li class="nav-item">
                                        <a class="button {{request()->get('topic') === $topic->title ? 'primary' : 'default'}}"
                                           href="{{ UrlHelper::securePath('/' . ($isBlog ? 'blog' : 'insights') . '/' . "?topic=$topic->title") }}">{{$topic->title}}</a>
                                    </li>
                                @endforeach
                                @if($isAdmin)
                                    <li class="nav-item">
                                        <a class="button default"
                                           href="{{ UrlHelper::securePath('/insights/admin') }}">
                                            Admin panel
                                        </a>
                                    </li>
                                @endif
                            </ul>
                        </nav>
                        <div class="posts-list">
                            @foreach($posts as $post)
                                <div class="post" itemtype="http://schema.org/House">
                                    <div class="landspot-thumb-item">
                                        <img itemprop="image"
                                             src="{{$post->thumb && $post->thumb->media && $post->thumb->media->smallImage ? $post->thumb->media->smallImage : ''}}"
                                             class="catalog-img post-image" alt="post image">
                                    </div>
                                    <div class="description">
                                        <span class="category">{{$post->topic && $post->topic->title ? $post->topic->title : ''}}</span>
                                        <a class="title"
                                           href="{{ UrlHelper::securePath('/' . ($isBlog ? 'blog' : 'insights') . '/' . $post->slug) }}"
                                           itemprop="name">{{$post->title}}</a>
                                        <span class="desc" itemprop="description">{{$post->description}}</span>
                                        <button class="button default read-more"
                                                itemprop="button">Read more
                                        </button>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                        {{ $posts->links('lotmix.blog.custom-pagination') }}
                    @else
                        <div>There are no posts</div>
                    @endif
                </div>
            </div>
        </section>
    </div>
@endsection
@section('styles')
    <link href="{{ mix('css/lotmix-insights.css') }}" rel="stylesheet">
@endsection
@section('scripts')
    <script>
        const readMoreButtons = document.getElementsByClassName('read-more');
        Array.from(readMoreButtons).forEach(el => {
            el.addEventListener('click', function (e) {
                e.target.parentNode.querySelector('a').click();
            });
        });
    </script>
@endsection