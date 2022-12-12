@extends('layouts.lotmix-email')

@section('content')

    <td class="content-cell">
        <div class="white-wrapper">
            <img alt="I'm an image"
                 class="main-image"
                 src="{{$message->embed(public_path() . '/images/lotmix/welcome_email_3.png')}}"
                 title="Lotmix main image"
                 width="608">
        </div>
        <div class="white-wrapper">
            <h1 class="welcome-text">100 + Things People Forget When Building a New Home.</h1>
            <p>Dear <b>{{ $user->display_name }},</b></p>
            <p>There are so many decisions to make when building a new home.</p>
            <br>
            <p>We have collated over 100 things people forget when building a new home as reported by buyers who have been through the build journey before.</p>
            <br>
            <p>Login to Lotmix.com.au to read our invaluable guide and avoid making the same mistakes.</p>
            <br>
            <p>Claim your Lotmix invite from <b>{{ $company->name }}</b></p>
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