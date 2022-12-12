@extends('lotmix.layouts.lotmix', [
    'title' => 'Lotmix Login',
    'description' => 'Lotmix is one platform for new home buyers to effortlessly navigate and managing purchasing house and land in Australia. Login to access your account.'
])

@section('meta')
    <meta name="robots" content="noindex, nofollow"/>
@endsection

@section('styles')
    <link href="{{ mix('css/lotmix.css') }}" rel="stylesheet">
    <link href="{{ mix('css/bootstrap-alert.css') }}" rel="stylesheet">
@endsection

@section('content')
    <div class="primary-container responsive-container login-container login">
        <nav class="app-nav" role="navigation">
            <div class="nav-header">
                <a class="active logo" href="/" title="Lotmix"></a>
            </div>
        </nav>
        <div id="modals-root">
            <div class="landspot-modal">
                <div class="popupmodal-body">
                    <div class="lotmix-signup">
                        @if (session('status'))
                            <div class="alert alert-warning">
                                {!! session('status') !!}
                            </div>
                        @endif
                        <h1>Login to your account</h1>

                        <form class="auth-form" method="POST"
                              action="{{ route('lotmix-login', [], false) }}">
                            {{ csrf_field() }}
                            <div class="form-rows">
                                <div class="form-row column">
                                    <div class='landspot-input{{ $errors->has('email') ? ' has-error' : '' }}'>
                                        <input type="email"
                                               name="email"
                                               autoComplete="off"
                                               required
                                               autofocus
                                               placeholder="E-mail address"
                                               maxLength="155"
                                               value="{{ old('email') }}"
                                        />

                                        @if ($errors->has('email'))
                                            <span class="help-block">
                                                {{ $errors->first('email') }}
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
                                                {{ $errors->first('password') }}
                                            </span>
                                        @endif
                                    </div>
                                </div>

                                @if($errors->has('show_recaptcha') || $errors->has('g-recaptcha-response'))
                                    <div class="form-row">
                                        {!! Recaptcha::render() !!}
                                        @if($errors->has('g-recaptcha-response'))
                                            <span class="help-block">
                                                Please pass the test
                                            </span>
                                        @endif
                                    </div>
                                @endif

                                <div class="form-row forgot-password-row">
                                    <a class="forgot-password" rel="nofollow" href="{{ route('password.request', [], false) }}">
                                        Having trouble logging in? Click to reset your password
                                    </a>
                                </div>
                            </div>

                            <button type="submit" class="button primary">
                                Login
                            </button>

{{--                            <div class="social-auth">--}}
{{--                                <p class="heading">OR LOGIN WITH</p>--}}
{{--                                <div class="social-buttons">--}}
{{--                                    <a href="{{ route('lotmix-social-login', ['provider' => 'google'], false) }}"--}}
{{--                                       class="google-button"><i class="landspot-icon google"></i>Sign in with Google</a>--}}
{{--                                    <a href="{{ route('lotmix-social-login', ['provider' => 'facebook'], false) }}"--}}
{{--                                       class="facebook-button"><i class="landspot-icon facebook"></i>Continue with Facebook</a>--}}
{{--                                </div>--}}
{{--                            </div>--}}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('body-scripts')
    <script src="{{ mix('js/app.js') }}"></script>
@endsection
