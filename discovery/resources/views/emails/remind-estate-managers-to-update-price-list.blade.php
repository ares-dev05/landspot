@extends('layouts.emails')

@section('header')
    @include('emails.landspot-header')
@endsection

@section('content')

    <td class="content-cell">
        <p>Hi There,</p>

        <p>Builders are looking at your land list on Landspot. Is it currently up to date?</p>
        <p>Login now to check and make sure it’s accurate!</p>

        <div class="btn-wrapper">
            <a href="{{ route('login') }}" class="button button-blue" target="_blank">Login</a>
        </div>

        <p>Regards, <br>
            The {{ config('mail.from.name') }} Team</p>
    </td>

@endsection
