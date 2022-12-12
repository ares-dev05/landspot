@extends('layouts.emails')

@section('header')
    @include('emails.landspot-header')
@endsection

@section('content')

    <td class="content-cell">
        <p>Dear {{ $name }}</p>
        <p>Someone has invited you to access the {{ $company }}.</p>

        <p>Use these logon credentials:</p>
        <p>Email: {{ $email }}</p>
        <p>Password: {{ $password }}</p>

        <div class="btn-wrapper">
            <a href="{{ route('login') }}" class="button button-blue" target="_blank">Sign in</a>
        </div>

        <p>Regards, <br>
            The {{ config('mail.from.name') }} Team</p>

    </td>

@endsection
