<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'Landspot') }}</title>

    @include('favicon-landspot')
    @include('content.fonts')

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

@yield('content')

@include('layouts.vendor-scripts')
@yield('body-scripts')
@include('analytics')
</body>
</html>

