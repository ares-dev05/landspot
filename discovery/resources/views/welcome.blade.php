@extends('layouts.app')

@section('content')
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-body">
                        @if (session('status'))
                            <div class="alert alert-success">
                                {{ session('status') }}
                            </div>
                        @endif
                        @guest
                            SSO Landconnect.con.au
                        @else
                            You are logged in!
                        @endguest
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection