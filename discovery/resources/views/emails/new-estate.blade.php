@extends('layouts.emails')

@section('header')
    @include('emails.landspot-header')
@endsection

@section('content')

    <td class="content-cell">
        <h1>The new estate was added and requires approval</h1>

        <h2>Estate details</h2>
        @if($estate->thumbImage)
            <img alt="{{$estate->name}}" border="0" src="{{$estate->thumbImage}}"/>
        @endif
        <p>Name: <a target="_blank" href="{{$estate->publicUrl}}">{{ $estate->name }}</a></p>
        <p>Company: {{ $estate->company->name }}</p>
        <p>State: {{ $estate->houseState->name }}</p>
        <p>URL: {{$estate->website}}</p>
        <p>Address: {{$estate->address}}</p>
        <p>Suburb: {{$estate->suburb}}</p>
        <p>Contact phone: <a href="tel:{{$estate->contacts}}">{{$estate->contacts}}</a></p>
        <p><a target="_blank" href="http://maps.google.com/maps?q={{ $estate->geo_coords }}">View on map</a></p>

        <h2>Company manager</h2>
        <p>{{ $user->display_name }}</p>
        <p>{{ $user->email }}</p>
        <p>Phone: {{ $user->phone }}</p>

        <p>Regards, <br>
            The {{ config('mail.from.name') }} Team</p>
    </td>

@endsection
