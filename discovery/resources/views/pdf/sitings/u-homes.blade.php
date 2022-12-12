@extends('layouts.pdf-a4-print')
@section('styles')
    <style type="text/css">
        <?php echo file_get_contents(public_path('css/pdf-export-floorplan-fonts-inline.css'))?>
        <?php echo file_get_contents(public_path('css/pdf-brochure/sitings-general.css'))?>

        .page .header {
            background: #eee url("{{$company->company_expanded_logo}}") 4mm center/35mm no-repeat;
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

        <div class="siting">
            <div class="siting-info">
                @include('pdf.sitings.blocks.north-indicator')
                <div class="scale">Scale 1:{{$siting->page_scale}}</div>
            </div>
        </div>

        <div class="footer">
            @include('pdf.sitings.blocks.site-coverage')
            <div class="note">
                This siting is a preliminary estimate only. It is subject to verification, additional measurements and a final soil & survey.
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