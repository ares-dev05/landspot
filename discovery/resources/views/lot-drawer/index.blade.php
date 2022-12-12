@extends('layouts.landspot-new')

@section('styles')
    <link href="{{ mix('css/landspot-main.css') }}" rel="stylesheet">
@endsection

@section('content')
    <div class="primary-container responsive-container lot-drawer" id="lot-drawer"></div>
@endsection

@section('body-scripts')
    <script src="{{ mix('js/app.js') }}"></script>
@endsection