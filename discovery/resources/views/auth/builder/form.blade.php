<form class="form-horizontal" autocomplete="off" method="POST" action="{{ route('register', [], false) }}">
    {{ csrf_field() }}
    <input type="hidden" name="type" value="builder">
    @if ($errors->has('type'))
        <span class="help-block">
            <strong>{{ $errors->first('type') }}</strong>
        </span>
    @endif

    <div class="form-group{{ $errors->has('name') ? ' has-error' : '' }}">
        <input type="text" class="form-control" name="display_name"
               maxlength="50"
               value="{{ old('type') == 'builder' ? old('display_name') : '' }}" placeholder="Full name" required
               autofocus>

        @if ($errors->has('display_name'))
            <span class="help-block">
                    <strong>{{ $errors->first('display_name') }}</strong>
                </span>
        @endif
    </div>

    <div class="form-group{{ $errors->has('company_id') ? ' has-error' : '' }}">
        <div class="row">
            <div class="col-md-6 col-sm-4 col-xs-6">
                <input type="text" class="form-control" name="company_name"
                       maxlength="50"
                       value="{{ old('type') == 'builder' ? old('company_name') : '' }}" placeholder="Company name"
                       required
                       autofocus>

                @if ($errors->has('company_name'))
                    <span class="help-block">
                            <strong>{{ $errors->first('company_name') }}</strong>
                        </span>
                @endif
            </div>
            <div class="col-md-6 col-sm-4 col-xs-6">
                <div class="select-wrapper">
                    <select type="text" class="form-control select-filter" name="state_id" required autofocus>
                        <option value="" disabled selected>State</option>
                        @foreach($states as $state)
                            <option value={{$state->id}} {{ old('state_id') == $state->id ? 'selected' : '' }}>{{$state->name}}</option>
                        @endforeach
                    </select>

                    @if ($errors->has('state_id'))
                        <span class="help-block">
                            <strong>{{ $errors->first('state_id') }}</strong>
                        </span>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <div class="form-group{{ $errors->has('email') ? ' has-error' : '' }}">
        <div class="row">
            <div class="col-md-6 col-sm-4 col-xs-6">
                <input type="email" class="form-control" name="email"
                       maxlength="150"
                       value="{{ old('type') == 'builder' ? old('email') : '' }}" placeholder="E-mail address" required>

                @if ($errors->has('email'))
                    <span class="help-block">
                    <strong>{{ $errors->first('email') }}</strong>
                </span>
                @endif
            </div>
            <div class="col-md-6 col-sm-4 col-xs-6">
                <input type="text" class="form-control" name="phone"
                       maxlength="20"
                       autocomplete="off"
                       value="{{ old('type') == 'builder' ? old('phone') : '' }}" placeholder="Phone number">

                @if ($errors->has('phone'))
                    <span class="help-block">
                    <strong>{{ $errors->first('phone') }}</strong>
                </span>
                @endif
            </div>
        </div>
    </div>

    <div class="form-group{{ $errors->has('password') ? ' has-error' : '' }}">
        <div class="row">
            <div class="col-md-6 col-sm-4 col-xs-6">
                <input id="password" type="password" class="form-control" placeholder="Password" name="password"
                       maxlength="32"
                       autocomplete="off"
                       required>

                @if ($errors->has('password'))
                    <span class="help-block">
                    <strong>{{ $errors->first('password') }}</strong>
                </span>
                @endif
            </div>
            <div class="col-md-6 col-sm-4 col-xs-6">
                <input id="password-confirm" type="password" class="form-control" placeholder="Confirm Password"
                       maxlength="32"
                       name="password_confirmation" required>
            </div>
        </div>
    </div>

    {{--<div class="form-group">--}}
        {{--<div class="checkbox">--}}
            {{--<label>--}}
                {{--I've read and agree to the <a href="{{route('terms-of-use', [], false)}}" target="_blank">Terms of Use</a>--}}
                {{--<input type="checkbox" name="terms" {{ old('terms') ? 'checked' : '' }} required>--}}
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
