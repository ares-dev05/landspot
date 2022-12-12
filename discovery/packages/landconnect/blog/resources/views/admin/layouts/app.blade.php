<!doctype html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    @php
        $title = isset($_SERVER['HTTP_X_INSIGHTS_URL']) && strpos($_SERVER['HTTP_X_INSIGHTS_URL'], 'landconnect', 0) !== 0
                ? 'Landconnect - Insights'
                : config('app.name', 'Landconnect') . ' - Insights';
    @endphp
    <title>{{ $title }}</title>

    <!-- Styles -->
    <link href="{{ mix('/insights/css/blog-admin.css') }}" rel="stylesheet">
    <link href="{{ mix('/insights/vendor/summernote/summernote-bs4.css') }}" rel="stylesheet">
</head>
<body class="admin-body bg-dark">
@include('blog::admin.layouts.navbar')

<div class="content-wrapper bg-light">
    <div class="container-fluid">
        <div class="row">
            <div class="col">
                @include('blog::admin.layouts.alerts')

                <div class="card">
                    <div class="card-body">
                        @yield('content')
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Scripts -->
<script src="https://use.fontawesome.com/0dcb768cc0.js"></script>
<script src="{{ secure_url(mix('js/manifest.js')) }}"></script>
<script src="{{ secure_url(mix('js/vendor.js')) }}"></script>
<script src="{{ secure_url(mix('/insights/js/blog-app.js')) }}"></script>
<script src="{{ secure_url(mix('/insights/js/blog-admin.js')) }}"></script>
</body>
</html>
