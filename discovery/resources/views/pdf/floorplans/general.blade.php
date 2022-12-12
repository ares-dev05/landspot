@extends('layouts.pdf-a4-print')
<?php
$house = $facade->house;
?>
@section('styles')
    <style type="text/css">
        <?php echo file_get_contents(public_path('css/pdf-brochure/general.css'))?>
        /* phantomjs tweak/bug */
        /*html.phantom-js {
            height: 0;
        }*/
    </style>
@endsection
@section('content')
    <div class="page">
        <div class="brand-logo"></div>
        <div class="facade-preview" style="background-image: url('{{$facade->largeImage}}')"></div>
        <div class="attributes">
            {{$facade->title}} -
            @if($house->beds > 0)
            {{$house->beds}} BEDROOMS -
            @endif
            @if($house->bathrooms > 0)
            {{$house->bathrooms}} BATHROOMS -
            @endif
            @if($house->cars > 0)
            {{$house->cars}} CAR SPACES -
            @endif
            {{round($house->areaSize)}} {{strtoupper($house->areaSizeUnits)}}
        </div>
        <div class="lot-features">
            <div class="features">
                <div class="range-name">{{$facade->range}}</div>
                <div class="house-name">{{$house->title}}</div>
                <div class="price">${{number_format($house->price)}}</div>
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
                                <li>{{$inclusion}}</li>
                            @endforeach
                        </ul>
                    @endif
                @endif
                <div class="lot-size">
                    Required Lot Size: {{$house->width}}m x {{$house->depth}}m
                </div>
            </div>
            <div class="floorplan-image">
                <div class="label">FLOORPLAN</div>
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