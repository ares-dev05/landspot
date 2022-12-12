@extends('lotmix.layouts.lotmix-with-nav')


@section('body-content')
    <div class="primary-container responsive-container">
        <div class="enquire-once" id="enquire-once-root"></div>
    </div>
@endsection

@section('styles')
    <link href="{{ mix('css/lotmix-enquire-once.css') }}" rel="stylesheet">
@endsection

@section('scripts')
    <script src="{{ mix('js/enquire-once.js') }}"></script>
@endsection