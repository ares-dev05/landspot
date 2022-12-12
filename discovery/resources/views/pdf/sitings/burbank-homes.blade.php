@extends('layouts.pdf-a4-print')

<?php
$branchName = [
    '', '(NSW)', '(NSW)', '', '(Qld)', '(Sa)', '', '', ''
][
    $siting->user->state_id ?? 7
];
?>

@section('styles')
    <style type="text/css">
        <?php echo file_get_contents(public_path('css/pdf-export-floorplan-fonts-inline.css'))?>
        <?php echo file_get_contents(public_path('css/pdf-brochure/sitings-burbank-homes.css'))?>

        .page .header::after {
            background: #fff url({{$company->company_logo}}) 4mm -3mm/48mm no-repeat;
        }
        .page .footer .contacts > div span {
            color: {{$company->companyThemeColor ?? 'inherit'}};
        }
    </style>
@endsection

@section('content')
    <div class="page" style="background: #fff url('{{$sitingImage}}') center center/cover no-repeat;">
        <div class="header">
            <div class="lists">
                <ul class="list">
                    <li class="item">
                        <span class="name">Customer Name:</span>&nbsp;
                        <span class="area important">{{$siting->first_name}} {{$siting->last_name}}</span>
                    </li>
                    <li class="item">
                        <span class="name">Customer Address:</span>&nbsp;
                        <span class="area">{{$siting->lot_number ?? ''}} {{$siting->street ?? ''}}</span>
                    </li>
                    <li class="item">
                        <span class="name">House & Facade:</span>&nbsp;
                        <span class="area">{{$siting->house ?? ''}} - {{$siting->facade ?? ''}}</span>
                    </li>
                    <li class="item">
                        <span class="name">Option(s):</span>&nbsp;
                        <span class="area">{{$siting->options ?? ''}}</span>
                    </li>
                    <li class="item">
                        <span class="name">Modifications:</span>&nbsp;
                        <span class="area">{{$siting->extra_details ?? ''}}</span>
                    </li>
                </ul>
                <ul class="list">
                    <li class="item">
                        <span class="name">Date:</span>
                        <span class="area"></span>
                    </li>
                    <li class="item">
                        <span class="name">Signature 1:</span>
                        <span class="area"></span>
                    </li>
                    <li class="item">
                        <span class="name">Signature 2:</span>
                        <span class="area"></span>
                    </li>
                </ul>
            </div>
        </div>

        <div class="siting">
            <div class="siting-info">
                <div class="scale">Scale 1:{{$siting->page_scale}}</div>
                @include('pdf.sitings.blocks.north-indicator')
            </div>
        </div>

        <div class="footer">
            <div class="contacts">
                <div><span>call</span> 13 BURBANK</div>
                <div><span>visit</span> burbank.com.au</div>
            </div>
            <div class="site-coverage">
                <div class="heading">Site Coverage</div>
                <div class="lists">
                    <ul class="list">
                        <li class="item">
                            <span class="name">Ground Floor</span>&nbsp;
                            <span class="area">{{number_format((float)($areaData->houseAreas->floor ?? 0), 2, '.', '')}}</span>
                        </li>
                        <li class="item">
                            <span class="name">Garage</span>&nbsp;
                            <span class="area">{{number_format((float)($areaData->houseAreas->garage ?? 0), 2, '.', '')}}</span>
                        </li>
                        <li class="item">
                            <span class="name">Alfresco</span>&nbsp;
                            <span class="area">{{number_format((float)($areaData->houseAreas->alfresco ?? 0), 2, '.', '')}}</span>
                        </li>
                    </ul>

                    <ul class="list">
                        <li class="item">
                            <span class="name">Porch</span>&nbsp;
                            <span class="area">{{number_format((float)($areaData->houseAreas->porch ?? 0), 2, '.', '')}}</span>
                        </li>
                        <li class="item">
                            <span class="name">Option</span>&nbsp;
                            <span class="area">{{number_format((float)($areaData->houseAreas->options ?? 0), 2, '.', '')}}</span>
                        </li>
                        <li class="item">
                            <span class="name">Ext/Red</span>&nbsp;
                            <span class="area">{{number_format((float)($areaData->houseAreas->transformations ?? 0), 2, '.', '')}}</span>
                        </li>
                    </ul>
                    <ul class="list">
                        <li class="item">
                            <span class="name">Total House <span class="sup">m</span></span>&nbsp;
                            <span class="area">{{number_format((float)($areaData->totalHouseArea ?? 0), 2, '.', '')}}</span>
                        </li>
                        <li class="item">
                            <span class="name">Lot Area <span class="sup">m</span></span>&nbsp;
                            <span class="area">{{number_format((float)$areaData->lotArea ?? 0, 2, '.', '')}}</span>
                        </li>
                        <li class="item">
                            <span class="important">
                                <span class="name">TOTAL COVERAGE</span>&nbsp;
                                <span class="area">{{number_format((float)$areaData->totalCoverage ?? 0, 2, '.', '')}}%</span>
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="note">
                This siting plan is to be used solely to determine whether a particular Burbank Australia {{$branchName}} Pty Ltd house
                will fit on a lot of land.  It is an indication only and should not be relied upon for any other purpose.
                Burbank takes no responsibility for the accuracy of this siting plan as it has not fully reviewed all necessary
                and ancillary documents in relation to the particular lot. All parties relying upon this plan should seek expert
                advice in order to accurately determine the suitability of the proposed dwelling on the particular lot.
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