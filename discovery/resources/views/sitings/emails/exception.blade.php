@extends('sitings.layouts.emails')

@section('content')
    <td class="content-cell">
        <h2>A new exception has been caught.</h2>

        @php
            \ExceptionHelper::dumpException($exception);
        @endphp

        <p>Regards, <br>
            The {{ config('mail.from.name') }} Team</p>

    </td>

@endsection
