<table class="table table-striped table-sm table-responsive-md">
    <caption>{{ Illuminate\Support\Str::plural('Topic', $topics->total()) . ' ' . $topics->total()}}</caption>
    <thead>
    <tr>
        <th>Title</th>
        <th></th>
    </tr>
    </thead>
    <tbody>
    @foreach($topics as $topic)
        <tr>
            <td>{{ $topic->title }}</td>
            <td>
                <a href="{{ route('topics.edit', $topic, false) }}" class="btn btn-primary btn-sm">
                    <i class="fa fa-pencil" aria-hidden="true"></i>
                </a>

                <form action="{{ route('topics.destroy', $topic, false) }}"
                      data-confirm="Are you sure you want to delete this topic?"
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
    {{ $topics->links() }}
</div>
