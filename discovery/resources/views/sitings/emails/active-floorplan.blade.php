@extends('sitings.layouts.emails')

@section('content')
    <td class="content-cell">
        <h2>Congratulation,
            @if($floorplan->svg_path)
                Landconnect has made your updates of plan <a href="{{route('floorplans.show', ['floorplan' => $floorplan->id])}}">{{$floorplan->name}}</a> live.
            @else
                Landconnect has made your new plan <a href="{{route('floorplans.show', ['floorplan' => $floorplan->id])}}">{{$floorplan->name}}</a> live.
            @endif
            </h2>
        <p>State: {{$floorplan->range->state->name}}</p>
        <p>Range: {{$floorplan->range->name}}</p>
        <p>Live Date: {{$floorplan->live_date > 0 ? date('j M Y', $floorplan->live_date) : 'ASAP'}}</p>

        <p>Regards, <br>
            The {{ config('mail.from.name') }} Team</p>
    </td>
@endsection
