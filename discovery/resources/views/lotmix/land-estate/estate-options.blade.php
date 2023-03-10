@extends('lotmix.layouts.lotmix-with-nav')

@section('body-content')

    <main class="estate-options">
        <div id="estate-options"></div>
    </main>
    <footer class="lotmix-footer">
        <div class="footer-container">
            <a class="footer-logo" href="/" title="Lotmix"></a>
            <p class="footer-text">
                Lotmix is run and operated by Landconnect Global Pty Ltd. Landconnect has been servicing new home
                builders and developers with smart and simple technology throughout Australia since 2014.
            </p>
            <div class="footer-links">
                <a href="{{UrlHelper::secureRoutePath('lotmix-privacy-policy')}}">Privacy
                    Policy</a>
                <a href="{{UrlHelper::secureRoutePath('lotmix-tos')}}">Terms of Use</a>
                <a href="#">Contact Us</a>
            </div>
            <p class="footer-copyright">© {{ now()->year }} Lotmix </p>
        </div>
    </footer>
@endsection

@section('styles')
    <link href="{{ mix('/css/estate-options.css') }}" rel="stylesheet">
@endsection

@section('scripts')
    <script src="https://maps.google.com/maps/api/js?key={{config('app.GOOGLE_MAPS_API_KEY')}}&libraries=places"></script>
    <script src="{{ mix('js/estate-options.js') }}"></script>
@endsection