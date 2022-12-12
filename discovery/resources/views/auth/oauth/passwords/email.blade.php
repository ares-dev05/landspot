@extends('layouts.sso')

@section('styles')
    @include('auth.oauth.brand-colors')
@endsection

@section('content')
<div class="container">
    <div class="row">
        <div class="auth-form col-xs-6 col-sm-6 col-sm-offset-1 col-md-6 col-md-offset-3 col-lg-6 col-lg-offset-3">
            <div class="panel panel-default">
                <div class="panel-heading">Reset Password</div>

                <div class="panel-body">
                    @if (session('status'))
                        <div class="alert alert-success">
                            {{ session('status') }}
                        </div>
                    @endif

                    <form class="form-horizontal" method="POST" action="{{ route('password.email', [], false) }}">
                        {{ csrf_field() }}
                        <p>
                            Please enter your email address.<br>
                            A link with instructions to reset your password will be emailed to you. If you do not receive it email
                            <br>
                            <a href="mailto:support@landconnect.com.au">support@landconnect.com.au</a><br>
                            for assistance.
                        </p>

                        <div class="form-group{{ $errors->has('email') ? ' has-error' : '' }}">
                            <div class="col-md-10 col-xs-10 col-md-offset-1 col-xs-offset-1">
                                <input id="email" type="email" class="form-control" placeholder="E-mail address" name="email" value="{{ old('email') }}" required>

                                @if ($errors->has('email'))
                                    <span class="help-block">
                                        <strong>{{ $errors->first('email') }}</strong>
                                    </span>
                                @endif
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="reset-password">
                                <button type="submit" class="btn btn-primary">
                                    Send Link
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
