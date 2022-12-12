@if ($post->hasThumb())
    <img src="{{$post->thumb->media->thumbImage}}" class="img-thumbnail" width="350" alt="{{$post->thumb->media->name}}">

    <form method="POST" action="{{route('posts_thumb.destroy', $post, false)}}" accept-charset="UTF-8"
          data-confirm="Are you sure you want to delete the image?">

        {{ method_field('DELETE') }}
        {{ csrf_field() }}
        <button class="btn btn-link text-danger" name="submit" type="submit"><i class="fa fa-trash" aria-hidden="true"></i> Delete the picture</button>
    </form>
@endif
