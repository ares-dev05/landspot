@extends('layouts.landspot')

@section('meta')
    <meta name="robots" content="index, follow" />
@endsection

@section('styles')
    <link href="{{ mix('css/landspot-homepage.css') }}" rel="stylesheet">
@endsection

@section('content')
    <div class="container">
        <div class="row helping-builders">
            <div class="col-lg-5 col-lg-offset-0 col-md-5 col-md-offset-0 col-sm-6 col-sm-offset-1 col-xs-6">
                <h1>Helping builders and developers connect and communicate.</h1>

                <div class="btn-register">
                    <a href="mailto:support@landspot.com.au" class="btn btn-primary">
                        Enquire now
                    </a>
                </div>
            </div>
            <div class="col-lg-7 col-md-7 col-sm-8 col-xs-6 illustration">
            </div>
        </div>
    </div>
    <div class="unprecedented-access">
        <div class="container">
            <div class="row">
                <div class="col-lg-5 col-lg-offset-0 col-md-5 col-md-offset-0 col-sm-6 col-sm-offset-1 col-xs-6">
                    <h2>Unprecedented access to the information you need to know.</h2>

                    <p>
                        In the Australian House and Land industry, information is everything. We
                        connect builders and developers empowering professionals to communicate,
                        collaborate, and make smarter choices.
                    </p>
                </div>
                <div class="col-lg-7 col-md-7 col-sm-8 col-xs-6">
                    <div class="sketch-laptop"></div>
                </div>
            </div>
        </div>
    </div>
    <div class="for-builders">
        <div class="container">
            <div class="row">
                <div class="col-lg-5 col-lg-offset-0 col-md-6 col-md-offset-0 col-sm-6 col-sm-offset-1 col-xs-6">
                    <h2>For Builders</h2>

                    <p>
                        Never get stuck presenting outdated information again. Access the latest
                        information from land developments across your state, while providing
                        unparalleled service for your clients.
                    </p>
                </div>
                <div class="col-lg-6 col-lg-offset-1 col-md-6 col-md-offset-0 col-sm-6 col-sm-offset-1 col-xs-6 info">
                    <div class="flex-left">
                        <div class="discover-land-icon"></div>
                        <div>
                            <h3>Discover Land</h3>
                            <p>Search for available lots of land, find the perfect estate for your clients' needs -
                                faster</p>
                        </div>
                    </div>
                    <div class="flex-left">
                        <div class="documentation-icon"></div>
                        <div>
                            <h3>Documentation</h3>
                            <p>Access land estate documentation. Including guidelines, plans of subdivision
                                and engineering</p>
                        </div>
                    </div>
                    <div class="flex-left">
                        <div class="live-information-icon"></div>
                        <div>
                            <h3>Live Collaboration</h3>
                            <p>Live chat between builder and developer sales consultants</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="for-developers">
        <div class="container">
            <div class="row">
                <div class="col-lg-6 col-lg-offset-0 col-md-7 col-md-offset-0 col-sm-6 col-sm-offset-1 col-xs-6">
                    <h2>For Developers</h2>

                    <p>
                        Discussing builder options is a critical talking point during any sales
                        conversation. Easily generate beautifully branded PDF design flyers for every
                        builder, allowing you to personalise every customer experience.
                    </p>
                </div>
                <div class="clearfix"></div>
                <div class="col-lg-4 col-lg-offset-0 col-md-4 col-md-offset-0 col-sm-6 col-sm-offset-1 col-xs-6">
                    <div class="price-lists-icon"></div>
                    <div>
                        <h3>Share Price Lists</h3>
                        <p>
                            Control a live price list for builders to access.
                            Seamlessly manage your lot availability and construction opportunities in real-time.
                        </p>
                    </div>
                </div>
                <div class="col-lg-4 col-lg-offset-0 col-md-4 col-md-offset-0 col-sm-6 col-sm-offset-1 col-xs-6">
                    <div class="industry-catalogue-icon"></div>
                    <div>
                        <h3>Industry Catalogue</h3>
                        <p>
                            Access participating builder's floorplan catalogues;
                            including 3D walkthroughs. Take your pick from industry-leading portfolios.
                        </p>
                    </div>
                </div>
                <div class="col-lg-4 col-lg-offset-0 col-md-4 col-md-offset-0 col-sm-6 col-sm-offset-1 col-xs-6">
                    <div class="builder-brochures-icon"></div>
                    <div>
                        <h3>Builder Flyers</h3>
                        <p>
                            Print builder flyers and receive house and land packages for your estate. Find
                            the perfect builder to make your clients vision a reality.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="get-involved">
        <div class="container">
            <div class="row">
                <div class="col-lg-12 col-md-12 col-sm-8 col-xs-6">
                    <h2>Get Involved</h2>
                </div>
                <div class="col-lg-5 col-md-6 col-md-offset-0 col-sm-6 col-sm-offset-1 col-xs-6">
                    <h3>For Builders</h3>
                    <p>
                        Gain access to developers' land availability and discover construction
                        opportunities the moment they go live. Share your floorplan catalogue with land
                        developers.
                    </p>

                    <div class="btn-register">
                        <a href="mailto:support@landspot.com.au" class="btn btn-primary">
                            Enquire as a builder
                        </a>
                    </div>
                </div>
                <div class="col-lg-5 col-lg-offset-1 col-md-6 col-md-offset-0 col-sm-6 col-sm-offset-1 col-xs-6 get-involved-developer">
                    <h3>For Developers</h3>
                    <p>
                        Manage and share information including your land availability, pricing, and
                        estate documentation while gaining access to builders catalogues.
                    </p>

                    <div class="btn-register">
                        <a href="mailto:support@landspot.com.au" class="btn btn-primary">
                            Enquire as a developer
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="container">
        <div class="premium-membership">
            <div class="row">
                <div class="col-lg-10 col-lg-offset-1 col-md-10 col-md-offset-1 col-sm-6 col-sm-offset-1 col-xs-4 col-xs-offset-1">
                    <h2>Keen to chat, collaborate or interested in our products?
                        We'd love to hear from you.</h2>
                </div>

                <div class="col-lg-10 col-lg-offset-1 col-md-10 col-md-offset-1 col-sm-4 col-sm-offset-2 col-xs-6">
                    <p>
                    </p>
                </div>
                <div class="clearfix"></div>
            </div>

            <form class="form-horizontal" method="POST" action="{{ route('membership', [], false) }}">
                {{ csrf_field() }}
                <div class="form-group">
                    <div class="col-lg-4 col-lg-offset-1 col-md-4 col-md-offset-1 col-sm-6 col-sm-offset-1 col-xs-4 col-xs-offset-1">
                        <input type="text" class="form-control" name="name"
                               value="" placeholder="Name"
                               required>
                    </div>
                    <div class="col-lg-4 col-lg-offset-0 col-md-3 col-md-offset-0 col-sm-6 col-sm-offset-1 col-xs-4 col-xs-offset-1">
                        <input type="email" class="form-control email" name="email"
                               value=""
                               placeholder="E-mail address" required>
                    </div>
                    <div class="btn-register">
                        <button type="submit" class="btn btn-primary">
                            Contact Us
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
@endsection

@section('body-scripts')
    <script src="{{ mix('js/app.js') }}"></script>
@endsection
