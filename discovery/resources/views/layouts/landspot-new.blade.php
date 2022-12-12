<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ 'Landconnect' /* config('app.name', 'Landconnect') */ }}</title>

    @include('favicon-landconnect')

    @include('content.fonts')
    @include('content.branding-colors')

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

@if(Route::getCurrentRoute()->parameter('discoveryMode') !== 'footprints' &&
    \Request::route()->getName() !== 'footprints')
    @include('content.navigation')
@endif

@yield('content')
<div id="modals-root"></div>
<div id="chat-wrapper"></div>
<div id="fullpage-notification"></div>
<div id="user-notification"></div>

@include('layouts.vendor-scripts')
@yield('body-scripts')
@include('analytics')
</body>
</html>

