@extends('layouts.emails')

@section('header')
    @include('emails.landspot-header')
@endsection

@section('content')

    <td class="content-cell">
        <p>Hi There,</p>

        <p>{{$companyName}} users have been looking at your estate(s).</p>
        <p>You are currently missing estate documentation such as Plan of subdivision and
            Engineering for the following Estates and Stages:</p>

        @foreach($estates as $estate)
            @if($estate->stage->isNotEmpty())
                <h2>Estate "{{$estate->name}}":</h2>
                <table class="text-left">
                    <thead>
                    <tr>
                        <th>Stages</th>
                    </tr>
                    </thead>
                    <tbody>
                    @foreach($estate->stage as $stage)
                        <tr>
                            <td>{{$stage->name}}</td>
                        </tr>
                    @endforeach
                    </tbody>
                </table>
                <br/>
            @endif
        @endforeach

        <p>Please upload to ensure your builder partners are kept up to date!</p>
        <div class="btn-wrapper">
            <a href="{{ route('login') }}" class="button button-blue" target="_blank">Login</a>
        </div>

        <p>Regards, <br>
            The {{ config('mail.from.name') }} Team</p>
    </td>

@endsection
