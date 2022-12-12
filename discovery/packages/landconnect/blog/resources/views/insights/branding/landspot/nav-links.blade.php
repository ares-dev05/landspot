@if (Auth::guest())
    {{--<li>
        <a class="{{Route::is('register') ? 'active' : ''}}"
           href="{{ route('register', [], false) }}">Register</a></li>--}}
    <li>
        <a href="{{ UrlHelper::secureRoutePath('login') }}">Log in</a></li>
@else
    <li><a href="{{ route('landspot.my-estates', [], false) }}">My Dashboard</a></li>

    <li>
        <a href="{{UrlHelper::logoutUrl()}}">
            <span class="menu-title">Log Out</span>
        </a>
    </li>
@endif
<li><a href="mailto:support@landspot.com.au">Contact</a></li>