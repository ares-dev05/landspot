@extends('layouts.emails')

@section('header')
    @include('emails.landspot-header')
@endsection

@section('content')

    <td class="content-cell">
        <p>Hi There,</p>

        @php
            $uploadedPackagesCount = $uploadedPackages->pluck('packages_count')->sum();
            $lotsWithPackagesCount = $uploadedPackages->count();
        @endphp

        <p>You have {{$uploadedPackagesCount}} packages uploaded on {{$lotsWithPackagesCount}} lots.</p>
        <p>There are many lots that have no packages uploaded by your team in the following estates:</p>
        <br>

        @foreach($estates as $estate)
            <p>
                Estate <a target="_blank" href="{{$estate->publicUrl}}">{{ $estate->name }}</a>  - {{$estate->without_packages_count}} lots
            </p>
        @endforeach

        <br>
        <p>To upload packages login.</p>

        <div class="btn-wrapper">
            <a href="{{ route('login') }}" class="button button-blue" target="_blank">Login</a>
        </div>

        <p>Regards, <br>
            The {{ config('mail.from.name') }} Team</p>
    </td>

@endsection
