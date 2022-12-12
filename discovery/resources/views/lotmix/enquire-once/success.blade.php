@extends('lotmix.layouts.lotmix-with-nav')


@section('body-content')
    <div class="primary-container responsive-container">
        <div class="enquire-once">
            <div class="container-for-render">
                <div class="content">
                    <div class="success-image"></div>
                        <div>
                            <div class="main-heading">
                                Your enquiry has been <span>successfully submited!</span>
                            </div>
                        </div>
                        <a href="{{secure_url(route('homepage', [], false))}}" class="btn-step">Go to homepage</a>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('styles')
    <link href="{{ mix('css/lotmix-enquire-once.css') }}" rel="stylesheet">
@endsection