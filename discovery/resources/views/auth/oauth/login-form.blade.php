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
    @isset($brand)
        <a class="btn btn-link" rel="nofollow" href="{{ route('brand.password.request', ['brand' => $brand], false) }}">
            Forgot your Password?
        </a>
    @else
        <a class="btn btn-link" rel="nofollow" href="{{ route('password.request', [], false) }}">
            Forgot your Password?
        </a>
    @endif
</div>

<div class="form-group">
    <button type="submit" class="btn btn-primary">
        Log in
    </button>
</div>