@php
    $title = old('title') ?? (isset($post) ? $post->title : null);
    $description = old('description') ?? (isset($post) ? $post->description : null);
    $topicId = old('topic_id') ?? (isset($post) ? $post->topic_id : null);
    $thumbId = old('thumb_id') ?? (isset($post) ? $post->thumb_id : null);
    $content = old('content') ?? (isset($post) ? $post->content : null);
    $blogFlag = old('is_blog') ?? (isset($post) ? $post->is_blog : null);
@endphp

<div class="form-group{{ $errors->has('title') ? ' has-error' : '' }}">
    <label for="title">Title</label>
    <input class="form-control" placeholder="Title" value="{{ $title }}"
           maxlength="155"
           required="" name="title"
           type="text" id="title">
    @if ($errors->has('title'))
        <span class="help-block">
            <strong>{{ $errors->first('title') }}</strong>
        </span>
    @endif
</div>

<div class="form-group{{ $errors->has('description') ? ' has-error' : '' }}">
    <label for="title">Description</label>
    <input class="form-control" placeholder="Title"
           value="{{ $description }}"
           required="" name="description"
           maxlength="255"
           type="text" id="description">
    @if ($errors->has('description'))
        <span class="help-block">
            <strong>{{ $errors->first('description') }}</strong>
        </span>
    @endif
</div>
<div class="form-group{{ $errors->has('topic_id') ? ' has-error' : '' }}">
    <label for="topic_id">Topic</label>
    <select class="form-control"
            id="topic_id"
            required
            name="topic_id">
        <option selected="selected" value="">Choose a topic</option>
        @foreach($topics as $topic)
            <option value="{{ $topic->id }}" {{$topicId == $topic->id ? 'selected' : ''}}>{{ $topic->title }}</option>
        @endforeach
    </select>
    @if ($errors->has('topic_id'))
        <span class="help-block">
            <strong>{{ $errors->first('topic_id') }}</strong>
        </span>
    @endif
</div>

<div class="form-group{{ $errors->has('thumb_id') ? ' has-error' : '' }}">
    <label for="thumb_id">Thumbnail image</label>
    <select class="form-control"
            id="thumb_id"
            name="thumb_id">
        <option selected="selected" value="">Choose a thumbnail</option>
        @foreach($media as $thumb)
            <option value="{{ $thumb->id }}" {{$thumbId == $thumb->id ? 'selected' : ''}}>{{ $thumb->media->name }}</option>
        @endforeach
    </select>
    @if ($errors->has('thumb_id'))
        <span class="help-block">
            <strong>{{ $errors->first('thumb_id') }}</strong>
        </span>
    @endif
</div>

<div class="form-check">
    <input type="checkbox" class="form-check-input" id="blog" name="is_blog" {{$blogFlag ? 'checked' : ''}} value="1">
    <label class="form-check-label" for="blog">Blog Post</label>
</div>


<div class="form-group{{ $errors->has('content') ? ' has-error' : '' }} position-relative">
    <label for="content">Content</label>

    <textarea class="form-control"
              required="required"
              name="content" cols="50" rows="10"
              id="content">{{$content}}</textarea>

    @if ($errors->has('content'))
        <span class="help-block">
            <strong>{{ $errors->first('content') }}</strong>
        </span>
    @endif
</div>
