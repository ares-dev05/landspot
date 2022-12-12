@extends('blog::admin.layouts.app')

@section('content')
    <h1>Create Topic</h1>

    <form method="POST" action="{{ route('topics.store', [], false) }}">
        {{ csrf_field() }}
        <div class="form-group{{ $errors->has('title') ? ' has-error' : '' }}">
            <label for="title">Title</label>
            <input class="form-control" placeholder="Title" value="{{ old('title') }}"
                   maxlength="64"
                   required="" name="title"
                   type="text" id="title">
            @if ($errors->has('title'))
                <span class="help-block">
                    <strong>{{ $errors->first('title') }}</strong>
                </span>
            @endif
        </div>

        <a href="{{route('topics.index', [], false)}}" class="btn btn-secondary">Back</a>
        <input class="btn btn-primary btn-submit" type="submit" value="Save">
    </form>

@endsection
