@extends('layouts.pdf-a4-print')
@section('styles')
    <style type="text/css">
        <?php echo file_get_contents(public_path('css/pdf-export-floorplan-fonts-inline.css'))?>
        <?php echo file_get_contents(public_path('css/pdf-brochure/sitings-general.css'))?>

        .page .header {
            background: #eee url("https://landconnect.s3-ap-southeast-2.amazonaws.com/company_logos/henley-{{$areaData->logoRange ?? 'collection'}}.png") 3mm center/34mm no-repeat;
        }

        .page .header .client-details {
            width: 74mm;
        }
    </style>
@endsection

@section('content')
    <div class="page" style="background: #fff url('{{$sitingImage}}') center center/cover no-repeat;">
        <div class="header">
            @include('pdf.sitings.blocks.client-details')
            @include('pdf.sitings.blocks.signatures')
        </div>

        <div class="siting" style="height: 230mm">
            <div class="siting-info">
                @include('pdf.sitings.blocks.north-indicator')
            </div>
        </div>

        <div class="footer" style="height: 37mm">
            <div class="site-coverage">
                <div class="lists">
                    <ul class="list">
                        <li class="item">
                            <span class="name">Total House m<sup>2</sup></span>&nbsp;
                            <span class="area">{{number_format((float)($areaData->totalHouseArea ?? 0), 2, '.', '')}}</span>
                        </li>
                        <li class="item">
                            <span class="name">Lot Area</span>&nbsp;
                            <span class="area">{{number_format((float)($areaData && $areaData->lotArea ? $areaData->lotArea : 0), 2, '.', '')}}</span>
                        </li>
                    </ul>
                    <ul class="list">
                        <li class="item">
                            <span class="important">
                                <span class="name">Site Coverage</span>&nbsp;
                                <span class="area">{{number_format((float)($areaData && $areaData->totalCoverage ? $areaData->totalCoverage : 0), 2, '.', '')}}%</span>
                            </span>
                        </li>
                        <li class="item">
                            <span class="name">Display Scale</span>&nbsp;
                            <span class="area">1:{{$siting->page_scale}}</span>
                        </li>
                    </ul>
                    <ul class="list">
                        <li class="item">
                            <span class="name">Lot No.</span>&nbsp;
                            <span class="area">{{$siting->lot_no ?? ''}}</span>
                        </li>
                        <li class="item">
                            <span class="name">SP No.</span>&nbsp;
                            <span class="area">{{$siting->sp_no ?? ''}}</span>
                        </li>
                        <li class="item">
                            <span class="name">Parent Lot No.</span>&nbsp;
                            <span class="area">{{$siting->parent_lot_no ?? ''}}</span>
                        </li>
                        <li class="item">
                            <span class="name">Parent SP No.</span>&nbsp;
                            <span class="area">{{$siting->parent_sp_no ?? ''}}</span>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="note">
                Note: This Siting is preliminary and is provided as a guide only. A full assessment can only be provided once all
                <br>
                information is available, which includes a soil test and site survey, final site position may vary.
            </div>
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