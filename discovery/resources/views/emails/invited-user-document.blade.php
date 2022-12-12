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
        <p>Hi {{$invitedUser->first_name}} {{$invitedUser->last_name}},</p>
        <p>New information has been uploaded to your Lotmix account by {{$user->company->name}}.</p>

        <p>Please login to check:</p>
        <div class="btn-wrapper">
            @if($invitationToken)
                <a href="{{ route('register-invite', ['token' => $invitationToken]) }}"
                   class="button button-green"
                   target="_blank">Accept your invite
                    now</a>
            @else
                <a href="{{ route('lotmix-login') }}" class="button button-green" target="_blank">Login</a>
            @endif
        </div>

        <p>Regards, <br>
            {{ config('app.LOTMIX_URL') }}</p>
    </td>

    @endsection
    @section('right')
    &copy; Landconnect Global Pty Ltd. All rights reserved. - {{ date('Y') }}
@endsection