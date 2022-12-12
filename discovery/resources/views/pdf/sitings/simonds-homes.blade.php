@extends('layouts.pdf-a4-print')
@section('styles')
    <style type="text/css">
        <?php echo file_get_contents(public_path('css/pdf-export-floorplan-fonts-inline.css'))?>
        <?php echo file_get_contents(public_path('css/pdf-brochure/sitings-general.css'))?>

        .page .header {
            background: #eee url({{$company->company_expanded_logo}}) 6mm center/29mm no-repeat;
        }

        .page .header .client-details {
            width: 74mm;
        }

        .page .footer .note {
            margin-top: 4mm;
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
                @if($siting->user->state_id == 7)
                <span class="important">Note: Dashed line denotes the extent of face of garage door</span>
                <br>
                <br>
                @endif
                <span class="important">Note: Siting is subject to ResCode requirements</span>
                <br>
                Siting prepared by  {{$siting->user->display_name}}
                <br>
                Simonds Homes Pty Ltd. ACN 35 050 197 610. Builders Registration No. D.B U5403
                <br>
                <span style="color: {{$company->companyThemeColor}}">www.simonds.com.au</span>
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