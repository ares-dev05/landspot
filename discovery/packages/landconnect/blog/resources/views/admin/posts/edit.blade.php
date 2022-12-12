@extends('blog::admin.layouts.app')
@php
    $postUrl = $post['is_blog'] ? "/blog/{$post['slug']}" : str_replace(['api/', '/post'], '', route('post.show', $post, false))
@endphp
@section('content')
    <p>Show post : <a href={{ $postUrl }} target="_blank">{{ $postUrl }}</a></p>

    @include('blog::admin.posts._thumbnail')

    <form method="POST" action="{{route('posts.update', $post, false)}}">
        {{ csrf_field() }}
        {{ method_field('PUT') }}
        @include('blog::admin.posts._form')

        <div class="pull-left">
            <a href="{{route('posts.index', [], false)}}" class="btn btn-secondary">Back</a>
            <input class="btn btn-primary btn-submit" type="submit" value="Update">
        </div>
    </form>

    <form method="POST" action="{{route('posts.destroy', $post, false)}}" class="form-inline pull-right"
          accept-charset="UTF-8"
          data-confirm="Are you sure you want to delete this article?">
        {{ method_field('DELETE') }}
        {{ csrf_field() }}
        <button class="btn btn-link text-danger" name="submit" type="submit">
            <i class="fa fa-trash" aria-hidden="true"></i> Delete
        </button>
    </form>
@endsection
