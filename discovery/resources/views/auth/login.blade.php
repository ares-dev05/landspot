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
                        <form class="form-horizontal" method="POST" action="{{ route('login', [], false) }}">
                            {{ csrf_field() }}

                            <div class="form-group{{ $errors->has('email') ? ' has-error' : '' }}">
                                <input id="email" type="email" class="form-control" placeholder="E-mail address"
                                       name="email" value="{{ old('email') }}" required autofocus>

                                @if ($errors->has('email'))
                                    <span class="help-block">
                                    <strong>{{ $errors->first('email') }}</strong>
                                </span>
                                @endif
                            </div>

                            <div class="form-group{{ $errors->has('password') ? ' has-error' : '' }}">
                                <input id="password" type="password" class="form-control" placeholder="Password"
                                       name="password" required>

                                @if ($errors->has('password'))
                                    <span class="help-block">
                                        <strong>{{ $errors->first('password') }}</strong>
                                    </span>
                                @endif
                            </div>


                            @if($errors->has('show_recaptcha') || $errors->has('g-recaptcha-response'))
                                <div class="form-group">
                                    {!! Recaptcha::render() !!}
                                    @if($errors->has('g-recaptcha-response'))
                                        <span class="help-block">
                                            <strong>Please pass the test</strong>
                                        </span>
                                    @endif
                                </div>
                            @endif

                            <div class="form-group">
                                <a class="btn btn-link" rel="nofollow" href="{{ route('password.request', [], false) }}">
                                    Forgot your Password?
                                </a>
                            </div>

                            <div class="form-group">
                                <button type="submit" class="btn btn-primary">
                                    Log in
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {{--<div class="get-started">
                    <span>Don&apos;t have an account?</span>
                    <a class="btn btn-link" href="{{ route('register', [], false) }}">
                        Get Started
                    </a>
                </div>--}}
            </div>
        </div>
    </div>
@endsection
