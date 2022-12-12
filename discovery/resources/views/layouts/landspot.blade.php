<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
    @yield('meta')

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    {{--<title>{{ config('app.name', 'Laravel') }}</title>--}}
    <title>Landconnect</title>

    @include('favicon-landspot')
    <link rel="stylesheet" href="{{ mix('css/font-awesome.css') }}">

    @yield('styles')

    @yield('head-scripts')
    @include('facebook-pixel-code')
    @include('google-ads')
    @include('pinterest-tag')
    @include('event-snippet')
</head>
<body>
@include('facebook-pixel-code-noscript')
@include('pinterest-tag-noscript')

<div class="landspot-container {{Route::is('register') ? 'register' : ''}}{{Route::is('login', 'password.request') ? 'login' : ''}}{{Route::is('reset.invitation.password') ? 'invitation' : ''}}">
    @include('layouts.navbar')

    <div id="wrapper">
        @yield('content')
    </div>

    @if(Route::is('register', 'terms-of-use', 'homepage')  || Route::currentRouteName() == null)
        @include('layouts.footer')
    @endif
</div>
@include('layouts.vendor-scripts')
@yield('body-scripts')
@include('analytics')
</body>
</html>

