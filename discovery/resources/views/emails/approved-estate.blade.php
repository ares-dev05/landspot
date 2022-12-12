@extends('layouts.emails')

@section('header')
    @include('emails.landspot-header')
@endsection

@section('content')

    <td class="content-cell">
        <h2>Congratulations, your estate <a target="_blank"
                                            href="{{$estate->publicUrl}}">{{ $estate->name }}</a>
            has been approved</h2>

        <p>Regards, <br>
            The {{ config('mail.from.name') }} Team</p>
    </td>

@endsection
