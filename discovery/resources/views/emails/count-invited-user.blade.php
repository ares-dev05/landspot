@extends('layouts.emails')

@section('header')
    @include('emails.landspot-header')
@endsection

@section('content')

    <td class="content-cell">
        <p>The number of invited users on the {{config('app.LOTMIX_URL')}} site (time {{now()->format('d.m.Y')}})</p>
        <p><b>Count:{{$invitedUserCount}}</b></p>
        <p>Regards, <br>
            The {{ config('mail.from.name') }} Team</p>

    </td>

@endsection
