<table class="table table-striped table-sm table-responsive-md">
    <caption>{{ Illuminate\Support\Str::plural('Post', $posts->total()) . ' ' . $posts->total()}}</caption>
    <thead>
    <tr>
        <th>Title</th>
        <th>Author</th>
        <th>Created at</th>
        <th></th>
    </tr>
    </thead>
    <tbody>
    @foreach($posts as $post)
        <tr>
            <td>{{ $post->title }}</td>
            <td>{{$post->user->display_name}}</td>
            <td>{{$post->created_at}}</td>
            <td>
                <a href="{{ route('posts.edit', $post, false) }}" class="btn btn-primary btn-sm">
                    <i class="fa fa-pencil" aria-hidden="true"></i>
                </a>

                <form action="{{ route('posts.destroy', $post, false) }}"
                      data-confirm="Are you sure you want to delete this article?"
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

<div class="d-flex justify-content-center">
    {{ $posts->links() }}
</div>
