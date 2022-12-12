<style type="text/css">
    :root {
        --main-color: {{$theme['color']}};
    }
    @if($theme['brand'] == 'kaspa')
        .navbar-default .navbar-brand {
            width: 116px;
            height: 34px;
        }
    @elseif($theme['brand'] == 'landconnect')
        .navbar-default .navbar-brand {
            width: 206px;
            height: 22px;
        }

        footer .container {
            padding-bottom: 70px;
        }

        footer .container .footer-logo {
            width: 167.5px;
            height: 18px;
        }
    @endif
    .navbar-default .navbar-brand {
        background: url({{$theme['logo']}}) no-repeat bottom left/contain;
    }
    .navbar-default .navbar-nav > li > a.active {
        color: var(--main-color);
    }
    .navbar-default .navbar-nav > li > a.login-link {
        color: var(--main-color);
        border: 1px solid var(--main-color);
    }
    .navbar-default .navbar-nav > li > a.login-link:hover {
        background: var(--main-color);
    }
    footer .container .footer-logo {
        background: url({{$theme['logo']}}) no-repeat center left/contain;
    }

    @media (max-width: 1200px) {
        @if($theme['brand'] == 'landconnect')
        footer .container {
            padding-bottom: 123px;
        }

        footer .container .footer-logo {
            width: 167.5px;
            height: 28px;
        }
        @endif
    }

    @media (max-width: 992px) {
        @if($theme['brand'] == 'landconnect')
        .navbar-default .navbar-brand {
            height: 19px;
            width: 176px;
        }
        footer .container {
            padding-bottom: 130px;
        }

        footer .container .footer-logo {
            width: 159px;
        }
        @endif
    }

    @media (max-width: 760px) {
        @if($theme['brand'] == 'landconnect')
        footer .container .footer-logo {
            background-size: 159px;
            width: 100%;
            background-position-x: center;
        }
        @endif
    }



</style>