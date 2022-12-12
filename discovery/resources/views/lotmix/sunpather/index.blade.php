@extends('lotmix.layouts.lotmix-with-nav')

@section('body-content')
    @if(isset($_SERVER['HTTP_USER_AGENT'])
        && preg_match('~MSIE|Internet Explorer~i', $_SERVER['HTTP_USER_AGENT'])
        || preg_match('~Trident/7.0(; Touch)?; rv:11.0~',$_SERVER['HTTP_USER_AGENT']))
        <h1 style="color:#009381;font-family: Montserrat, sans-serif; text-align: center;">To Login to your <a
                    style="color: #035b43; text-decoration: underline;"
                    href="{{config('app.LOTMIX_URL')}}">{{config('app.LOTMIX_URL')}}</a> account please use Google
            Chrome, Mozilla Firefox or Microsoft Edge.
            <br>Your browser is out of date. </h1>
    @else
        <div class="lotmix-sunpather" id="lotmix-sunpather"></div>
    @endif
@endsection

@section('styles')
    <link href="{{ mix('/css/public-estate.css') }}" rel="stylesheet">
@endsection

@section('scripts')
    <script src="{{ mix('js/lotmix-sunpather.js') }}"></script>
@endsection