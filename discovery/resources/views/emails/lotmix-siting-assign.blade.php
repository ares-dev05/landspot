@extends('layouts.emails')

@section('header')
    <a href="{{ config('app.LOTMIX_URL') }}">
        <img src="{{ $message->embed(public_path() . '/images/Lmix_logo.png') }}"
             class="lotmix-logo"
             alt="{{ 'Lotmix' }}"
             height="35">
    </a>
@endsection

@section('content')

    <td class="content-cell">
        <p>Hi <b>{{ $user->display_name }},</b></p>
        <p>A new floorplan siting has been uploaded to your Lotmix account by {{ $authUser->display_name }}</p>
        <p>Please login to check:</p>
        <div class="btn-wrapper">
            <a href="{{ route('lotmix-login') }}" class="button button-green" target="_blank">Login</a>
        </div>

        <p>Regards, <br>
            The {{ config('mail.from.lotmix_name') }} Team</p>

    </td>

@endsection
@section('right')
    &copy; Landconnect Global Pty Ltd. All rights reserved. - {{ date('Y') }}
@endsection