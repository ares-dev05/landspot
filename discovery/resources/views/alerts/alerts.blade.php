@if (session()->has('success'))
    @component('alerts.dismissible', ['type' => 'success'])
        {{ session()->get('success') }}
    @endcomponent
@endif

@if (session()->has('errors'))
    @component('alerts.dismissible', ['type' => 'danger'])
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
