@extends('blog::admin.layouts.app')

@section('content')
    <h1>Create Post</h1>

    <form method="POST" action="{{ route('posts.store', [], false) }}">
        {{ csrf_field() }}
        @include('blog::admin.posts._form')

        <a href="{{route('posts.index', [], false)}}" class="btn btn-secondary">Back</a>
        <input class="btn btn-primary btn-submit" type="submit" value="Save">
    </form>

@endsection
