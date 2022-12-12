@extends('layouts.emails')

@section('header')
    <a href="{{ config('app.LOTMIX_URL') }}">
        <img src="{{ $message->embed(public_path() . '/images/landconnect-logo.png') }}"
             alt={{ 'Lotmix' }} height="35">
    </a>
@endsection

@section('content')

    <td class="content-cell">
        <p>Dear {{ $user->display_name }}</p>
        <p>{{ $msg }}</p>

        <p>
            Client name: {{ $invitedUser->display_name }}
        </p>

        <div class="btn-wrapper">
            <a href="{{ route('login') }}" class="button button-blue" target="_blank">Sign in</a>
        </div>

        <p>Regards, <br>
            Landconnect</p>
    </td>

@endsection
