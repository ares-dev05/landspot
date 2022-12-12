@extends('layouts.lotmix-email')

@section('content')

    <td class="content-cell">
        <div class="white-wrapper">
            <img alt="I'm an image"
                 class="main-image"
                 src="{{$message->embed(public_path() . '/images/lotmix/welcome_4.png')}}"
                 title="Lotmix main image"
                 width="500">
        </div>
        <div class="white-wrapper">
            <h1 class="welcome-text">Time is running out.</h1>
            <p>Dear <b>{{ $user->display_name }},</b></p>
            <p>Time is running out before your Lotmix.com.au invites expires.</p>
            <p>If you are planning on building a new home, Lotmix.com.au will help you navigate your home building journey.</p>
            <p>To claim your invite from <b>{{ $company->name }}</b></p>
            <br>
            <div class="btn-wrapper">
                @if(isset($invitationToken))
                    <a href="{{ route('register-invite', ['token' => $invitationToken]) }}"
                       class="button button-green"
                       target="_blank">Accept your invite
                        now</a>
                @else
                    <a href="{{ route('lotmix-login') }}" class="button button-green" target="_blank">Accept
                        your invite
                        now</a>
                @endif
            </div>

            <br>
        </div>
    </td>

@endsection
@section('feature-header')
Once you have signed up you can
@endsection
@section('header')
    <td class="header">
        <div class="header-wrapper">
            <img src="{{$company->company_logo ?? $message->embed(public_path() . '/images/Lmix_logo.png')}}"
                 class="lotmix-header-logo"
                 alt="Lotmix"
                 height="100">
            <a href="{{ config('app.LOTMIX_URL') }}">LOTMIX INVITATION</a>
        </div>
    </td>
@endsection