@extends('layouts.emails')

@section('header')
    @include('emails.landspot-header')
@endsection

@section('content')

    <td class="content-cell">
        <h1>Thank you for registering</h1>

        <p>Landspot is currently only available in Victoria. We will keep you posted when its available in your state</p>

        <p>Regards, <br>
            The {{ config('mail.from.name') }} Team</p>

    </td>

@endsection
