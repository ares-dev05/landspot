@if (Session::has('success'))
    @component('blog::admin.alerts.dismissible', ['type' => 'success'])
      {{ Session::get('success') }}
    @endcomponent
@endif

@if (Session::has('errors'))
    @component('blog::admin.alerts.dismissible', ['type' => 'danger'])
        @if ($errors->count() > 1)
            {{ $errors->count() . Illuminate\Support\Str::plural('error', $errors->count())}}
            <ul>
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        @else
            {{ $errors->first() }}
        @endif
    @endcomponent
@endif
