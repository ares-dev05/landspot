@extends('sitings.layouts.emails')

@section('content')
    <td class="content-cell">
        <h2>{{$floorplan->company->name}} has uploaded new files to floorplan
            <a href="{{route('floorplans.show', ['floorplan' => $floorplan->id])}}">{{$floorplan->name}}</a>
        </h2>
        <p>Please download new files and check the updates.</p>

        <p>State: {{$floorplan->range->state->name}}</p>
        <p>Range: {{$floorplan->range->name}}</p>
        <p>Live Date: {{$floorplan->live_date > 0 ? date('j M Y', $floorplan->live_date) : 'ASAP'}}</p>

        <p>Regards, <br>
            The {{ config('mail.from.name') }} Team</p>

    </td>

@endsection
