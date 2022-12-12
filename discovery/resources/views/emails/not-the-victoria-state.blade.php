@extends('layouts.emails')

@section('header')
    @include('emails.landspot-header')
@endsection

@section('content')

    <td class="content-cell">
        <h1>The new builder was registered not from Victoria state</h1>

        <h2>New builder data:</h2>
        <p>Full name: {{ $name }}</p>
        <p>E-mail address: {{ $email }}</p>
        <p>Phone: {{ $phone }}</p>
        <p>State: {{ $state->name }}</p>

        <p>Regards, <br>
            The {{ config('mail.from.name') }} Team</p>

    </td>

@endsection
