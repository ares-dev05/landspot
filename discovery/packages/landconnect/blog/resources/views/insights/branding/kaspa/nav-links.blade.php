@if (Auth::getUser())
    <li><a href="{{route('orders', ['name' => 'my-orders'])}}">My
            Dashboard</a>
    </li>
@endif

<li><a href="/#overview">Overview</a></li>
<li><a href="/#benefits">Benefits</a></li>
<li><a href="/#features">Features</a></li>
<li><a href="/#pricing">Pricing</a></li>
<li><a href="/#contact">Contact</a></li>

@if (Auth::guest())
    <li><a class="login-link" href="{{ UrlHelper::secureRoutePath('login') }}">LOG IN</a></li>
@else
    <li>
        <a class="login-link" href="{{UrlHelper::logoutUrl()}}">
            LOG OUT
        </a>
    </li>
@endif