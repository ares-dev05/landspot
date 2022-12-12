@extends('layouts.emails')

@section('header')
    <a href="{{ config('app.LOTMIX_URL') }}">
        <img src="{{ $message->embed(public_path() . '/images/Lmix_logo.svg') }}"
             alt={{ 'Lotmix' }} height="35">
    </a>
@endsection

@section('content')

    <td class="content-cell">
        <p>Dear {{ $user->display_name }}</p>
        <p>Manager {{$authUser->display_name}} from your company shared his draft siting with you.</p>

        <div class="btn-wrapper">
            <a href="{{ route('login') }}" class="button button-blue" target="_blank">Sign in</a>
        </div>

        <p>Regards, <br>
            Lotmix</p>
    </td>

@endsection
