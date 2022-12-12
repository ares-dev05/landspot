@extends('lotmix.layouts.lotmix')

@section('content')
    <div class="blog-container">
        <div class="scotch-panel">
            <span class="overlay"></span>
            <nav class="app-nav" role="navigation">
                <div class="nav-header">
                    <a class="active logo" href="/" title="Lotmix">Lotmix</a>
                    <ul class="left-nav">
                        <li class="nav-item">
                            <a class="{{ (request()->is('floorplans*')) ? 'active' : '' }}"
                               href="{{ UrlHelper::securePath('/floorplans') }}">Floorplans</a>
                        </li>
                        <li class="nav-item">
                            <a class="{{ (request()->is('land-for-sale*')) ? 'active' : '' }}"
                               href="{{ UrlHelper::securePath('/land-for-sale/communities/') }}">Find Land</a>
                        </li>
                        <li class="nav-item">
                            <a class="{{ (request()->is('land-estates*')) ? 'active' : '' }}"
                               href="{{ UrlHelper::securePath('/land-estates/vic/') }}">New Land Estates</a>
                        </li>
                        <li class="nav-item">
                            <a class="{{ (request()->is('sunpather*')) ? 'active' : '' }}"
                               href="{{ UrlHelper::securePath('/sunpather') }}">Sunpather</a>
                        </li>
                        <li class="nav-item">
                            <a class="{{ (request()->is('insights*')) ? 'active' : '' }}"
                               href="{{ UrlHelper::securePath('/insights') }}">Insights</a>
                        </li>
                    </ul>
                </div>
            </nav>
            <nav class="app-nav app-nav-mobile" role="navigation">
                <div class="nav-header">
                    <div class="lotmix-mobile-menu lotmix-public-toggle-button">
                        <span class="active logo" title="Lotmix"></span>
                        <i class="fas fa-caret-down"></i>
                    </div>
                </div>
            </nav>
            <nav class="side-menu">
                <div class="header">MENU<i class="fal fa-times lotmix-public-toggle-button"></i></div>
                <ul class="slide-main-nav">
                    <li class="nav-item">
                        <a class="{{ (request()->is('/')) ? 'active' : '' }}"
                           href="{{ UrlHelper::securePath('/') }}">
                            <i class="landspot-icon ic-my-lotmix"
                               aria-hidden="true"></i>Home
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="{{ (request()->is('floorplans*')) ? 'active' : '' }}"
                           href="{{ UrlHelper::securePath('/floorplans') }}">
                            <i class="landspot-icon ic-floorplans"
                               aria-hidden="true"></i>Floorplans
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="{{ (request()->is('land-for-sale*')) ? 'active' : '' }}"
                           href="{{ UrlHelper::securePath('/land-for-sale/communities/') }}">
                            <i class="landspot-icon ic-find-land"
                               aria-hidden="true"></i>
                            Find Land
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="{{ (request()->is('land-estates*')) ? 'active' : '' }}"
                           href="{{ UrlHelper::securePath('/land-estates/vic') }}">
                            <i class="landspot-icon ic-floorplans"
                               aria-hidden="true"></i>New Land Estates
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="{{ (request()->is('sunpather*')) ? 'active' : '' }}"
                           href="{{ UrlHelper::securePath('/sunpather') }}">
                            <i class="landspot-icon cube"
                               aria-hidden="true"></i>
                            Sunpather
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="{{ (request()->is('insights*')) ? 'active' : '' }}"
                           href="{{ UrlHelper::securePath('/insights') }}">
                            <i class="landspot-icon blueprint"
                               aria-hidden="true"></i>Insights
                        </a>
                    </li>
                </ul>
            </nav>
            @yield('body-content')
        </div>
    </div>
@endsection

@section('body-scripts')
    <script>
        const toggleMenuButtons = document.getElementsByClassName('lotmix-public-toggle-button');

        function toggleMenu() {
            document.querySelector('.scotch-panel').classList.toggle('scotch-is-showing');
        }

        Array.from(toggleMenuButtons).forEach(function (button) {
            button.addEventListener('click', toggleMenu);
        });
    </script>
    @yield('scripts')
@endsection