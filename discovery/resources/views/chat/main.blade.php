@extends('layouts.chat')

@section('head-scripts')
@endsection

@section('styles')
    <link rel="stylesheet" href="{{ mix('css/landspot-main.css') }}">
@endsection

@section('content')
    <div id="landspot-chat"></div>
@endsection

@section('body-scripts')
    <script src="{{ mix('js/app.js') }}"></script>
@endsection