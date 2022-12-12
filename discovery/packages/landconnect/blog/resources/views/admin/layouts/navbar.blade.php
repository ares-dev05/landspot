<nav class="navbar navbar-dark bg-dark fixed-top navbar-expand-lg">
    <div class="container">
        <!-- Branding Image -->

        <a class="navbar-brand" href="/insights" title="{{config('app.name', 'Laravel')}}">Insights</a>

        <!-- Collapsed Hamburger -->
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarCollapse">
            @include('blog::admin.layouts.sidebar')
        </div>
    </div>
</nav>

