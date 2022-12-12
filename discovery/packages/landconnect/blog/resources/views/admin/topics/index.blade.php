@extends('blog::admin.layouts.app')

@section('content')
    <div class="page-header d-flex justify-content-between">
      <h1>Topics</h1>
      <a href="{{ route('topics.create', [], false) }}" class="btn btn-primary btn-sm align-self-center">
        <i class="fa fa-plus-square" aria-hidden="true"></i> Add
      </a>
    </div>

    @include ('blog::admin.topics._list')
@endsection
