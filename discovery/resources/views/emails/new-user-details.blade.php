@extends('layouts.emails')

@section('header')
    @include('emails.landspot-header')
@endsection

@section('content')

    <td class="content-cell">
        <table>
            <tbody>
            @isset($userData['company_name'])
            <tr>
                <td><b>Company name</b></td>
                <td><b>{{$userData['company_name']}}</b></td>
            </tr>
            @endif
            <tr>
                <td><b>First/Last Name</b></td>
                <td><b>{{$userData['display_name']}}</b></td>
            </tr>
            <tr>
                <td>Email</td>
                <td>{{$userData['email']}}</td>
            </tr>
            <tr>
                <td>Phone</td>
                <td>{{$userData['phone']}}</td>
            </tr>
            @isset($userData['password'])
            <tr>
                <td>Password</td>
                <td>{{$userData['password']}}</td>
            </tr>
            @endif
            @if($stateName)
            <tr>
                <td>State</td>
                <td>{{$stateName}}</td>
            </tr>
            @endif
            @isset($userData['estate_name'])
                <tr>
                    <td>Estate</td>
                    <td>{{$userData['estate_name']}}</td>
                </tr>
            @endif
            @isset($userData['website'])
                <tr>
                    <td>Website</td>
                    <td><a href="{{$userData['website']}}">{{$userData['website']}}</a></td>
                </tr>
            @endif
            @isset($userData['address'])
                <tr>
                    <td>Estate location</td>
                    <td>{{$userData['address']}}</td>
                </tr>
            @endif
            </tbody>
        </table>
    </td>

@endsection
