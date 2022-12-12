@extends('lotmix.layouts.lotmix-with-nav')

@section('body-content')
    <div class="primary-container responsive-container">
        <section class="content insights">
            <div class="container">
                <div class="blog-post" itemscope itemtype="http://schema.org/House">
                    @if($post->thumb && $post->thumb->media && $post->thumb->media->smallImage)
                        <div class="landspot-thumb-item">
                            <div class="catalog-img"
                                 style="background: url({{$post->thumb->media->smallImage}}) center center / cover rgb(244, 243, 243);">
                                <div class="title"></div>
                            </div>
                        </div>
                    @endif
                    <h1 class="title" itemprop="name">{{$post->title}}</h1>
                    <div class="desc" itemprop="description">{{$post->description}}</div>
                    <div class="author">{{$post->author->display_name}}
                        &#x2014; {{$post->created_at->format('d F Y')}}</div>
                    <div class="delimiter">
                        <span class="line"></span>
                        <i class="fas fa-quote-left"></i>
                        <span class="line"></span>
                    </div>
                    <div class="content">
                        {!! $post->content !!}
                    </div>
                    <div class="share-post author">
                        <div>SHARE THIS POST</div>
                        <div>
                            <div role="button" tabindex="0"
                                 class="SocialMediaShareButton SocialMediaShareButton--facebook">
                                <div style="width: 32px; height: 32px;">
                                    <svg viewBox="0 0 64 64" width="32" height="32"
                                         class="social-icon social-icon--facebook ">
                                        <g>
                                            <circle cx="32" cy="32" r="31" fill="#3b5998"
                                                    style="fill: transparent;"></circle>
                                        </g>
                                        <g>
                                            <path d="M34.1,47V33.3h4.6l0.7-5.3h-5.3v-3.4c0-1.5,0.4-2.6,2.6-2.6l2.8,0v-4.8c-0.5-0.1-2.2-0.2-4.1-0.2 c-4.1,0-6.9,2.5-6.9,7V28H24v5.3h4.6V47H34.1z"
                                                  fill="#9B9B9B"></path>
                                        </g>
                                    </svg>
                                </div>
                            </div>
                            <div role="button" tabindex="0"
                                 class="SocialMediaShareButton SocialMediaShareButton--linkedin">
                                <div style="width: 32px; height: 32px;">
                                    <svg viewBox="0 0 64 64" width="32" height="32"
                                         class="social-icon social-icon--linkedin ">
                                        <g>
                                            <circle cx="32" cy="32" r="31" fill="#007fb1"
                                                    style="fill: transparent;"></circle>
                                        </g>
                                        <g>
                                            <path d="M20.4,44h5.4V26.6h-5.4V44z M23.1,18c-1.7,0-3.1,1.4-3.1,3.1c0,1.7,1.4,3.1,3.1,3.1 c1.7,0,3.1-1.4,3.1-3.1C26.2,19.4,24.8,18,23.1,18z M39.5,26.2c-2.6,0-4.4,1.4-5.1,2.8h-0.1v-2.4h-5.2V44h5.4v-8.6 c0-2.3,0.4-4.5,3.2-4.5c2.8,0,2.8,2.6,2.8,4.6V44H46v-9.5C46,29.8,45,26.2,39.5,26.2z"
                                                  fill="#9B9B9B"></path>
                                        </g>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                @if($post->relatedPosts->isNotEmpty())
                    <div class="posts related-posts" itemscope>
                        <div class="heading">Related articles:</div>
                        <div class="posts-list">
                            @foreach($post->relatedPosts as $reladetPost)
                                <div class="post" itemtype="http://schema.org/House">
                                    <div class="landspot-thumb-item">
                                        <img itemprop="image"
                                             src="{{$reladetPost->thumb && $reladetPost->thumb->media && $reladetPost->thumb->media->smallImage ? $reladetPost->thumb->media->smallImage : ''}}"
                                             class="catalog-img post-image"
                                             alt="post image">
                                    </div>
                                    <div class="description">
                                        <span class="category">{{$reladetPost->topic && $reladetPost->topic->title ? $reladetPost->topic->title : ''}}</span>
                                        <a class="title"
                                           href="{{ UrlHelper::securePath('/' . ($reladetPost->is_blog ? 'blog' : 'insights') . '/' . $reladetPost->slug) }}"
                                           itemprop="name">{{$reladetPost->title}}</a>
                                        <span class="desc"
                                              itemprop="description">{{$reladetPost->description}}</span>
                                        <button class="button default read-more"
                                                itemprop="button">Read more
                                        </button>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    </div>
                @endif
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
                e.target.parentNode.querySelector('a.title').click();
            });
        });
        window.onload = function () {
            const content = document.getElementsByClassName('content')[0];
            if (content) {
                const images = content.getElementsByTagName('img');
                const iframes = content.getElementsByTagName('iframe');
                for (let i = 0, iframe; (iframe = iframes[i++]);) {
                    const parentNode = iframe.parentNode;
                    if (!parentNode.classList.contains('iframe-container')) {
                        parentNode.classList.add('iframe-container');
                    }
                }
                for (let i = 0, image; (image = images[i++]);) {
                    const parentNode = image.parentNode;
                    if (parentNode.tagName === 'P' && !parentNode.classList.contains('full-width')) {
                        parentNode.classList.add('full-width');
                    }
                }
            }
        };
    </script>
@endsection