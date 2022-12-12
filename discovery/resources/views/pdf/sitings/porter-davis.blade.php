@extends('layouts.pdf-a4-print')
@section('styles')
    <style type="text/css">
        <?php echo file_get_contents(public_path('css/pdf-export-floorplan-fonts-inline.css'))?>
        <?php echo file_get_contents(public_path('css/pdf-brochure/sitings-general.css'))?>

        .page .header {
            background: #eee url("https://landconnect.s3.ap-southeast-2.amazonaws.com/company_logos/porterdavis-sitings-logo.png") 3mm center/38mm no-repeat;
        }

        .page .header .client-details {
            width: 159mm;
        }

        .page .footer .site-coverage {
            margin-left: 0;
        }
    </style>
@endsection

@section('content')
    <div class="page" style="background: #fff url('{{$sitingImage}}') center center/cover no-repeat;">
        <div class="header">
            @include('pdf.sitings.blocks.client-details')
        </div>

        <div class="siting">
            <div class="siting-info">
                @include('pdf.sitings.blocks.north-indicator')
                <div class="scale">Scale 1:{{$siting->page_scale}}</div>
            </div>
        </div>

        <div class="footer">
            @include('pdf.sitings.blocks.site-coverage', ['signatures' => true])
            <div class="note">
                Siting prepared by {{$siting->user->display_name}}
                <br>
                <span class="important">Disclaimer:</span> Approximate siting only. Official siting
                will be provided at tender appointment.
                <br>
                House & Land Packages subject to builder's preferred siting. Garages 1000mm off boundary.
                <br>
                <span style="color: {{$company->companyThemeColor}}">www.porterdavis.com.au</span>
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