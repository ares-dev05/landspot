@extends('layouts.pdf-a4-print')

<?php
$house = $facade->house;
?>

@section('styles')
    <style>
        <?php echo file_get_contents(public_path('css/pdf-export-floorplan-fonts-inline.css'))?>
        <?php echo file_get_contents(public_path('css/pdf-brochure/porter-davis.css'))?>
    </style>
@endsection

@section('facade')
    <div class="facade" style="background-image: url('{{$facade->largeImage}}')">
        <div class="porter-davis-logo"></div>
    </div>
@endsection

@section('description')
    <div class="description">
        <div class="title">{{$house->title}}<span class="facade-name">{{$facade->title ?? 'Unnamed facade'}}</span></div>
        <div class="lot-size">Min Lot Size: {{$house->width}}m x {{$house->depth}}m</div>

        <div class="house-data">
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
    </div>
@endsection

@section('floorplans')
    <div class="floorplans">
        @if($house->floorplans->isNotEmpty())
            @foreach($house->floorplans as $key => $floorplan)
                <div style="background-image: url('{{$floorplan->largeImage}}')">
                    <span>{{$key == 0 ? "Ground floor" : "First floor"}}</span>
                </div>
            @endforeach
        @endif
    </div>
@endsection


@section('footer')
    <div class="footer">
        <dl class="contacts">
            <dd>porterdavis.com.au</dd>
        </dl>
        <section class="notice">
            * Sizes may vary slightly as per façade range. Floorplan image based on the standard facade. Images include examples of upgrade items and other items not supplied by Porter Davis, such as landscaping, water features, pools, pool fences, decorative lighting, and furniture. # Minimum Lot Sizes may vary due to Council requirements & estate guidelines. This work is exclusively owned by RSS Property Holdings and cannot be reproduced or copied either wholly or in part, in any form (graphic, electronic or mechanical, including photocopying and uploading to the internet) without the written permission of RSS Property Holdings. This document is for illustration purposes and should be used as a guide only. Illustrations are not to scale. Refer to actual working drawings.
        </section>
    </div>
@endsection

@section('content')
    <div class="page full-a4-height">
        <div class="main">
            @yield('facade')
        </div>
        <div class="content">
            @yield('description')
            @yield('floorplans')
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