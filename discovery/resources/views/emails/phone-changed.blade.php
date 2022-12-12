@extends('layouts.emails')

@section('header')
    @include('emails.landspot-header')
@endsection

@section('content')

    <td class="content-cell">
        <p>Dear {{ $name }}</p>
        <p>Your phone has been changed to {{ $phone }}.</p>

        <p>Regards, <br>
            The {{ config('mail.from.name') }} Team</p>

    </td>

@endsection
