@extends('layouts.pdf-a4-print')

<?php
$house = $facade->house;
?>

@section('styles')
    <style type="text/css">
        <?php echo file_get_contents(public_path('css/pdf-export-floorplan-fonts-inline.css'))?>
        <?php echo file_get_contents(public_path('css/pdf-brochure/general.css'))?>
        <?php echo file_get_contents(public_path('css/pdf-brochure/burbank-homes.css'))?>
    </style>
@endsection

@section('facade')
    <div class="facade" style="background-image: url('{{$facade->largeImage}}')">
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
            {{--
            @if($house->areaSize > 0)
                <li class="land-size">{{round($house->areaSize)}} m<sup>2</sup></li>
            @endif
            --}}
        </ul>
    </div>
@endsection

@section('description')
    <div class="description">
        <div class="title">{{$house->title}}</div>
        <div class="lot-size">Min Lot Size: {{$house->width}}m x {{$house->depth}}m</div>
        <div class="facade-name">{{$facade->title}}</div>
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
    </div>
@endsection

@section('double-story')
    <div class="main">
        @yield('description')
        @yield('facade')
    </div>
    <div class="floorplans">
        @if($house->floorplans->isNotEmpty())
            @foreach($house->floorplans as $floorplan)
                <div style="background-image: url('{{$floorplan->largeImage}}')"></div>
            @endforeach
        @endif
    </div>
@endsection

@section('single-story')
    <div class="main">
        <div class="floorplan-wrapper">
            @if($house->floorplans->isEmpty())
                <div class="floorplan"></div>
            @else
                @foreach($house->floorplans->take(1) as $floorplan)
                    <div class="floorplan" style="background-image: url('{{$floorplan->largeImage}}')"></div>
                @endforeach
            @endif
        </div>
        <div class="facade-and-description">
            @yield('facade')
            @yield('description')
        </div>
    </div>
@endsection

@section('footer')
    <div class="footer">
        <dl class="contacts">
            <dt>t:</dt>
            <dd>13 BURBANK</dd>

            <dt>e:</dt>
            <dd>enquiries@burbank.com.au</dd>

            <dt>w:</dt>
            <dd>burbank.com.au</dd>
        </dl>
        <section class="notice">
            All façade images are artist’s impressions only. These images may contain internal or external upgrade
            items such as feature renders and timber look garage doors. Images contain items not
            supplied by Burbank, which include furniture, landscaping, fencing and external lighting. See your New
            Home Consultant for full specifications. Copyright conditions. All photos and illustrations
            are representative only. Floor plans and specifications may be varied by Burbank without notice, the
            dimensions are diagrammatic only and a Building Contract with final drawings will display
            correct dimensions and detail. All designs are the property of Burbank and must not be used, reproduced,
            copied or varied, wholly or in part without written permission from an authorised
            Burbank representative. Copyright Burbank Australia Pty Ltd. ABN 91 007 099 872. Builders Registration
            Number DB-U 45297
        </section>
    </div>
@endsection

@section('content')
    <div class="page full-a4-height
                @if($house->story > 1)has-2-storey
                @else has-1-storey
                @endif">
        <div class="header">
            <div class="logo-panel"></div>
            <div class="burbank-logo"></div>
        </div>

        @if($house->story > 1)
            @yield('double-story')
        @else
            @yield('single-story')
        @endif

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