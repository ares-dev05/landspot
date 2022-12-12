@extends('layouts.pdf-a4-print')

<?php
$house = $facade->house;
?>

@section('styles')
    <style>
        <?php echo file_get_contents(public_path('css/pdf-export-floorplan-fonts-inline.css'))?>
        <?php echo file_get_contents(public_path('css/pdf-brochure/first-place.css'))?>
    </style>
@endsection


@section('content')
    <div class="page full-a4-height">
        <div class="left-side">
            <div class="facade" style="background-image: url('{{$facade->largeImage}}')">
                <div class="facade-name">{{$facade->title ? $facade->title . ' ' . 'Facade' : 'Unnamed Facade'}}</div>
            </div>
            <div class="floorplan-wrapper">
                <div class="floorplan">
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
            <div class="footer-text">
                <p>Terms and conditions apply. Floor plans, facade images and photographs are for illustrative puproses
                    only
                    and may not represent the final product shown. Furniture, accessories, landscaping and decks are not
                    supplied by First-Place. Some facade inclusions shown may be for display puproses only. Purcharses
                    should
                    refer to their new home sales consultant for more onformation. Visit
                    <a href="www.first-place.com.au">www.first-place.com.au</a> for full terms and conditions.
                    CDB-U50038</p>
            </div>
        </div>
        <div class="right-side">
            <div class="empty-space"></div>
            <h1 class="facade-title">{{$house->title}}</h1>
            <p class="text">Fits {{$house->width}}m x {{$house->depth}}m Block</p>
            <hr>
            <div class="house-options">
                @if($house->beds > 0)
                    <div class="option">
                        <div class="beds"></div>{{$house->beds}} <span class="small">Bedrooms</span></div>
                @endif
                <div class="option">
                    <div class="rooms"></div>
                    2 <span class="small">Livingroom</span></div>
                @if($house->bathrooms > 0)
                    <div class="option">
                        <div class="baths"></div>{{$house->bathrooms}} <span class="small">Bathroom</span></div>
                @endif
                @if($house->cars > 0)
                    <div class="option">
                        <div class="cars"></div>{{$house->cars}} <span class="small">Parking</span></div>
                @endif
            </div>
            <div class="includes-block">
                <p class="list-title bold">Package includes</p>
                <ul class="includes">
                    <li>Fixed price site cost & Connections</li>
                    <li>Developer and Council Requirements</li>
                    <li>Tiles to wet areas (Laundry, W.C, Bathroom, Ensuite & Powder Room - house specific)</li>
                    <li>Remote control garage door</li>
                    <li>Ducted gas heating with Ceiling vents</li>
                    <li>Tiled shower bases</li>
                    <li>Quality fixtures and fittings throughout</li>
                </ul>
                <p class="list-title">BONUS OFFER</p>
                <ul class="includes">
                    <li>Timber flooring to kitchen/entry/hall/meals/dining (floorplan specific)</li>
                    <li>Carpet to bedrooms</li>
                </ul>
            </div>
            <div class="right-footer"></div>
            <p class="footer-text">first-place.com.au<span class="separator"></span>1800 1FIRST</p>
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