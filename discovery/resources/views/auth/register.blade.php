@extends('layouts.landspot')

@section('meta')
    <meta name="robots" content="noindex, nofollow" />
@endsection

@section('styles')
    <link href="{{ mix('css/landspot-login.css') }}" rel="stylesheet">
@endsection

@section('content')
    <div class="container">
        <div class="row">
            <div class="col-lg-4 col-md-4 col-sm-8 col-xs-6 text-left">
                <div class="panel panel-default sidebar">
                    <div class="panel-heading">
                        <div class="text-left">Enquire now</div>
                    </div>

                    <div class="panel-body">
                        <div class="tab-content">
                            <div class="builder tab-pane fade {{ !old('type') && $type == 'builder' || old('type') == 'builder' ? "in active" : ''}}">
                                <div class="text-left">
                                    @include('auth.builder.sidebar')
                                </div>
                            </div>
                            <div class="developer tab-pane fade {{ $type == 'developer' || old('type') == 'developer' ? "in active" : ''}}">
                                <div class="text-left">
                                    @include('auth.developer.sidebar')
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-7 col-lg-offset-1 col-md-8 col-sm-8 col-xs-6">
                <div class="panel panel-default">
                    <div class="panel-heading">
                        <div>
                            <ul class="nav nav-tabs">
                                <li class={{ !old('type') && $type == 'builder' || old('type') == 'builder' ? "active" : ''}}><a data-toggle="tab" data-tab=".builder" href="#">Builder</a></li>
                                <li class={{ $type == 'developer' || old('type') == 'developer' ? "active" : ''}}><a data-toggle="tab" data-tab=".developer" href="#">Developer</a></li>
                            </ul>
                        </div>
                    </div>

                    <div class="panel-body">
                        <div class="tab-content">
                            <div class="builder tab-pane fade {{ !old('type') && $type == 'builder' || old('type') == 'builder' ? "in active" : ''}}">
                                <div>
                                    @include('auth.builder.form')
                                </div>
                            </div>
                            <div class="developer tab-pane fade {{ $type == 'developer' || old('type') == 'developer' ? "in active" : ''}}">
                                <div>
                                    @include('auth.developer.form')
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('body-scripts')
    <script src="{{ mix('js/app.js') }}"></script>
@endsection
