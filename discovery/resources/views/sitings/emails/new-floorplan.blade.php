@extends('sitings.layouts.emails')

@section('content')
    <td class="content-cell">
        @php
            $floorplan = $floorplans->first();
        @endphp

        <h2>{{$floorplan->company->name}} has added
            @if($floorplans->count() > 1)
                new floorplans.
            @else
                a new floorplan.
            @endif
        </h2>
        <p>State: {{$floorplan->range->state->name}}</p>
        <p>Range: {{$floorplan->range->name}}</p>
        <p>Live Date: {{$floorplan->live_date > 0 ? date('j M Y', $floorplan->live_date) : 'ASAP'}}</p>

        @foreach($floorplans as $floorplan)
            <p>Name: <a href="{{route('floorplans.show', ['floorplan' => $floorplan->id])}}">{{$floorplan->name}}</a></p>
        @endforeach

        <p>Regards, <br>
            The {{ config('mail.from.name') }} Team</p>

    </td>

@endsection
