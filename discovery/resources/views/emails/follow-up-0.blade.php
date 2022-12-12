@extends('layouts.lotmix-email')

@section('content')

    <td class="content-cell">
        <div class="white-wrapper">
            <img alt="I'm an image"
                 class="main-image"
                 src="{{$message->embed(public_path() . '/images/lotmix/Welcome_2_1.png')}}"
                 title="Lotmix main image"
                 width="608">
        </div>
        <div class="white-wrapper">
            <h1 class="welcome-text">Your Lotmix invite is waiting for you.</h1>
            <p>Dear <b>{{ $user->display_name }},</b></p>
            <p>Your invite from <b>{{ $company->name }}</b> still awaits!</p>
            <p>Make your home building journey simple with Lotmix</p>
            <p>To claim your invite from <b>{{ $company->name }}</b></p>
            <br>
            <div class="btn-wrapper">
                @if(isset($invitationToken))
                    <a href="{{ route('register-invite', ['token' => $invitationToken]) }}" class="button button-green"
                       target="_blank">Accept your invite
                        now</a>
                @else
                    <a href="{{ route('lotmix-login') }}" class="button button-green" target="_blank">Accept your invite
                        now</a>
                @endif
            </div>

            <br>
        </div>
    </td>

@endsection
@section('feature-header')
    Lotmix will help you with
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