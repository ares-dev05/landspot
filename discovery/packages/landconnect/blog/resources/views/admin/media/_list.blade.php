<table class="table table-striped table-sm table-responsive-md">
    <caption>{{ Illuminate\Support\Str::plural('Media file', $media->count()) . ' ' . $media->count()}}</caption>
    <thead>
        <tr>
            <th>Image</th>
            <th>Name</th>
            <th>URL</th>
            <th></th>
        </tr>
    </thead>
    <tbody>
        @foreach($media as $image)
            <tr>
                <td>
                    <a href="{{ $image->media->smallImage }}" target="_blank">
                        <img src="{{ $image->media->thumbImage }}" alt="{{ $image->media->name }}" width="100">
                    </a>
                </td>
                <td>{{ $image->media->name }}</td>
                <td>
                    <div class="input-group">
                        <input class="form-control" readonly=""
                               id="{{"image-{$image->media->id}"}}" type="text" value="{{$image->media->smallImage}}">
                        <div class="input-group-append">
                            <button class="input-group-text btn" data-clipboard-target="#image-{{ $image->media->id }}">
                                <i class="fa fa-clipboard"></i>
                            </button>
                        </div>
                    </div>
                </td>
                <td>
                    <a href="{{ $image->media->smallImage }}" title="Show" class="btn btn-primary btn-sm" target="_blank">
                        <i class="fa fa-eye" aria-hidden="true"></i>
                    </a>

                    <a href="{{ route('media.show', $image, false) }}" title="Download" class="btn btn-primary btn-sm">
                        <i class="fa fa-download" aria-hidden="true"></i>
                    </a>

                    <form action="{{ route('media.destroy', $image, false) }}"
                          data-confirm="Are you sure you want to delete this image?"
                          class="d-inline-block"
                          method="POST">
                        {{ method_field('DELETE') }}
                        {{ csrf_field() }}

                        <button class="btn btn-danger btn-sm" name="submit" type="submit">
                            <i class="fa fa-trash" aria-hidden="true"></i>
                        </button>
                    </form>
                </td>
            </tr>
        @endforeach
    </tbody>
</table>
