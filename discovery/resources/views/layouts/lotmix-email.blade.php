<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>{{ config('app.name') }}</title>
    <style type="text/css">
        /* Base */

        body, body *:not(html):not(style):not(br):not(tr):not(code) {
            font-family: Avenir, Helvetica, sans-serif;
            box-sizing: border-box;
        }

        body {
            background-color: #f5f8fa;
            color: #74787E;
            height: 100%;
            hyphens: auto;
            line-height: 1.4;
            margin: 0;
            -moz-hyphens: auto;
            -ms-word-break: break-all;
            width: 100% !important;
            -webkit-hyphens: auto;
            -webkit-text-size-adjust: none;
            word-break: break-all;
            word-break: break-word;
        }

        p,
        ul,
        ol,
        blockquote {
            line-height: 1.4;
            text-align: left;
        }

        a {
            color: #3869D4;
            text-decoration: none;
        }

        a img {
            border: none;
        }

        p {
            color: #555555;
            font-size: 18px;
            line-height: 1.5em;
            margin-top: 0;
            margin-bottom: 8px;
            text-align: center;
        }

        img {
            max-width: 100%;
        }

        .content {
            margin: 0;
            background-color: #f5f8fa;
            padding: 0;
            width: 100%;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
            -premailer-width: 100%;
        }

        .header {
            padding: 5px 0 15px;
            text-align: left;
            background-color: #FFFFFF;
        }

        .header-wrapper {
            max-width: 640px;
            min-width: 320px;
            display: table;
            width: 100%;
            margin: 0 auto !important;
        }

        .header a {
            text-align: right;
            overflow-wrap: break-word;
            word-wrap: break-word;
            word-break: break-word;
            display: table-cell;
            vertical-align: middle;
            font-size: 14px;
            color: #000000;
            font-family: inherit;
            font-weight: bolder;
            text-decoration: none;
        }

        .header .lotmix-header-logo {
            display: table-cell;
        }

        .body {
            background-color: #e8e8e8;
            border-bottom: 1px solid #e8e8e8;
            border-top: 1px solid #e8e8e8;
            margin: 0;
            padding: 0;
            width: 100%;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
            -premailer-width: 100%;
        }

        .inner-body {
            margin: 30px auto 30px;
            padding: 0;
            min-width: 320px;
            max-width: 640px;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
            -premailer-width: 640px;
        }

        .subcopy {
            border-top: 1px solid #EDEFF2;
            margin-top: 25px;
            padding-top: 25px;
        }

        .subcopy p {
            font-size: 12px;
        }

        .footer-wrapper {
            background-color: #2f2a2a;
            padding-top: 20px;
            padding-bottom: 30px;
        }

        .footer {
            margin: 0 auto;
            min-width: 320px;
            padding-right: 20px;
            padding-left: 20px;
            line-height: normal;
            max-width: 640px;
            overflow-wrap: break-word;
            word-wrap: break-word;
            word-break: break-word;
            background-color: transparent;
        }

        .footer-text {
            color: #ffffff !important;
            border-top: 1px solid #404D53;
            margin-top: 5px;
            padding-top: 20px;
            word-break: break-word;
            font-size: 13px;
            text-align: left;
        }

        .table table {
            margin: 30px auto;
            width: 100%;
            -premailer-cellpadding: 0;
            -premailer-cellspacing: 0;
            -premailer-width: 100%;
        }

        .table th {
            border-bottom: 1px solid #EDEFF2;
            padding-bottom: 8px;
            margin: 0;
        }

        .table td {
            color: #74787E;
            font-size: 15px;
            line-height: 18px;
            padding: 10px 0;
            margin: 0;
        }

        .white-wrapper {
            padding: 16px;
            background-color: #FFFFFF;
        }

        .main-image {
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
            border: 0;
            margin: 0 auto;
            height: auto;
            width: 100%;
            max-width: 350px;
            padding: 25px 55px;
            display: block;
        }

        .welcome-text {
            font-size: 28px;
            color: #2b3940;
            line-height: 1.5;
            margin-top: 10px;
            word-break: break-word;
            text-align: center;
        }

        .features-header {
            font-size: 25px;
            margin-top: 80px;
            color: #2b3940;
            text-align: center;
        }

        .btn-wrapper {
            text-align: center;
        }

        .feature-block {
            padding: 16px;
            background-color: #FFFFFF;
        }

        .feature-image {
            float: left;
            background-color: #e4e4e4;
            padding: 20px 46px;
            margin-right: 30px;
        }

        .feature-title {
            display: inline-block;
            font-size: 13px;
            padding: 4px 10px;
            color: #000000;
            background-color: #e4e4e4;
            line-height: 24px;
            margin: 0;
            font-weight: 900;
        }

        .feature-text {
            font-size: 19px;
            color: #2b3940;
            font-weight: bold;
            margin-top: 10px;
            text-align: left;
        }

        .feature-image img {
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            width: 100%;
            max-width: 75px;
            display: block;
        }

        .button {
            border-radius: 3px;
            box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);
            color: #FFF !important;
            display: inline-block;
            margin-bottom: 16px;
            transition: 0.3s;
            text-decoration: none;
            -webkit-text-size-adjust: none;
        }

        .button:hover {
            box-shadow: 0 5px 10px rgba(0, 0, 0, 0.26);
        }

        .empty-row td {
            height: 30px;
            word-break: break-word;
            vertical-align: top;
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
        }

        .button-green {
            background-color: #62c66b;
            border-top: 14px solid #62c66b;
            border-right: 28px solid #62c66b;
            border-bottom: 14px solid #62c66b;
            border-left: 28px solid #62c66b;
            font-size: 18px;
            font-weight: bold;
        }

        @media only screen and (max-width: 600px) {
            .inner-body {
                width: 100% !important;
            }

            .footer {
                width: 100% !important;
            }

            .feature-block {
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .feature-image {
                margin: 0 0 10px;
            }
        }

        @media only screen and (max-width: 500px) {
            .button {
                width: 100% !important;
            }
        }
    </style>
</head>
<body>


<table class="content" width="100%" cellpadding="0" cellspacing="0">
    <tr>
        @yield('header')
    </tr>

    <!-- Email Body -->
    <tr>
        <td class="body">
            <table class="inner-body" width="640" cellpadding="0" cellspacing="0">
                <!-- Body content -->
                <tr>
                    @yield('content')
                </tr>
                <tr>
                    <td>
                        <h2 class="features-header">@yield('feature-header', 'What you can do now')</h2>
                    </td>
                </tr>
                <tr>
                    <td class="feature-block">
                        <div class="feature-image">
                            <img alt="Paper image"
                                 src="{{$message->embed(public_path() . '/images/lotmix/icons/paper.png')}}"
                                 title="Paper image"
                                 width="75">
                        </div>
                        <h3 class="feature-title">STAY ORGANISED</h3>
                        <p class="feature-text"><b>Be sent and store quotes, offers and site plans in one secure
                                location.</b></p>
                    </td>
                </tr>
                <tr class="empty-row">
                    <td></td>
                </tr>
                <tr>
                    <td class="feature-block">
                        <div class="feature-image">
                            <img alt="Paper image"
                                 src="{{$message->embed(public_path() . '/images/lotmix/icons/lightbulb.png')}}"
                                 title="Paper image"
                                 width="75">
                        </div>
                        <h3 class="feature-title">MATCH HOUSE AND LAND EASILY</h3>
                        <p class="feature-text"><b>Match house to land with a single click.</b></p>
                    </td>
                </tr>
                <tr class="empty-row">
                    <td></td>
                </tr>
                <tr>
                    <td class="feature-block">
                        <div class="feature-image">
                            <img alt="Paper image"
                                 src="{{$message->embed(public_path() . '/images/lotmix/icons/informed.png')}}"
                                 title="Paper image"
                                 width="75">
                        </div>
                        <h3 class="feature-title">BECOME MORE INFORMED</h3>
                        <p class="feature-text"><b>Access exclusive content to help navigate your building journey.</b>
                        </p>
                    </td>
                </tr>
                <tr class="empty-row">
                    <td></td>
                </tr>
                <tr>
                    <td class="feature-block">
                        <div class="feature-image">
                            <img alt="Paper image"
                                 src="{{$message->embed(public_path() . '/images/lotmix/icons/home.png')}}"
                                 title="Paper image"
                                 width="75">
                        </div>
                        <h3 class="feature-title">SHORTLIST</h3>
                        <p class="feature-text"><b>Maintain a shortlist with your favourite floorplans and lots.</b></p>
                    </td>
                </tr>
                <tr class="empty-row">
                    <td></td>
                </tr>
                <tr>
                    <td>
                        <div class="btn-wrapper">
                            @if(isset($invitationToken))
                                <a href="{{ route('register-invite', ['token' => $invitationToken]) }}"
                                   class="button button-green" target="_blank">Get Started Now</a>
                            @else
                                <a href="{{ route('lotmix-login') }}" class="button button-green"
                                   target="_blank">Login</a>
                            @endif
                        </div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>

    <tr>
        <td class="footer-wrapper">
            <div class="footer">
                <img src="{{$message->embed(public_path() . '/images/lotmix/lotmix_logo.png')}}"
                     class="lotmix-logo"
                     alt="Lotmix"
                     height="17">
                <p class="footer-text">You are receiving this email as a builder, land agent or land developer you are
                    in discussions with
                    invited you to join Lotmix to assist in making your home buying journey easier. They will be able to
                    send your documentation, site plans and provide you access to their information via the
                    Lotmix.com.au platform.</p>
                <p class="footer-text">Don't want to recive emails from us?
                    <a href="{{route('unsubscribe',['hash' => $hash])}}">Unsubscribe</a>
                </p>
            </div>
        </td>
    </tr>
</table>
</body>
</html>
