@extends('layouts.emails')

@section('header')
    @include('emails.landspot-header')
@endsection

@section('content')

    <td class="content-cell">
        <p>Hi There,</p>
        <p>You have messages in live chat awaiting your response.</p>
        <p><a href="{{ route('login') }}" class="button button-blue" target="_blank">Login</a></p>
        <p>Regards, <br>
            The {{ config('mail.from.name') }} Team</p>
    </td>

@endsection
