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
        <p>Dear {{$type}},</p>
        <p>The user {{$invitedUser->first_name}} {{$invitedUser->last_name}} sent you a message
            <br>
        </p>
        <br>
        <p>More detailed information:</p>
        <p>Email: {{ $invitedUser->email }}</p>
        <p>Phone: {{ $invitedUser->phone }}</p>
        @if(isset($buyerType))<p>Buyer type: {{ $buyerType }}</p>@endif
        @if(isset($region))<p>Region entry: {{ $region }}</p>@endif
        @if(isset($estateName))<p>Estate Name: {{ $estateName }}</p>@endif
        @if(isset($lotNumber))<p>Lot Number: {{ $lotNumber }}</p>@endif

        <br>
        <p>Regards, <br>
            The {{ config('mail.from.lotmix_name') }} Team</p>
    </td>

@endsection
@section('right')
&copy; Landconnect Global Pty Ltd. All rights reserved. - {{ date('Y') }}
@endsection
