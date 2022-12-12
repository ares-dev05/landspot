@extends('layouts.pdf-a4-print')
@section('styles')
    <style type="text/css">
        <?php echo file_get_contents(public_path('css/pdf-export-floorplan-fonts-inline.css'))?>
        <?php echo file_get_contents(public_path('css/pdf-brochure/sitings-general.css'))?>
		<?php echo file_get_contents(public_path('css/pdf-brochure/sitings-homebuyers.css'))?>

        .page .header {
            margin-top: 2mm;
            background: #eee url("{{$company->company_expanded_logo}}") 3mm center/34mm no-repeat;
        }

        .page .header .client-details {
            width: 70mm;
        }

        .page .header .signatures > .signature {
            width: 20mm;
        }

        .page .siting {
            height: 220mm;
        }

        .page .siting .scale {
            margin-top: 5mm;
            margin-bottom: 13mm;
        }

        .page .footer {
            height: 45mm;
        }

        .page .footer .note {
            margin-top: 0;
        }

    </style>
@endsection

@section('content')
    <div class="page" style="background: #fff url('{{$sitingImage}}') center center/cover no-repeat;">

        <div class="siting">
            <div class="siting-info">
                <div class="scale">Scale 1:{{$siting->page_scale}}</div>
                @include('pdf.sitings.blocks.north-indicator')
            </div>
        </div>

        <div class="footer">
            @include('pdf.sitings.blocks.site-coverage')
            <div class="note">
                Final house position and setbacks subject to accurate lot survey, dimensions and angles.
                <br>
                The Builder reserves the right to adjust the house location.
                <br>
                <br>
                Homebuyers Centre Victoria: 81 Lorimer Street, Docklands VIC 3008 &nbsp; T 131 751 &nbsp; W
                homebuyers.com.au
                &nbsp; ACN 130 382 188 ABN 82 130 382 188
            </div>
        </div>
        <div class="header">
            @include('pdf.sitings.blocks.client-details')
            @include('pdf.sitings.blocks.signatures', ['builder' => 'homebuyers'])
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