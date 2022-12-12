@extends('layouts.landspot-new')

@section('styles')
    <link href="{{ mix('css/landspot-main.css') }}" rel="stylesheet">
@endsection

@section('content')
    @if( Route::getCurrentRoute()->parameter('discoveryMode') === 'footprints' ||
        \Request::route()->getName() === 'footprints')
        <div class="footprints-wrapper">
            <div class="primary-container responsive-container" id="footprints"></div>
        </div>
    @else
        <div class="primary-container responsive-container"
             id="{{Route::getCurrentRoute()->parameter('discoveryMode') ?? 'discovery'}}"></div>
    @endif
@endsection

@section('body-scripts')
    <script src="{{ mix('js/app.js') }}"></script>
@endsection