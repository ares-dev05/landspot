@extends('layouts.pdf-a4-print')
@section('styles')
    <style type="text/css">
        <?php echo file_get_contents(public_path('css/pdf-export-floorplan-fonts-inline.css'))?>
        <?php echo file_get_contents(public_path('css/pdf-brochure/sitings-general.css'))?>

        .page .header {
            background: #000;
            position: relative;
        }
		
        .page .header::before {
            display: block;
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: 40mm;
            background: black url("{{$company->company_expanded_logo}}") 2mm center/36mm no-repeat;
        }

        .page .header .client-details {
            width: 74mm;
			color: white;
        }

        .page .footer .note {
            margin-top: 9mm;
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
				Note : this is a preliminary siting and is subject to a clear copy of the title and the approval of Marque.<br/>
				This siting may be subject to a developer approval process.<br/>
				This siting is subject to rescode (state building regulations) and council requirements.
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