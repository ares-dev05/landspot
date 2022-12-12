@extends('layouts.pdf-a4-print')

<?php
$house = $facade->house;
?>

@section('styles')
    <style>
        <?php echo file_get_contents(public_path('css/pdf-export-floorplan-fonts-inline.css'))?>
        <?php echo file_get_contents(public_path('css/pdf-brochure/sherridon-homes.css'))?>
    </style>
@endsection

@section('house-data')
    <div class="house-data">
        <div class="properties">
            <div class="title">{{$house->title}}<span class="range">{{$house->range->name}}</span></div>
            <div class="lot-size">Min Lot Size: {{$house->width}}m x {{$house->depth}}m</div>
        </div>

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
    </div>
@endsection

@section('floorplans')
    <div class="floorplans">
        @if($house->floorplans->isNotEmpty())
            @foreach($house->floorplans as $key => $floorplan)
                <div style="background-image: url('{{$floorplan->largeImage}}')"></div>
            @endforeach
        @endif
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
                <li class="title">Turn Key Inclusions</li>
                @foreach($inclusions as $inclusion)
                    <li class="item">
                        <span class="dot">.</span>
                        {{$inclusion}}</li>
                @endforeach
            </ul>
        @endif
    @endif
@endsection

@section('footer')
    <div class="footer">
        The builder reserves the right to amend specification and price without notice. All plans and facades are indicative concepts and are not intended to be an actual depiction of the building. Fencing, paths, driveway or landscaping are for illustration purposes only. All dimensions are approximate, refer to contract documentation for details. The First Home Owners Grant is a government incentive and is subject to change.
        Sherridon Homes – CDB-U 50039
        <div class="contacts">E-mail: info@sherridonhomes.com.au  Ph: 1300 188 668</div>
    </div>
@endsection

@section('content')
    <div class="page full-a4-height">
        <div class="header">
            <img src="{{asset('/images/pdf_public/Sherridon_Homes_Logo_Navy_CMYK_cs5.svg')}}"/>
        </div>

        <div class="facade" style="background-image: url('{{$facade->largeImage}}')"></div>

        @yield('house-data')

        <div class="house-attributes">
            @yield('floorplans')
            @yield('description')
        </div>

        @yield('footer')
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