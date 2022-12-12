<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <meta property='og:title' content="{{$title ?? 'Lotmix'}}"/>
    @if(isset($metaImage))
        <meta property='og:image' content="{{url($metaImage)}}"/>
    @endif
    <meta property='og:description'
          content="{{$description ?? 'Lotmix is one platform for new home buyers to effortlessly navigate and managing purchasing house and land in Australia.'}}"/>
    <meta property='og:url'
          content={{!empty($estate) ? UrlHelper::securePrevPath() : (secure_url(request()->path()) . '/')}}
    />

    <title>{{$title ?? 'Lotmix'}}</title>
    <meta name="description"
          content="{{$description ?? 'Lotmix is one platform for new home buyers to effortlessly navigate and managing purchasing house and land in Australia.'}}">

    @include('favicon-lotmix')

    @include('content.fonts')

    <style type="text/css">
        :root {
            --main-color: #29C97C;
            --logo-color: #29C97C;
        }
    </style>

    @yield('styles')

    @yield('head-scripts')
    @include('facebook-pixel-code')
    @include('google-ads')
    @include('pinterest-tag')
    @include('event-snippet')
    @guest
        <link rel="canonical"
              href={{ UrlHelper::securePath(request()->path()) }}
        />
    @endguest
</head>
<body>
@include('facebook-pixel-code-noscript')
@include('pinterest-tag-noscript')

@yield('content')
<div id="modals-root"></div>
<div id="lotmix-notification"></div>
<div id="fullpage-notification"></div>

@include('layouts.vendor-scripts')
@yield('body-scripts')
@include('lotmix.analytics')
</body>
</html>

