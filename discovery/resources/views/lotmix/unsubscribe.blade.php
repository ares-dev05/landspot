@extends('lotmix.layouts.lotmix-with-nav')
@section('body-content')
    <div class="primary-container responsive-container">
        <section class="unsubscribe">
            <h1>Are you sure you want to unsubscribe?</h1>
            <img src="{{ asset('/images/lotmix/unsubscribeicon.svg',true)}}" alt="unsubscribe image">
            <form action="{{ secure_url(route('unsubscribe',compact('hash')))}}" method="post">
                @csrf
                <button class="button primary">Yes, unsubscribe me</button>
            </form>
        </section>
    </div>
@endsection
@section('styles')
    <link href="{{ mix('css/lotmix-insights.css') }}" rel="stylesheet">
@endsection
