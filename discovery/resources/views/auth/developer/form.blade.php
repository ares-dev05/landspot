<form class="form-horizontal" method="POST" action="{{ route('register', [], false) }}">
    {{ csrf_field() }}
    <input type="hidden" name="type" value="developer">
    @if ($errors->has('type'))
        <span class="help-block">
            <strong>{{ $errors->first('type') }}</strong>
        </span>
    @endif

    <div class="form-group{{ $errors->has('name') ? ' has-error' : '' }}">
        <input type="text" class="form-control" name="display_name"
               value="{{ old('type') == 'developer' ? old('display_name') : '' }}" placeholder="Full name" required
               autofocus>

        @if ($errors->has('display_name'))
            <span class="help-block">
                    <strong>{{ $errors->first('display_name') }}</strong>
                </span>
        @endif
    </div>

    <div class="form-group{{ $errors->has('email') ? ' has-error' : '' }}">
        <div class="row">
            <div class="col-md-6 col-sm-4 col-xs-6">
                <input type="email" class="form-control" name="email"
                       autocomplete="off"
                       value="{{ old('type') == 'developer' ? old('email') : '' }}" placeholder="E-mail address"
                       required>

                @if ($errors->has('email'))
                    <span class="help-block">
                    <strong>{{ $errors->first('email') }}</strong>
                </span>
                @endif
            </div>
            <div class="col-md-6 col-sm-4 col-xs-6">
                <input type="text" class="form-control" name="phone"
                       value="{{ old('type') == 'developer' ? old('phone') : '' }}" placeholder="Phone number">

                @if ($errors->has('phone'))
                    <span class="help-block">
                    <strong>{{ $errors->first('phone') }}</strong>
                </span>
                @endif
            </div>
        </div>
    </div>

    <div class="row"><h5 class="col-md-12 col-sm-8 col-xs-6">Estate details</h5></div>

    <div class="form-group{{ $errors->has('estate_name') ? ' has-error' : '' }}">
        <div class="row">
            <div class="col-md-6 col-sm-4 col-xs-6">
                <input type="text" class="form-control" name="estate_name"
                       value="{{ old('type') == 'developer' ? old('estate_name') : '' }}" placeholder="Estate name"
                       required>

                @if ($errors->has('estate_name'))
                    <span class="help-block">
                    <strong>{{ $errors->first('estate_name') }}</strong>
                </span>
                @endif
            </div>
            <div class="col-md-6 col-sm-4 col-xs-6">
                <input type="text" class="form-control" name="website"
                       value="{{ old('type') == 'developer' ? old('website') : '' }}" placeholder="Estate website"
                       required>

                @if ($errors->has('website'))
                    <span class="help-block">
                    <strong>{{ $errors->first('website') }}</strong>
                </span>
                @endif
            </div>
        </div>
    </div>

    <div class="form-group{{ $errors->has('address') ? ' has-error' : '' }}">
        <input type="text" class="form-control" name="address"
               value="{{ old('type') == 'developer' ? old('address') : '' }}" placeholder="Estate location" required>

        @if ($errors->has('address'))
            <span class="help-block">
                    <strong>{{ $errors->first('address') }}</strong>
                </span>
        @endif
    </div>

    {{--<div class="form-group">--}}
        {{--<div class="checkbox">--}}
            {{--<label>--}}
                {{--I've read and agree to the <a href="{{route('terms-of-use', [], false)}}" target="_blank">Terms of Use</a>--}}
                {{--<input type="checkbox" name="terms"--}}
                       {{--{{ old('type') == 'developer' && old('terms') ? 'checked' : '' }} required>--}}
                {{--<span class="checkmark"></span>--}}
            {{--</label>--}}
        {{--</div>--}}

        {{--@if ($errors->has('terms'))--}}
            {{--<span class="help-block">--}}
                    {{--<strong>{{ $errors->first('terms') }}</strong>--}}
                {{--</span>--}}
        {{--@endif--}}
    {{--</div>--}}

    <div class="form-group">
        <div class="btn-register">
            <button type="submit" class="btn btn-primary">
                Enquire
            </button>
        </div>
    </div>
</form>
