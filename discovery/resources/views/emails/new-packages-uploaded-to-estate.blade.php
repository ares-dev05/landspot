@extends('layouts.emails')

@section('header')
    @include('emails.landspot-header')
@endsection

@section('content')

    <td class="content-cell">
        <p>Hi There,</p>

        <p>A new House and Land Package has been uploaded!</p>
        <br>

        @foreach($estates as $estate)
            <p>
                Estate <a target="_blank" href="{{$estate->publicUrl}}">{{ $estate->name }}</a>:
            </p>
            <ul>
                @foreach($estate->estateLots as $lot)
                    <li>
                        {{$lot->stage->name}} - Lot
                        No{{$lot->lot_number}} {{$lot->lot_package_count}} {{\Illuminate\Support\Str::plural('package', $lot->lot_package_count)}}
                    </li>
                @endforeach
            </ul>
            <br>
        @endforeach

        <p>Check it out now.</p>

        <div class="btn-wrapper">
            <a href="{{ route('login') }}" class="button button-blue" target="_blank">Login</a>
        </div>

        <p>Regards, <br>
            The {{ config('mail.from.name') }} Team</p>
    </td>

@endsection
