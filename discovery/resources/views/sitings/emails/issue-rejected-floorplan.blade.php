@extends('sitings.layouts.emails')

@section('content')
    <td class="content-cell">
        <h2>Floorplan issues of
            <a href="{{route('floorplans.show', ['floorplan' => $floorplan->id])}}">{{$floorplan->name}}</a>
            has been reviewed and rejected.
        </h2>

        <p>Submitted issue(s):</p>
        <pre>{{$note}}</pre>

        <p>Please download floorplan files again and re-submit issues if ones are present.</p>

        <p>State: {{$floorplan->range->state->name}}</p>
        <p>Range: {{$floorplan->range->name}}</p>
        <p>Live Date: {{$floorplan->live_date > 0 ? date('j M Y', $floorplan->live_date) : 'ASAP'}}</p>

        <p>Regards, <br>
            The {{ config('mail.from.name') }} Team</p>
    </td>
@endsection
