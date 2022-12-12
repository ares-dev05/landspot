<nav class="navbar navbar-default navbar-static-top">
    <div class="navbar-header">
        <div class="container">
            <div class="row">
                <div class="col-xs-6 col-sm-8 col-md-12 col-lg-12">

                @if(Route::is('register', 'terms-of-use') || Route::currentRouteName() == null)
                    <!-- Collapsed Hamburger -->
                        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse"
                                data-target="#app-navbar-collapse">
                            <span class="sr-only">Toggle Navigation</span>
                            <span class="icon-bar"></span>
                            <span class="icon-bar"></span>
                            <span class="icon-bar"></span>
                        </button>
                @endif

                <!-- Branding Image -->
                    <a class="navbar-brand" href="/"></a>

                    <div class="clearfix hidden-md hidden-lg"></div>
                    @if(Route::is('register', 'terms-of-use') ||
                    Route::currentRouteName() == null || Route::currentRouteName() == 'homepage')
                        <div class="collapse navbar-collapse" id="app-navbar-collapse">
                            <!-- Right Side Of Navbar -->
                            <ul class="nav navbar-nav navbar-right">
                                <!-- Authentication Links -->
                                @if (Auth::guest())
                                    {{--<li>--}}
                                        {{--<a class="{{Route::is('register') ? 'active' : ''}}"--}}
                                           {{--href="{{ route('register', [], false) }}">Register</a></li>--}}
                                    <li>
                                        <a href="{{ UrlHelper::secureRoutePath('login') }}">Log in</a></li>
                                @else
                                    @php
                                        /** @var \App\Models\User $user */
                                        $user         = auth()->user();
                                        $dashboardUri = $user ? $user->getBaseRoute() : null;
                                    @endphp

                                    @if($dashboardUri)
                                        <li><a href="{{$dashboardUri}}">My Dashboard</a></li>
                                    @endif

                                    <li>
                                        <a href="{{ UrlHelper::logoutUrl() }}">
                                            <span class="menu-title">Log Out</span>
                                        </a>
                                    </li>
                                @endif
                                <li><a href="mailto:support@landspot.com.au">Contact</a></li>
                            </ul>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</nav>

