@extends('lotmix.layouts.lotmix-with-nav')

@section('body-content')
    <main class="public-estate">
        <div class="lotmix-search">
            <a class="button default" href="{{ UrlHelper::securePrevPath(2) }}">
                <i class="fal fa-angle-left fa-2x back-icon"></i>
            </a>
            <div class="back-title">
                <span class="small">Back to search results</span>
                <span class="big">Melbourne, Victoria</span>
            </div>
            <div id="estate-autocomplete"></div>
        </div>

        @include('lotmix.land-estate.estate-breadcrumbs')

        @include('lotmix.land-estate.estate-info')

        @if (isset($houses))
            @include('lotmix.land-estate.estate-houses')
        @endif

        <div class="lotmix-amenities" id="lotmix-amenities"></div>

        <div class="offer-block-wrapper">
            <div class='offer-block-container'>
                <div class='header'>Looking to build your dream home in this area?</div>
                <div class='description'>Find the perfect builder on Lotmix</div>
                <a href="/floorplans/" class='button-text'>Browse Home Builders</a>
            </div>
        </div>

        @if ($estate->description_secondary)
            @include('lotmix.land-estate.estate-upsell')
        @endif
        <div class="offer-block-wrapper">
            <div class='offer-block-container'>
                <div class='header'>Start your building journey the easy way!</div>
                <div class='description'>Browse house and land now</div>
                <a href="/land-for-sale/communities/" class='button-text'>Search Land For Sale</a>
            </div>
        </div>

        @if ($estate->description_suburb)
            @include('lotmix.land-estate.estate-suburb')
        @endif

        @if (!$estate->estateFaq->isEmpty())
            <div class="lotmix-faq" id="lotmix-faq"></div>
        @endif
    </main>
    <footer class="lotmix-footer">
        <div class="footer-container">
            <a class="footer-logo" href="/" title="Lotmix"></a>
            <p class="footer-text">
                Lotmix is run and operated by Landconnect Global Pty Ltd. Landconnect has been servicing new home
                builders and developers with smart and simple technology throughout Australia since 2014.
            </p>
            <div class="footer-links">
                <a href="{{UrlHelper::secureRoutePath('lotmix-tos')}}">Terms of Use</a>
                <a href="#">Contact Us</a>
            </div>
            <p class="footer-copyright">© {{ now()->year }} Lotmix </p>
        </div>
    </footer>
@endsection

@section('styles')
    <link href="{{ mix('/css/public-estate.css') }}" rel="stylesheet">
@endsection

@section('scripts')
    <script src="https://maps.google.com/maps/api/js?key={{config('app.GOOGLE_MAPS_API_KEY')}}&libraries=places"></script>
    <script src="{{ mix('js/lotmix-amenities.js') }}"></script>
    <script src="{{ mix('js/lotmix-faq.js') }}"></script>
    <script src="{{ mix('js/estate-autocomplete.js') }}"></script>
    <script src="{{ mix('js/simple-slider.js') }}"></script>
@endsection