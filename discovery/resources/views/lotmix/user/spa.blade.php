@extends('lotmix.layouts.lotmix-with-nav')

@section('body-content')
    @if(preg_match('~MSIE|Internet Explorer~i', $_SERVER['HTTP_USER_AGENT']) || preg_match('~Trident/7.0(; Touch)?; rv:11.0~',$_SERVER['HTTP_USER_AGENT']))
        <h1 style="color:#009381;font-family: Montserrat, sans-serif; text-align: center;">To Login to your <a style="color: #035b43; text-decoration: underline;" href="{{config('app.LOTMIX_URL')}}">{{config('app.LOTMIX_URL')}}</a> account please use Google Chrome, Mozilla Firefox or Microsoft Edge.
            <br>Your browser is out of date. </h1>
    @else
        <div class="lotmix-app" id="lotmix-app-root"></div>
    @endif
@endsection

@section('styles')
    <link href="{{ mix('css/lotmix.css') }}" rel="stylesheet">
    <link rel="stylesheet" href="{{asset('css/lotmix-homepage.css',true)}}">
@endsection

@section('scripts')
    <script src="https://maps.google.com/maps/api/js?key={{config('app.GOOGLE_MAPS_API_KEY')}}&libraries=places"></script>
    <script src="{{ mix('js/lotmix.js') }}"></script>
@endsection


