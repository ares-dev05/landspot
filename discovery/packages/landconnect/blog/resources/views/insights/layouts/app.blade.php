<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    @php
        $title = isset($_SERVER['HTTP_X_INSIGHTS_URL']) && strpos($_SERVER['HTTP_X_INSIGHTS_URL'], 'landconnect', 0) !== 0
                ? 'Landconnect - Insights'
                : config('app.name', 'Landconnect') . ' - Insights';
    @endphp
    <title>{{ $title }}</title>

    @include('blog::insights.content.fonts')

    @yield('styles')

    @yield('head-scripts')
</head>
<body>
@include('blog::insights.layouts.navbar')

@yield('content')

@include('blog::insights.layouts.footer')
<script src="{{ secure_url(mix('js/manifest.js')) }}"></script>
<script src="{{ secure_url(mix('js/vendor.js')) }}"></script>
@yield('body-scripts')

@if(App::environment('production'))
    <!-- Start of HubSpot Embed Code -->
    <script type="text/javascript" id="hs-script-loader" async defer src="https://js.hs-scripts.com/4950737.js"></script>
    <!-- End of HubSpot Embed Code -->
@endif
</body>
</html>
