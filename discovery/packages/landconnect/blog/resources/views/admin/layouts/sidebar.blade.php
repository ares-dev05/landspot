<ul class="navbar-nav navbar-sidenav">
    <li class="nav-item" role="presentation" data-toggle="tooltip" data-placement="right" title="Posts">
        <a class="nav-link {{ request()->route()->named('posts.*') ? 'active' : '' }}" href="{{ route('posts.index', [], false) }}">
            <i class="fa fa-file-text" aria-hidden="true"></i>&nbsp;
            <span class="nav-link-text">Posts</span>
        </a>
    </li>

    <li class="nav-item" role="presentation" data-toggle="tooltip" data-placement="right" title="Topics">
        <a class="nav-link {{ request()->route()->named('topics.*') ? 'active' : '' }}" href="{{ route('topics.index', [], false) }}">
            <i class="fa fa-file-text" aria-hidden="true"></i>&nbsp;
            <span class="nav-link-text">Topics</span>
        </a>
    </li>

    <li class="nav-item" role="presentation" data-toggle="tooltip" data-placement="right" title="Media">
        <a class="nav-link {{ request()->route()->named('media.*') ? 'active' : '' }}" href="{{ route('media.index', [], false) }}">
            <i class="fa fa-file" aria-hidden="true"></i>&nbsp;
            <span class="nav-link-text">Media</span>
        </a>
    </li>
</ul>

<ul class="navbar-nav sidenav-toggler">
    <li class="nav-item">
        <a class="nav-link text-center" id="sidenavToggler">
            <i class="fa fa-fw fa-angle-left"></i>
        </a>
    </li>
</ul>
