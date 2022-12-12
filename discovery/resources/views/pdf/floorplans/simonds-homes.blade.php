@extends('layouts.pdf-a4-print')
<?php
$house = $facade->house;
?>
@section('styles')
    <style type="text/css">
        <?php echo file_get_contents(public_path('css/pdf-export-floorplan-fonts-inline.css'))?>
        <?php echo file_get_contents(public_path('css/pdf-brochure/simonds-homes.css'))?>
    </style>
@endsection
@section('content')
    <div class="page">
        <div class="brand-logo"></div>
        <div class="facade-preview" style="background-image: url('{{$facade->largeImage}}')"></div>
        <div class="attributes">
            {{$facade->title}} -
            @if($house->beds > 0)
            {{$house->beds}} Bedrooms -
            @endif
            @if($house->bathrooms > 0)
            {{$house->bathrooms}} Bathrooms -
            @endif
            @if($house->cars > 0)
            {{$house->cars}} Car spaces -
            @endif
            {{round($house->areaSize)}}@if($house->areaSizeUnits == 'm2')m<sup>2</sup>
            @else
                {{$house->areaSizeUnits}}
            @endif
        </div>
        <div class="lot-features {{$house->story > 1 ? 'double' : ''}}">
            <div class="features">
                <div class="range-name">{{$facade->range}}</div>
                <div class="house-name">{{$house->title}}</div>
                @if($house->description)
                    <div class="house-description">
                        {{ $house->description }}
                    </div>
                @else
                    <?php
                        $inclusions = $house->range->inclusionsAsArray;
                    ?>
                    @if($inclusions)
                        <ul class="house-description">
                            @foreach($inclusions as $inclusion)
                                <li class="item">
                                    <span class="dot">.</span>
                                    {{$inclusion}}</li>
                            @endforeach
                        </ul>
                    @endif
                @endif
                <div class="lot-size">
                    Required Lot Size: {{$house->width}}m x {{$house->depth}}m
                </div>

                <div class="disclaimer">
                    Disclaimer: Images shown are for illustrative purposes only and may not represent the final product such as lighting, window furnishings, timber look garage door & timber windows. Facade details including entry door and window sizing may vary between house types. Total floorplan area is indicative only and may vary depending on the facade selected. VBA Company Registration CDB-U 49491.
                </div>
            </div>
            <div class="floorplan-image">
                {{--<div class="label">FLOORPLAN</div>--}}
                @if($house->floorplans()->exists())
                    <div style="height: 100%">
                        @foreach($house->floorplans as $floorplan)
                        <div class="image"
                             style="height: @php echo 100/$loop->count.'%' @endphp;
                                     background-image: url('{{$floorplan->largeImage}}')"></div>
                        @endforeach
                    </div>
                @endif
            </div>
        </div>
    </div>
@endsection