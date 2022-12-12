@extends('layouts.emails')

@section('header')
    @include('emails.landspot-header')
@endsection

@section('content')

    <td class="content-cell">
        <h1>Register a new membership</h1>

        <p>Name: {{  $name }}</p>
        <p>Email: {{ $email }}</p>

        <p>Regards, <br>
            The {{ config('mail.from.name') }} Team</p>
    </td>

@endsection
