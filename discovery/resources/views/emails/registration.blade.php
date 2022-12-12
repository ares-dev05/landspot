@extends('layouts.emails')

@section('header')
    @include('emails.landspot-header')
@endsection

@section('content')

    <td class="content-cell">
        <h1>The new developer was registered</h1>

        <h2>New developer data:</h2>
        <p>Full name: {{ $name }}</p>
        <p>E-mail address: {{ $email }}</p>
        <p>Phone number: {{ $phone }}</p>

        <h2>Estate details:</h2>
        <p>Estate name: {{ $estateName }}</p>
        <p>Estate website: {{ $website }}</p>
        <p>Estate location: {{ $address }}</p>

        <p>Regards, <br>
            The {{ config('mail.from.name') }} Team</p>

    </td>

@endsection
