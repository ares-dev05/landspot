@extends('layouts.emails')

@section('header')
    @include('emails.landspot-header')
@endsection

@section('content')

    <td class="content-cell">
        <h1>Verification Required</h1>
        <p>Thank you for registering. Please click the button below to validate your email and start using your account.</p>

        <div class="btn-wrapper">
            <a href="{{ $verify_url }}" class="button button-blue" target="_blank">Verify Your Account</a>
        </div>

        <p>Regards, <br>
            The {{ config('mail.from.name') }} Team</p>

    </td>

@endsection
