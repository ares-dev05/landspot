@extends('layouts.landspot-new')

@section('content')
    @component('content.react-root')
        {{$rootID}}
    @endcomponent
@endsection


@section('styles')
    <link href="{{ mix('css/landspot-main.css') }}" rel="stylesheet">
@endsection

@section('body-scripts')
    @isset($googleMap)
    <script src="https://maps.google.com/maps/api/js?key={{config('app.GOOGLE_MAPS_API_KEY')}}&libraries=places"></script>
    @endisset
    <script src="{{ mix('js/app.js') }}"></script>
@endsection



