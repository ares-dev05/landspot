<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('sitings.name') }}</title>
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,500,600,800|Open+Sans:200,300,400,500,600,700,800" rel="stylesheet">

    @yield('styles')
    @yield('head-scripts')
    @include('content.branding-colors')
</head>
<body>
@include('sitings.content.navigation')
@yield('content')
@yield('body-scripts')
</body>
</html>

