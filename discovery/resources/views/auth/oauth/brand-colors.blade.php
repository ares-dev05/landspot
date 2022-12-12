<style type="text/css">
    :root {
        --main-color: {{$theme['color']}};
    }
    .sso-container .navbar-default .navbar-brand {
        background: url({{$theme['logo']}}) no-repeat bottom left/contain;
    }
    @if($brand == 'landspot')
            .sso-container {
        background: var(--main-color);
    }
    .sso-container .navbar-default .navbar-brand {
        background-size: contain;
        width: 145px;
    }

    #wrapper {
        background: var(--main-color);
    }
    #wrapper .container .get-started {
        color: #fff;
    }
    #wrapper .container .get-started .btn-link {
        font-size: 14px;
        padding: 0;
        text-decoration: underline;
        color: #fff;
    }
    @endif
</style>