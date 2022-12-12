@extends('layouts.emails')

@section('header')
    @include('emails.landspot-header')
@endsection

@section('content')

    <td class="content-cell">
        <p>Dear {{ $name }}</p>
        @if($TWOFA_ACTIVE)
            <p>Your have successfully activated two-factor authorization on your account.</p>
            <p>Please backup your secret key and store it in secure place.</p>
            <p>Never tell anyone your secret key.</p>
        @else
            <p>Your have deactivated two-factor authorization on your account.</p>
            <p>We recommend to activate two-factor authorization on your account to keep it secure.</p>
        @endif

        <p>Regards, <br>
            The {{ config('mail.from.name') }} Team</p>

    </td>

@endsection
