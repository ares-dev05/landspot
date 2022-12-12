@extends('layouts.pdf-a4-print')
@section('styles')
    <style type="text/css">
        <?php echo file_get_contents(public_path('css/pdf-export-lot-fonts-inline.css'))?>
        <?php echo file_get_contents(public_path('css/pdf-stage-lots.css'))?>
    </style>
    <style type="text/css">
        @if(Illuminate\Support\Arr::get($template, 'template_data.tableBodyColor'))
        table.stages-table tbody tr:nth-of-type(2n+1) {
            background: {{Illuminate\Support\Arr::get($template, 'template_data.tableBodyColor')}}  !important;
        }
        @endif
    </style>
@endsection
@section('body-inline-scripts')
    <script>
        <?php echo file_get_contents(public_path('js/pdf-options.js'))?>
    </script>
@endsection
@section('content')

    <div class="page"
         @if(Illuminate\Support\Arr::get($template, 'template_data.templateFont'))
         style="font-family: {{Illuminate\Support\Arr::get($template, 'template_data.templateFont')}}"
            @endif
    >
        <header>
            <div style="height: 15mm; margin: -2mm; padding: 0mm;
            @if($template['headerImage'])
                    background: #FFFFFF url('{!! $template['headerImage'] !!}') left top/contain no-repeat;
            @endif">
            </div>
        </header>

        <h5 style="text-align: right">Generated on <?php echo date('d/m/Y')?></h5>

        <div class="container">

            @if(Illuminate\Support\Arr::get($template, 'template_data.introText'))
                <section class="first-page-text">{{Illuminate\Support\Arr::get($template, 'template_data.introText')}}</section>
            @endif

            <h1>{{Illuminate\Support\Arr::get($template, 'template_data.titleText')}}</h1>
            @foreach($stages as $stage)
                @if($stage->lots->isEmpty())
                    @continue;
                @endif
                <h2>{{$stage->name}}</h2>
                <table class="stages-table">
                    <thead
                            @if(Illuminate\Support\Arr::has($template, ['template_data.tableHeadFontColor', 'template_data.tableHeadColor']))
                            style="
                            @if(Illuminate\Support\Arr::has($template, 'template_data.tableHeadFontColor'))
                                    color: {{Illuminate\Support\Arr::get($template,
                                            'template_data.tableHeadFontColor')}};
                            @endif
                            @if(Illuminate\Support\Arr::has($template, 'template_data.tableHeadColor'))
                                    background: {{Illuminate\Support\Arr::get($template,
                                            'template_data.tableHeadColor')}};
                            @endif
                                    "
                            @endif
                    >
                    <tr>
                        @foreach($columns as $column)
                            <th>{{$column['display_name']}}</th>
                        @endforeach
                    </tr>
                    </thead>
                    <tbody
                            @if(Illuminate\Support\Arr::has($template, 'template_data.tableTextColor'))
                            style="color: {{Illuminate\Support\Arr::get($template,'template_data.tableTextColor')}};"
                            @endif
                    >
                    @foreach($stage->lots as $rowNumber => $lot)
                        @php
                            $lotValues = $lot->lotValues()->get(['lot_attr_id', 'value']);
                            $lot       = $lot->toArray();
                        @endphp
                        <tr
                                @if($rowNumber %2)
                                @if(Illuminate\Support\Arr::has($template, 'template_data.tableBodyEvenRowColor'))
                                style="background: {{Illuminate\Support\Arr::get($template,'template_data.tableBodyEvenRowColor')}};"
                                @endif
                                @else
                                @if(Illuminate\Support\Arr::has($template, 'template_data.tableBodyOddRowColor'))
                                style="background: {{Illuminate\Support\Arr::get($template,'template_data.tableBodyOddRowColor')}};"
                                @endif
                                @endif

                        >
                            @foreach($columns as $columnOffset => $column)
                                <td>
                                    @php
                                        $columnName = $column['attr_name'];
                                    @endphp
                                    @switch($columnName)
                                        @case('price')
                                        ${!! number_format($lot[$columnName]) !!}
                                        @break
                                        @default
                                        @if($column['column_type'] === 'dynamic')
                                            {{
                                                optional($lotValues->first(function ($value) use ($column) {
                                                    return $value->lot_attr_id == $column['id'];
                                                }))->value
                                            }}
                                        @else
                                            {{$lot[$columnName]}}
                                        @endif
                                    @endswitch
                                </td>
                            @endforeach
                        </tr>
                    @endforeach
                    </tbody>
                </table>
            @endforeach

            @if(Illuminate\Support\Arr::get($template, 'template_data.disclaimerText'))
                <section class="disclaimer">{{Illuminate\Support\Arr::get($template, 'template_data.disclaimerText')}}</section>
            @endif

        </div>

        <footer>
            <div style="height: 15mm; margin: 5mm -2mm 0mm -2mm;
            @if($template['footerImage'])
                    background: #ffffff url('{!! $template['footerImage'] !!}') left top/contain no-repeat;
            @endif

                    ">
            </div>
        </footer>
    </div>
@endsection