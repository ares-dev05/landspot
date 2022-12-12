@extends('lotmix.layouts.lotmix')

@section('meta')
    <meta name="robots" content="noindex, nofollow"/>
@endsection

@section('styles')
    <link href="{{ mix('css/lotmix.css') }}" rel="stylesheet">
    <link href="{{ mix('css/bootstrap-alert.css') }}" rel="stylesheet">
@endsection

@section('content')
<div class="primary-container responsive-container login-container login">
    <div id="modals-root" class="sign-up-modal login">
        <div class="landspot-modal">
            <a class="logo" href="/" title="Lotmix"></a>
            <div class="popupmodal-body">
                <div class="lotmix-signup">
                    @if (session('status'))
                        <div class="alert alert-warning">
                            {!! session('status') !!}
                        </div>
                    @endif
                    <h1>Reset Password</h1>

                    <form class="auth-form" method="POST"
                          action="{{ route('password.request', [], false) }}">
                        {{ csrf_field() }}

                        <input type="hidden" name="token" value="{{ $token }}">
                        <div class="form-rows">
                            <div class="form-row column">
                                <div class='landspot-input{{ $errors->has('email') ? ' has-error' : '' }}'>
                                    <input type="email"
                                           name="email"
                                           autoComplete="off"
                                           required
                                           autofocus
                                           placeholder="E-mail address"
                                           maxLength={155}
                                           value="{{ $email ?: old('email') }}"
                                    />

                                    @if ($errors->has('email'))
                                        <span class="help-block">
                                        <strong>{{ $errors->first('email') }}</strong>
                                    </span>
                                    @endif
                                </div>
                            </div>

                            <div class="form-row column">
                                <div class='landspot-input {{ $errors->has('password') ? ' has-error' : '' }}'>
                                    <input type="password"
                                           autoComplete="off"
                                           placeholder="Password"
                                           name="password"
                                           required
                                           maxlength="50"
                                    />

                                    @if ($errors->has('password'))
                                        <span class="help-block">
                                        <strong>{{ $errors->first('password') }}</strong>
                                    </span>
                                    @endif
                                </div>
                            </div>

                            <div class="form-row column">
                                <div class='landspot-input {{ $errors->has('password_confirmation') ? ' has-error' : '' }}'>
                                    <input type="password"
                                           autoComplete="off"
                                           placeholder="Confirm Password"
                                           name="password_confirmation"
                                           required
                                           maxlength="50"
                                    />

                                    @if ($errors->has('password_confirmation'))
                                        <span class="help-block">
                                        <strong>{{ $errors->first('password_confirmation') }}</strong>
                                    </span>
                                    @endif
                                </div>
                            </div>

                            @if($errors->has('show_recaptcha') || $errors->has('g-recaptcha-response'))
                                <div class="form-row">
                                    {!! Recaptcha::render() !!}
                                    @if($errors->has('g-recaptcha-response'))
                                        <span class="help-block">
                                        <strong>Please pass the test</strong>
                                    </span>
                                    @endif
                                </div>
                            @endif
                        </div>

                        <button type="submit" class="button primary">
                            Reset Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
