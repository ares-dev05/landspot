@extends('layouts.emails')

@section('header')
    @include('emails.landconnect-header')
@endsection

@section('content')

    <td class="content-cell">
        <p>Dear {{ $name }}</p>
        <p>An account has been created and you have been granted access to {{ $company }}.</p>

        <p>Use these credentials to log into your account:</p>
        <p>Email: {{ $email }}</p>
        <p>Password: {{ $password }}</p>

        <div class="btn-wrapper">
            <a href="{{ route('brand.login', compact('brand')) }}" class="button button-blue" target="_blank">Sign
                in</a>
        </div>

        <p>Regards, </p><br>
        <p>The {{ config('mail.from.name') }}</p>
        <p><a href="mailto:{{config('mail.from.address')}}">{{config('mail.from.address')}}</a></p>
    </td>

@endsection
