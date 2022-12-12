@extends('blog::admin.layouts.app')

@section('content')
    <h1>Add an image</h1>

    <form method="POST" action="{{ route('media.store', [], false) }}" enctype="multipart/form-data">
        {{ csrf_field() }}
        <div class="form-group">
            <label for="image">Image</label>
            <input accept="image/*" class="form-control" required="" name="image" type="file" id="image">

        </div>

        <div class="form-group">
            <label for="name">Name</label>
            <input class="form-control" name="name" type="text" id="name">

            @if ($errors->has('name'))
                <span class="help-block">
                    <strong>{{ $errors->first('name') }}</strong>
                </span>
            @endif
        </div>

        <a href="{{route('posts.index', [], false)}}" class="btn btn-secondary">Back</a>
        <input class="btn btn-primary btn-submit" type="submit" value="Save">
    </form>
@endsection
