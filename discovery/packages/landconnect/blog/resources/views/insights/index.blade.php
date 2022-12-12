@extends('blog::insights.layouts.app')

@section('styles')
    <link href="{{ mix('insights/css/blog.css') }}" rel="stylesheet">

    @include('blog::insights.branding.styles')
@endsection

@section('content')
    <div id="blog"></div>
@endsection

@section('body-scripts')
    <script src="https://use.fontawesome.com/0dcb768cc0.js"></script>
    <script src="{{ secure_url(mix('/insights/js/blog.js')) }}"></script>
@endsection
