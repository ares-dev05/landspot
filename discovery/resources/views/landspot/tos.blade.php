@extends('layouts.landspot')

@section('meta')
    <meta name="robots" content="noindex, nofollow" />
@endsection

@section('styles')
    <link href="{{ mix('css/landspot-homepage.css') }}" rel="stylesheet">
@endsection

@section('content')
    <div class="container">
        <div class="row">
            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                <div class="text-wrapper">
                    @include('landspot.tos-text')
                </div>
            </div>
        </div>
    </div>
@endsection

@section('body-scripts')
    <script src="{{ mix('js/app.js') }}"></script>
@endsection
