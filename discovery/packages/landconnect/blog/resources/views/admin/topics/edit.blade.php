@extends('blog::admin.layouts.app')
@php
    $title = old('title') ?? (isset($topic) ? $topic->title : null);
@endphp
@section('content')
    <form method="POST" action="{{route('topics.update', $topic, false)}}" enctype='multipart/form-data' >
        {{ csrf_field() }}
        {{ method_field('PUT') }}

        <div class="form-group{{ $errors->has('title') ? ' has-error' : '' }}">
            <label for="title">Title</label>
            <input class="form-control" placeholder="Title" value="{{ $title }}"
                   maxlength="64"
                   required="" name="title"
                   type="text" id="title">
            @if ($errors->has('title'))
                <span class="help-block">
                    <strong>{{ $errors->first('title') }}</strong>
                </span>
            @endif
        </div>

        <div class="pull-left">
            <a href="{{route('topics.index', [], false)}}" class="btn btn-secondary">Back</a>
            <input class="btn btn-primary btn-submit" type="submit" value="Update">
        </div>
    </form>

    <form method="POST" action="{{route('topics.destroy', $topic, false)}}"class="form-inline pull-right"
          accept-charset="UTF-8"
          data-confirm="Are you sure you want to delete this article?">
        {{ method_field('DELETE') }}
        {{ csrf_field() }}
        <button class="btn btn-link text-danger" name="submit" type="submit">
            <i class="fa fa-trash" aria-hidden="true"></i> Delete
        </button>
    </form>
@endsection
