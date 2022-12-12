@extends('layouts.emails')

@section('header')
    @include('emails.landspot-header')
@endsection

@section('content')

    <td class="content-cell">
        <h2>Please confirm your price list is accurate on this estates</h2>
        <br>
        @foreach($estates as $estate)
            <p>
                Estate: <a target="_blank" href="{{$estate->publicUrl}}">{{ $estate->name }}</a>
            </p>
        @endforeach
        <br>
        <p>Regards, <br>
            The {{ config('mail.from.name') }} Team</p>
    </td>

@endsection
