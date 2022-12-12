@extends('layouts.sso')

@section('styles')
    @include('auth.oauth.brand-colors')
@endsection

@section('content')
    <div class="container">
        <div class="row">
            <div class="auth-form col-xs-6 col-sm-6 col-sm-offset-1 col-md-6 col-md-offset-3 col-lg-6 col-lg-offset-3">
                <div class="panel panel-default">

                    @if (session('status'))
                        <div class="alert alert-warning col-md-12">
                            {!! session('status') !!}
                        </div>
                    @endif

                    <div class="panel-heading">
                        Log in to your account
                    </div>

                    <div class="panel-body">
                        <form id="user-login-form" class="form-horizontal" method="POST" action="{{ $formActionUrl ?? route('login', [], false) }}">
                            @include('auth.oauth.login-form')
                        </form>
                    </div>
                </div>

                @if($brand == 'landspot')
                    {{--<div class="get-started">
                        <span>Don&apos;t have an account?</span>
                        <a class="btn btn-link" href="{{config('app.url').route('register', [], false)}}">
                            Get Started
                        </a>
                    </div>--}}
                @endif
            </div>
        </div>
    </div>
@endsection

@section('body-scripts')
    <script src="{{ mix('js/app.js') }}"></script>
    <script src="{{ mix('js/shim.js') }}"></script>
@endsection