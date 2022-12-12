@extends('layouts.pdf-a4-print')
<?php
$house = $facade->house;
?>
@section('styles')
    <style type="text/css">
        <?php echo file_get_contents(public_path('css/pdf-export-floorplan-fonts-inline.css'))?>
        <?php echo file_get_contents(public_path('css/pdf-brochure/kingsbridge-homes.css'))?>
    </style>
@endsection
@section('content')
    <div class="page">
        <div class="brand-logo"></div>
        <div class="facade-preview {{$house->story > 1 ? 'double' : ''}}" style="background-image: url('{{$facade->largeImage}}')"></div>
        <div class="lot-features {{$house->story > 1 ? 'double' : ''}}">
            <div class="features">
                <div class="house-name">{{$house->title}}</div>
                <div class="facade-name">{{$facade->title}}</div>
                <ul class="house-attributes">
                    @if($house->beds > 0)
                        <li class="beds">{{$house->beds}}</li>
                    @endif
                    @if($house->bathrooms > 0)
                        <li class="cars">{{$house->cars}}</li>
                    @endif
                    @if($house->cars > 0)
                        <li class="baths">{{$house->bathrooms}}</li>
                    @endif
                </ul>
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
                                    <span class="dot"></span>
                                    {{$inclusion}}</li>
                            @endforeach
                        </ul>
                    @endif
                @endif
            </div>
            <div class="floorplan-image">
                @if($house->floorplans()->exists())
                    <div style="height: 100%">
                        @foreach($house->floorplans as $floorplan)
                        <div class="image"
                             style="background-image: url('{{$floorplan->largeImage}}')"></div>
                        @endforeach
                    </div>
                @endif
            </div>
        </div>
        <div class="footer">
            <div class="contacts">
                <div>kingsbridge.com.au</div>
                <div>1800 897 876</div>
            </div>
            <div class="note">
                Disclaimer: Images are for illustrative purposes only and may not represent standard inclusions. Please refer to final
                contract documents and final working drawings for exact details. E&OE. Kingsbridge Homes. This plan and information is
                indicative only and may vary without notice. Furniture or vehicles are not included in the sale of the lot. The image
                depicted here is a completed ‘like design’, not the actual lot for sale. Façade finishes and colours may vary.
                Images are artist’s impressions only.
            </div>
        </div>
    </div>
@endsection