@extends('sitings.layouts.main')

@section('styles')
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link href="{{ mix('css/app.css', '/sitings/assets') }}" rel="stylesheet">
@endsection

@section('body-scripts')
    <script src="{{ mix('js/manifest.js', '/sitings/assets') }}"></script>
    <script src="{{ mix('js/vendor.js', '/sitings/assets') }}"></script>
    <script src="{{ mix('js/app.js', '/sitings/assets') }}"></script>
@endsection

@section('content')
    <div id="modals-root"></div>
    <div id="portal-app-root"></div>
@endsection
