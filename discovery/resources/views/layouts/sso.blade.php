<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
    <meta name="robots" content="noindex, nofollow" />

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    {{--<title>{{ config('app.name', 'Laravel') }}</title>--}}
    <title>Landconnect</title>

    @include('favicon-landconnect')
    <link rel="stylesheet" href="{{ mix('css/font-awesome.css') }}">
    <link href='{{ mix("css/sso.css") }}' rel="stylesheet">

    @yield('styles')

    @yield('head-scripts')
</head>
<body>
<div class="sso-container {{Route::is('login', 'password.request', 'brand.login') ? 'login' : ''}}">
    <nav class="navbar navbar-default navbar-static-top">
        <div class="navbar-header">
            <div class="container">
                <div class="row">
                    <div class="col-xs-6 col-sm-8 col-md-12 col-lg-12">
                        <a class="navbar-brand"
                           href="{{ $navUrl ?: \UrlHelper::currentRelativeUrl() }}"></a>
                    </div>
                </div>
            </div>
        </div>
    </nav>
    <div id="wrapper">
        @yield('content')
    </div>
</div>
@include('layouts.vendor-scripts')
@yield('body-scripts')
</body>
</html>

