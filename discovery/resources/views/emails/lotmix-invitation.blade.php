@extends('layouts.emails')

@section('header')
    <a href="{{ \UrlHelper::getHostNameFromUrl(config('app.LOTMIX_URL'))}}">
        <img src="{{ $message->embed(public_path() . '/images/Lmix_logo.png') }}"
             class="lotmix-logo"
             alt="{{ 'Lotmix' }}"
             height="35">
    </a>
@endsection

@section('content')
    <td class="content-cell">
        <p>Dear <b>{{ $user->display_name }},</b></p>
        <p>To activate your {{\UrlHelper::getHostNameFromUrl(config('app.LOTMIX_URL'))}}account and continue enquiry your with leading home builders,
            click activate now.</p>
        <br>
        <div class="btn-wrapper">
            @if(isset($invitationToken))
                <a href="{{ empty($isBriefUser)
                            ? route('register-invite', ['token' => $invitationToken])
                            : route('enquire-once.token', ['token' => $invitationToken]) }}"
                   class="button button-green"
                   target="_blank">Activate Now</a>
            @else
                <a href="{{ route('lotmix-login') }}" class="button button-green" target="_blank">Login</a>
            @endif
        </div>

        <br>
        <p>Regards, <br>
            {{ config('app.LOTMIX_URL') }}</p>
    </td>
@endsection