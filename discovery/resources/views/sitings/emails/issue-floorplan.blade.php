@extends('sitings.layouts.emails')

@section('content')
    <td class="content-cell">
        <h2>Floorplan
            <a href="{{route('floorplans.show', ['floorplan' => $floorplan->id])}}">{{$floorplan->name}}</a>
            has issues.
        </h2>

        <h3>Please log in and review the following issue(s) that need to be corrected:</h3>

        <pre>{{$note}}</pre>

        <p>State: {{$floorplan->range->state->name}}</p>
        <p>Range: {{$floorplan->range->name}}</p>
        <p>Live Date: {{$floorplan->live_date > 0 ? date('j M Y', $floorplan->live_date) : 'ASAP'}}</p>

        <p>Reviewed by contractor <b>{{$contractor->display_name}}</b></p>

        <p>Regards, <br>
            The {{ config('mail.from.name') }} Team</p>
    </td>
@endsection
