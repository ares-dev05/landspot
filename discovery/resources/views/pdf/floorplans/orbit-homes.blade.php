@extends('layouts.pdf-a4-print')

<?php
$house = $facade->house;
$inclusions = $house->range->inclusionsAsArray;
?>

@section('styles')
    <style type="text/css">
        <?php echo file_get_contents(public_path('css/pdf-export-floorplan-fonts-inline.css'))?>
        <?php echo file_get_contents(public_path('css/pdf-brochure/general.css'))?>
        <?php echo file_get_contents(public_path('css/pdf-brochure/orbit-homes.css'))?>
    </style>
@endsection

@section('house-options')
    <ul class="house-options">
        @if($house->beds > 0)
            <li class="beds">{{$house->beds}}</li>
        @endif
        @if($house->bathrooms > 0)
            <li class="baths">{{$house->bathrooms}}</li>
        @endif
        @if($house->cars > 0)
            <li class="cars">{{$house->cars}}</li>
        @endif
        {{--
        @if($house->areaSize > 0)
            <li class="land-size">{{round($house->areaSize)}} m<sup>2</sup></li>
        @endif
        --}}
    </ul>
@endsection


@section('header')
    <div class="title">{{$house->title}}</div>
    <div class="fixed-title">{{$house->title}} -&nbsp;{{$facade->title ?? 'Unnamed facade'}}</div>
@endsection

@section('footer')
    <div class="footer">
        <img class="socials" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNzkuMzMzIiBoZWlnaHQ9IjIxLjk2NiIgdmlld0JveD0iMCAwIDQ3LjQ0OSA1LjgxMiI+PGcgc3Ryb2tlLXdpZHRoPSIuMDM1Ij48cGF0aCBkPSJNMi44NzUgNS43NTFhMi44NzUgMi44NzUgMCAxIDAgMC01Ljc1IDIuODc1IDIuODc1IDAgMCAwIDAgNS43NSIgZmlsbD0iI2M4YzdjNyIvPjxwYXRoIGQ9Ik0yLjc3NyA1LjgxMlYzLjY3aC0uNzJ2LS44MzRoLjcyVjIuMjJjMC0uNzE0LjQzNy0xLjEwMyAxLjA3NC0xLjEwMy4zMDUgMCAuNTY3LjAyMy42NDQuMDMzdi43NDdoLS40NDJjLS4zNDcgMC0uNDE0LjE2NC0uNDE0LjQwNnYuNTMzaC44MjdsLS4xMDguODM0aC0uNzE5djIuMTQyaC0uODYyIiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTkuODI1IDUuNzUxYTIuODc1IDIuODc1IDAgMSAwIDAtNS43NSAyLjg3NSAyLjg3NSAwIDAgMCAwIDUuNzUiIGZpbGw9IiNjOGM3YzciLz48cGF0aCBkPSJNMTIuMDMyIDEuNjE4YTEuNzczIDEuNzczIDAgMCAxLS41Mi4xNDYuOTI1LjkyNSAwIDAgMCAuMzk4LS41MTIgMS43ODEgMS43ODEgMCAwIDEtLjU3NS4yMjQuODk1Ljg5NSAwIDAgMC0uNjYxLS4yOTJjLS41IDAtLjkwNi40MTUtLjkwNi45MjYgMCAuMDczLjAwOC4xNDMuMDI0LjIxMWEyLjU1MyAyLjU1MyAwIDAgMS0xLjg2Ny0uOTY3LjkzNy45MzcgMCAwIDAtLjEyMi40NjVjMCAuMzIxLjE2LjYwNS40MDMuNzdhLjg4Ni44ODYgMCAwIDEtLjQxLS4xMTV2LjAxMWMwIC40NS4zMTIuODIzLjcyNi45MDhhLjg4Ni44ODYgMCAwIDEtLjQwOS4wMTYuOTEuOTEgMCAwIDAgLjg0Ni42NDMgMS43OSAxLjc5IDAgMCAxLTEuMzQuMzgzYy40LjI2My44NzYuNDE2IDEuMzg3LjQxNiAxLjY2NiAwIDIuNTc2LTEuNDEgMi41NzYtMi42MzQgMC0uMDQgMC0uMDgtLjAwMi0uMTIuMTc3LS4xMy4zMy0uMjkzLjQ1Mi0uNDc5IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTE2Ljc3NSA1Ljc1MWEyLjg3NSAyLjg3NSAwIDEgMCAwLTUuNzUgMi44NzUgMi44NzUgMCAwIDAgMCA1Ljc1IiBmaWxsPSIjYzhjN2M3Ii8+PHBhdGggZD0iTTE1Ljc2IDQuNTQ0aC0uNzYydi0yLjQ1aC43NjJ6bS0uMzgxLTIuNzg0YS40NDEuNDQxIDAgMSAxIDAtLjg4Mi40NDEuNDQxIDAgMCAxIDAgLjg4MnptMy4yMzIgMi43ODRoLS43NnYtMS4xOWMwLS4yODUtLjAwNS0uNjUtLjM5Ni0uNjUtLjM5NiAwLS40NTYuMzA5LS40NTYuNjI4djEuMjEyaC0uNzYydi0yLjQ1aC43M3YuMzM1aC4wMTFjLjEwMi0uMTkyLjM1LS4zOTYuNzItLjM5Ni43NzEgMCAuOTEzLjUwOC45MTMgMS4xNjh2MS4zNDMiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMjMuNzI0IDUuNzUxYTIuODc2IDIuODc2IDAgMSAwIDAtNS43NTEgMi44NzYgMi44NzYgMCAwIDAgMCA1Ljc1MSIgZmlsbD0iI2M4YzdjNyIvPjxwYXRoIGQ9Ik0yMy4wMzQgNC43OTFjLS43NDUgMC0xLjEwNS0uMzU0LTEuMTA1LS43MzYgMC0uMTg1LjA5My0uNDQ3LjM5Ni0uNjI4LjMxOC0uMTk1Ljc1LS4yMi45ODEtLjIzNy0uMDcyLS4wOTItLjE1NC0uMTktLjE1NC0uMzUgMC0uMDg3LjAyNi0uMTM4LjA1MS0uMi0uMDU3LjAwNS0uMTEzLjAxLS4xNjQuMDEtLjU0NCAwLS44NTMtLjQwNy0uODUzLS44MDggMC0uMjM3LjEwOC0uNS4zMjktLjY5LjI5My0uMjQyLjY5My0uMzA4Ljk3LS4zMDhoMS4wMTNsLS4zMzQuMjFoLS4zMThjLjExOC4wOTguMzY0LjMwMy4zNjQuNjk1IDAgLjM4LS4yMTUuNTYxLS40MzEuNzMxLS4wNjcuMDY3LS4xNDQuMTQtLjE0NC4yNTMgMCAuMTEzLjA3Ny4xNzQuMTMzLjIybC4xODUuMTQ1Yy4yMjYuMTkuNDMyLjM2NS40MzIuNzIgMCAuNDg1LS40NjguOTczLTEuMzUxLjk3M3ptMi43MzMtMi4wMzZoLS41MTZ2LjUxOGgtLjI1NXYtLjUxOGgtLjUxNHYtLjI1N2guNTE0di0uNTE1aC4yNTV2LjUxNWguNTE2di4yNTciIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMjMuNzU4IDEuOTg2YzAtLjM3LS4yMjEtLjk0Ny0uNjQ3LS45NDdhLjQ4LjQ4IDAgMCAwLS4zNi4xNy41OTQuNTk0IDAgMCAwLS4xMTMuMzhjMCAuMzQ1LjIuOTE3LjY0Mi45MTdhLjUyNi41MjYgMCAwIDAgLjM1LS4xNDRjLjExOC0uMTE5LjEyOC0uMjgzLjEyOC0uMzc2TTIzLjQ4IDMuMzRjLS4wNC0uMDA1LS4wNjYtLjAwNS0uMTE3LS4wMDUtLjA0NyAwLS4zMjQuMDEtLjU0LjA4Mi0uMTEzLjA0MS0uNDQxLjE2NS0uNDQxLjUzIDAgLjM2Ni4zNTQuNjI5LjkwMy42MjkuNDk0IDAgLjc1Ni0uMjM4Ljc1Ni0uNTU2IDAtLjI2NC0uMTctLjQwMi0uNTYtLjY4bTcuMTkzIDIuNDExYTIuODc1IDIuODc1IDAgMSAwIDAtNS43NSAyLjg3NSAyLjg3NSAwIDAgMCAwIDUuNzUiIGZpbGw9IiNjOGM3YzciLz48cGF0aCBkPSJNMzAuNjkzLjc5N2MtMS4yOTYgMC0xLjk1LjkyOS0xLjk1IDEuNzA0IDAgLjQ2OC4xNzguODg2LjU1OSAxLjA0MS4wNjIuMDI2LjExOS4wMDEuMTM3LS4wNjhsLjA1NS0uMjE5Yy4wMTktLjA2OC4wMTItLjA5Mi0uMDM5LS4xNTJhLjc4Ny43ODcgMCAwIDEtLjE4LS41MzVjMC0uNjg5LjUxNi0xLjMwNiAxLjM0Mi0xLjMwNi43MzMgMCAxLjEzNS40NDggMS4xMzUgMS4wNDUgMCAuNzg3LS4zNDggMS40NS0uODY0IDEuNDUtLjI4NiAwLS41LS4yMzYtLjQzLS41MjUuMDgxLS4zNDYuMjQtLjcxOC4yNC0uOTY4IDAtLjIyMy0uMTItLjQwOS0uMzY4LS40MDktLjI5MSAwLS41MjYuMzAyLS41MjYuNzA2IDAgLjI1Ny4wODcuNDMxLjA4Ny40MzFsLS4zNSAxLjQ4NmMtLjEwNS40NC0uMDE2Ljk4Mi0uMDA4IDEuMDM2LjAwNC4wMzIuMDQ2LjA0LjA2NC4wMTYuMDI3LS4wMzUuMzc1LS40NjQuNDkzLS44OTNhODkuNCA4OS40IDAgMCAwIC4xOTEtLjc0OWMuMDk1LjE4LjM3Mi4zNC42NjYuMzQuODc3IDAgMS40NzItLjggMS40NzItMS44NjkgMC0uODA5LS42ODUtMS41NjItMS43MjYtMS41NjIiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMzcuNjIzIDUuNzUxYTIuODc1IDIuODc1IDAgMSAwIDAtNS43NSAyLjg3NSAyLjg3NSAwIDAgMCAwIDUuNzUiIGZpbGw9IiNjOGM3YzciLz48cGF0aCBkPSJNMzkuMDM3IDIuNTk4aC0uMzJjLjAyMy4wODguMDM3LjE4MS4wMzcuMjc4IDAgLjYxMy0uNTA2IDEuMTExLTEuMTMgMS4xMTFhMS4xMjEgMS4xMjEgMCAwIDEtMS4xMzEtMS4xMTFjMC0uMDk3LjAxMy0uMTkuMDM3LS4yNzhoLS4zMnYxLjUyOGEuMTQuMTQgMCAwIDAgLjE0MS4xMzloMi41NDRhLjE0LjE0IDAgMCAwIC4xNDItLjEzOXptMC0uOTczYS4xNC4xNCAwIDAgMC0uMTQyLS4xNGgtLjQyNGEuMTQuMTQgMCAwIDAtLjE0LjE0di40MTdhLjE0LjE0IDAgMCAwIC4xNC4xMzloLjQyNGEuMTQuMTQgMCAwIDAgLjE0Mi0uMTR6bS0xLjQxNC41NTZhLjcuNyAwIDAgMC0uNzA2LjY5NS43LjcgMCAwIDAgLjcwNi42OTRjLjM5IDAgLjcwNy0uMzExLjcwNy0uNjk0YS43LjcgMCAwIDAtLjcwNy0uNjk1bTEuNDE0IDIuNUgzNi4yMWEuNDIuNDIgMCAwIDEtLjQyNC0uNDE2di0yLjc4YzAtLjIzLjE5LS40MTYuNDI0LS40MTZoMi44MjdhLjQyLjQyIDAgMCAxIC40MjQuNDE3djIuNzc5YS40Mi40MiAwIDAgMS0uNDI0LjQxNyIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik00NC41NzMgNS43NTFhMi44NzYgMi44NzYgMCAxIDAgMC01Ljc1MSAyLjg3NiAyLjg3NiAwIDAgMCAwIDUuNzUxIiBmaWxsPSIjYzhjN2M3Ii8+PHBhdGggZD0iTTQ2Ljc5MyAxLjk4cy0uMDQ0LS4zMDctLjE4LS40NDNjLS4xNzItLjE3OS0uMzY1LS4xOC0uNDU0LS4xOS0uNjM0LS4wNDUtMS41ODUtLjA0NS0xLjU4NS0uMDQ1aC0uMDAycy0uOTUgMC0xLjU4NS4wNDVjLS4wODkuMDEtLjI4Mi4wMTEtLjQ1NC4xOS0uMTM2LjEzNi0uMTguNDQ0LS4xOC40NDRzLS4wNDYuMzYyLS4wNDYuNzI0di4zNGMwIC4zNjIuMDQ2LjcyNC4wNDYuNzI0cy4wNDQuMzA4LjE4LjQ0NGMuMTcyLjE3OC4zOTkuMTczLjUuMTkxLjM2Mi4wMzUgMS41NC4wNDUgMS41NC4wNDVzLjk1Mi0uMDAxIDEuNTg2LS4wNDZjLjA5LS4wMS4yODItLjAxMi40NTUtLjE5LjEzNS0uMTM2LjE4LS40NDQuMTgtLjQ0NHMuMDQ1LS4zNjIuMDQ1LS43MjV2LS4zMzljMC0uMzYyLS4wNDUtLjcyNC0uMDQ1LS43MjQiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNNDQuMTA1IDMuNDU2VjIuMTk5bDEuMjI1LjYzLTEuMjI1LjYyNyIgZmlsbD0iI2M4YzdjNyIvPjwvZz48L3N2Zz4="/>

        <img class="logo" src="data:image/png;base64,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"/>

        <div class="contacts">orbithomes.com.au&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;1300 ORBITHOMES&nbsp;&nbsp;|&nbsp;&nbsp;1300 672 484</div>

        <div class="disclaimer">
            Subject to constraints and developer guidelines. Plan, prices, speciﬁ cations and conditions of of ers are
            subject to change without notice. Dimensions and house plans shown are
            guide only and may vary subject to ﬁ nal drawings. Façade illustrations are used as a guide only, excludes
            feature stone and tiles. Facade options are available at additional cost.
        </div>
    </div>
@endsection

@section('facades')
    <div class="facades">
        <div class="facade" style="background-image: url('{{$facade->largeImage}}')"></div>
        {{--<div class="facade default" style="background-image: url('{{url('/images/orbit-barklay_entry_talent.jpg', [], true)}}')"></div>--}}
    </div>
@endsection

@section('floorplans')
<div class="floorplans">
    @if($house->floorplans()->exists())
        @foreach($house->floorplans as $floorplan)
            <div class="floorplan" style="background-image: url('{{$floorplan->largeImage}}')"></div>
        @endforeach
    @endif
</div>
@endsection

@section('house-data')
    @if($house->story > 1)
        <div class="facade-and-floorplan-double">
            @yield('floorplans')
            @yield('facades')
        </div>
    @else
        <div class="facade-and-floorplan-single">
            @yield('facades')
            @yield('floorplans')
        </div>
    @endif
@endsection

@section('details')
    <div class="header">{{$house->title}}</div>
    <div class="details">
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
                        <li>{{$inclusion}}</li>
                    @endforeach
                </ul>
            @endif
        @endif
            <ul class="house-attributes">
                <li>TO SUIT LOT WIDTH<span class="value">{{$house->depth}} m</span></li>
                <li>TOTAL AREA
                    @if($house->areaSize > 0)
                        <span class="value">{{round($house->areaSize)}}
                            @if($house->areaSizeUnits == 'm2')m<sup>2</sup>
                            @else
                                {{$house->areaSizeUnits}}
                            @endif
                        </span>
                    @endif</li>
                <li>HOUSE LENGTH <span class="value">{{$house->depth}} m</span></li>
                <li>HOUSE WIDTH <span class="value">{{$house->width}} m</span></li>
            </ul>
    </div>

@endsection

@section('content')
    <div class="page full-a4-height">
        @yield('header')
        @yield('house-options')
        <div class="content">
            @yield('house-data')
            @yield('details')
            @yield('footer')
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