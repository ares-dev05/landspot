<nav class="navbar navbar-default sticky-top navbar-expand-md navbar-light bg-light">
    <div class="container align-items-start">
        <a class="navbar-brand" href="/"></a>


    @if(Route::is('register', 'homepage') || Route::currentRouteName() == null)
        <!-- Collapsed Hamburger -->
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
        @endif
        @if(Route::is('register', 'homepage') || Route::currentRouteName() == null)
            <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
                <!-- Right Side Of Navbar -->
                <ul class="navbar-nav navbar-right">
                    <!-- Authentication Links -->
                    @include('blog::insights.branding.'.$theme['brand'].'.nav-links')
                </ul>
            </div>
        @endif
    </div>
</nav>

