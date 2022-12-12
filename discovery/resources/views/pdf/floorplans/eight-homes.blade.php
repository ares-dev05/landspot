@extends('layouts.pdf-a4-print')

<?php
$house = $facade->house;
?>

@section('styles')
    <style>
        <?php echo file_get_contents(public_path('css/pdf-export-floorplan-fonts-inline.css'))?>
        <?php echo file_get_contents(public_path('css/pdf-brochure/8homes.css'))?>
    </style>
@endsection

@section('facade')
    <div class="facade" style="background-image: url('{{$facade->largeImage}}')">
        <div class="advertising">Furniture, feature lighting, landscaping, driveway, window furnishings, and porch decking not provided by Eight Homes.</div>
        <div class="facade-name">{{$facade->title ? $facade->title . ' ' . 'Facade' : 'Unnamed Facade'}}</div>
    </div>
@endsection

@section('description')
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
                <li class="inclusions">INCLUSIONS</li>
                @foreach($inclusions as $inclusion)
                    <li>{{$inclusion}}</li>
                @endforeach
            </ul>
        @endif
    @endif

    <div class="lot-size-title">Designed to fit:</div>
    <div class="lot-size">Lot Width {{$house->width}}m+ | Lot Depth {{$house->depth}}m+</div>
@endsection

@section('floorplans')
    <div class="floorplans">
        @if($house->floorplans->isNotEmpty())
            @foreach($house->floorplans as $key => $floorplan)
                <div style="background-image: url('{{$floorplan->largeImage}}')">

                </div>
            @endforeach
        @endif
    </div>
@endsection


@section('header')
    <div class="header"></div>
@endsection

@section('house-data')
    <div class="house-data">
        <div class="attributes">
            <div class="title">{{$house->title}}</div>
            <div class="range">{{$house->range->name}}</div>
            <ul class="house-options">
                @if($house->beds > 0)
                    <li class="beds">{{$house->beds}}</li>
                @endif
                @if($house->bathrooms > 0)
                    <li class="baths">{{$house->bathrooms}}</li>
                @endif
                @if($house->cars > 0)
                    <li class="cars">{{$house->cars}}</li>
                @endif
            </ul>

            @if($house->areaSize > 0)
                <span class="area-size">{{round($house->areaSize, 2)}}
                    @if($house->areaSizeUnits == 'm2')m<sup>2</sup>
                    @else
                        {{$house->areaSizeUnits}}
                    @endif
                </span>
            @endif

            @yield('description')
        </div>
        @yield('floorplans')
    </div>
@endsection

@section('content')
    <div class="page full-a4-height">
        @yield('header')
        @yield('facade')
        @yield('house-data')

        <div class="disclaimer">
            Floorplan images and measurements are to be used as a guide only, please refer to specific working drawings for details. Registered Building Practitioner DBU 18864.
        </div>
    </div>
@endsection

@section('body-inline-scripts')
    <script>
        window.pdfPaperOptions = {
            width: '210mm',
            height: '297mm',
            orientation: 'portrait',
            format: 'A4',
            margin: {
                top: '0',
                left: '0',
                bottom: '0',
                right: '0'
            }
        };
    </script>
@endsection