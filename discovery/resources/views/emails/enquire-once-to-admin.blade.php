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
        <br>
        <p>Please go through the requirements:</p>
        <p>Region: {{ $data['region'] ?? '' }}</p>
        @if(!empty($data['land']) && $data['land'] === 'have_land')
            <p>Land: Have land</p>
            <p>Lot number: {{ $data['lot_number'] ?? '' }}</p>
            <p>Street: {{ $data['street_name'] ?? '' }}</p>
            <p>Estate: {{ $data['estate_name'] ?? '' }}</p>
        @else
            <p>Land: No land</p>
            <p>Suburbs: {{ $data['suburbs'] ?? '' }}</p>
        @endif
        <br>
        <p>House Requirements: </p>
        <p>  Bedrooms:  {{ $data['house_requirements']['bedrooms'] ?? '' }}</p>
        <p>  Bathrooms:  {{ $data['house_requirements']['bathrooms'] ?? '' }}</p>
        <p>  Story:  {{ $data['house_requirements']['story'] ?? '' }}</p>
        <br>
        <p>Finance: </p>
        <p>  Pre-approval:  {{ $data['pre_approval'] ? 'Yes' : 'No' }}</p>
        <p>  Type:  {{ $data['buyer_type'] ?? '' }}</p>
        <br>

        <p>Regards, <br>
            The {{ config('mail.from.lotmix_name') }} Team</p>
    </td>

    @endsection
    @section('right')
    &copy; Landconnect Global Pty Ltd. All rights reserved. - {{ date('Y') }}
@endsection
