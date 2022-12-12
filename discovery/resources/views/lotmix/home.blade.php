@extends('lotmix.layouts.lotmix-with-nav')

@section('body-content')
    <main class="home-container">
        <div class="welcome-block">
            <div class="greeting">
                <div>
                    <h1 class="home-h1 dots-top-left"><span class="theme-color">Lotmix</span> makes buying house and
                        land simple.</h1>
                    <p class="greeting-text">Building your dream home has never been easier.</p>
                </div>
                <a href="#how-lotmix-works">
                    <span class="lear-more"><i class="fal fa-arrow-down"></i>Learn more</span>
                </a>
            </div>
            <div class="greeting-img"></div>
        </div>
        <div class="developer-flooplans-block">
            <div class="description-block">
                <div class="dots-bottom-left description">
                    <p class="home-h1 dots-top-right">Explore land for sale</p>
                    <p class="description-text">Find the perfect lot of land to build your dream home.</p>
                </div>
                <a class="lotmix-button"
                   href={{ UrlHelper::securePath('/land-for-sale/communities') }}>
                    Browse Land
                </a>
            </div>
            <div class="lots">
                @foreach($lots as $lot)
                    <div class="lot">
                        <div class="lot-content">
                            <div class="lot-image"
                                 style="background-image: url({{$lot->lot_image}})">
                                <div class="north-icon" style="transform: rotate({{$lot->rotation}}deg);"></div>
                                <div class="company-logo"
                                     style="background-image: url({{$lot->company_image}})"></div>
                            </div>
                            <div class="lot-description">
                                <p class="lot-title"><span>LOT {{$lot->lot_number}} - {{$lot->area}}m<sup>2</sup></span><span>${{$lot->price}}</span>
                                </p>
                                <div class="lot-sizes">
                                    <div><span class="lot-bold">Width:</span> {{(int)$lot->frontage}}m</div>
                                    <div><span class="lot-bold">Length:</span> {{(int)$lot->depth}}m</div>
                                </div>
                                <div class="lot-date"><span class="lot-bold">Title Date:</span>{{$lot->title_date}}
                                </div>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
        <div class="builder-houses-block">
            <div class="description-block">
                <div class="description">
                    <p class="home-h1 dots-top-left">Build your dream home</p>
                    <p class="description-text">Browse leading builders to find the perfect floorplan for your
                        family</p>
                </div>
                <a class="lotmix-button"
                   href="{{ UrlHelper::securePath('/floorplans') }}">
                    Browse Floorplans
                </a>
            </div>
            <div class="floorplans">
                @foreach($houses as $house)
                    <div class="floorplan">
                        <div class="floorplan-content">
                            <div class="floorplan-image"
                                 style="background-image: url({{$house->image}})"
                            >
                                <div class="company-logo"
                                     style="background-image: url({{$house->companyLogo}})"></div>
                            </div>
                            <div class="floorplan-description">
                                <p class="floorplan-title">{{$house->title}}</p>
                                <ul class="item-options">
                                    <li>
                                        <i class="landspot-icon bedroom" aria-hidden="true"></i>
                                        <span>4</span>
                                    </li>
                                    <li>
                                        <i class="landspot-icon bathroom" aria-hidden="true"></i>
                                        <span>2</span>
                                    </li>
                                    <li>
                                        <i class="landspot-icon car-park" aria-hidden="true"></i>
                                        <span>2</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
        <div class="third-step-block">
            <div class="video-block">
                <video autoplay
                       muted
                       playsinline
                       src="{{secure_asset('/video/lotmix_animation.mp4')}}"
                       loop>
                    <source src="{{secure_asset('/video/lotmix_animation.mp4')}}" type="video/mp4">
                </video>
            </div>
            <div class="description-block">
                <div class="description">
                    <p class="home-h1 dots-top-left">The easy way to match house and land.</p>
                    <p class="description-text">Take control of your journey and mix and match house plans with a single
                        click.</p>
                </div>
                <a href="{{ UrlHelper::securePath('/enquire') }}" class="lotmix-button">Match House and Land
                    Now</a>
            </div>
        </div>
        <div class="sunpath-block">
            <div class="sunpath-img" title="sunpath"></div>
            <div class="description-block">
                <div class="description">
                    <p class="home-h1 dots-top-left">Live on the sunny side</p>
                    <p class="description-text">Visualise and animate the sun path over a lot of land. </p>
                </div>
                <a class="lotmix-button" href="{{UrlHelper::secureRoutePath('sunpather')}}">Test a sun path</a>
            </div>
        </div>
        <div class="journey-block">
            <div class="description-block">
                <div class="description">
                    <p class="home-h1 dots-top-left">De-stress your <br> home-buying journey</p>
                    <p class="description-text">With everything you need in one place, keep track, avoid overwhelm, and
                        relax</p>
                </div>
                <a href="{{ UrlHelper::securePath('/enquire') }}" class="lotmix-button">Start your journey
                    now</a>
            </div>
            <div class="possibilities">
                <div class="possibility">
                    <div class="document-icon"></div>
                    <div class="content">
                        <p class="title">Informed choice</p>
                        <p class="pos-description">Easily match floorplans to hundreds of available lots to create your
                            perfect family home. </p>
                    </div>
                </div>
                <div class="possibility">
                    <div class="plans-icon"></div>
                    <div class="content">
                        <p class="title">Review site plans</p>
                        <p class="pos-description">Visualise exactly what your new home will look like before you
                            decide.</p>
                    </div>
                </div>
                <div class="possibility">
                    <div class="building-icon"></div>
                    <div class="content">
                        <p class="title">Access exclusive offers</p>
                        <p class="pos-description">Find and explore deals and offers on house and land packages across
                            your state.</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="exclusive-insights">
            <div class="ex-header">
                <p class="home-h1 dots-bottom-right">Access exclusive Insights</p>
                <p class="description-text">Learn from in-depth educational guides from how to pick a perfect lot of
                    land to understanding all the little things people forget when building a home.</p>
            </div>
            @foreach($relatedPosts as $post)
                <div class="ex-blck">
                    <div title="exclusive"
                         class="ex-image"
                         style="background-image: url('{{$post->thumb &&  $post->thumb->media ? $post->thumb->media->smallImage : ''}}')"></div>
                    <p class="ex-title">{{$post->title}}</p>
                    <p class="ex-description">{{$post->description}}</p>
                    <a class="learn-more"
                       href="{{ UrlHelper::secureRoutePath('show-insight',['post' => $post->slug]) }}"><i class="fal fa-angle-right"></i>Learn
                        more</a>
                </div>
            @endforeach
        </div>
        <div class="companies-block">
            <div class="description-block">
                <div class="description">
                    <p class="home-h1"><span class="dots-top-left">Access</span> builders and developers who care and
                        put your experience first</p>
                </div>
            </div>
            <div class="companies">
                <div class="company orbit"></div>
                <div class="company porter-davis"></div>
                <div class="company firstplace"></div>
                <div class="company kingsbridge"></div>
                <div class="company sherridon"></div>
            </div>
        </div>
        <div class="feedback-block">
            <div class="description-block">
                <div class="description">
                    <p class="home-h1 dots-top-right">Get in touch</p>
                    <p class="description-text">Have a question? We'd love to hear from you.</p>
                    <p class="description-text-mobile">Have a question? We'd love to hear from you.</p>
                </div>
                <a href="mailto:{{config('mail.support.lotmix')}}" class="lotmix-button">Email us</a>
            </div>
            <div class="feedback-image"></div>
        </div>
    </main>
    @include('lotmix.lotmix-footer')
@endsection

@section('styles')
    <link rel="stylesheet" href="{{asset('css/lotmix-homepage.css',true)}}">
@endsection

@section('scripts')
    <script src="{{ mix('js/simple-slider.js') }}"></script>
@endsection
