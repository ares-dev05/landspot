<?php

use App\Models\{LotmixStateSettings};

/** @var \App\Models\User $user */
$user = auth()->user();
/** @var \App\Models\Company $userCompany */
$userCompany = $user->company;
$Logo_Icon_Expanded = $userCompany->expanded_logo_path
    ? $userCompany->company_expanded_logo
    : url('/images/LC_Logo_Landspot_Lockup-Blue.svg', [], true);

$canDiscovery = $user->can('discovery');
$canPdfManagers = $user->can('pdf-managers');
$canFootprints = $user->can('footprints');
$isGlobalAdmin = $user->isGlobalAdmin();
$canManageUsers = $user->can('manage-users');
$isUserManager = $user->isUserManager();
$isBuilderAdmin = $user->isBuilderAdmin();
$developerOnly = $user->isLandDeveloper() || $user->isEstateManager() || $user->isGlobalEstateManager() || $isGlobalAdmin;
$canEstateAccess = $user->can('estates-access');
$canDiscoveryManager = $user->can('discovery-manager');
$canNearmapAdmin = $user->can('nearmap-admin');
$canBillingAccess = $user->billing_access_level == 2;
$isEstatesEnabled = $user->state->getEstatesDisabled($user->company) == LotmixStateSettings::ESTATES_ACCESS_ENABLED;

// True when lotmix is enabled for the user's company and state
$canManageMyClients = $user->can('manage-my-clients');
$hasTrainingVideo = $canManageMyClients && $userCompany->isBuilder();

?>
<script>
    function openTab(e) {
        e.preventDefault();
        e.stopPropagation();
        const link = e.currentTarget;
        const tabName = link.dataset.tabContent;
        const tabContent = document.getElementById(tabName);
        const activeTab = tabContent.querySelector('.active');
        const dataFootprints = link.dataset.footprints;

        function toggleTab() {
            let i, tabs, node, tablink;
            tabs = document.getElementsByClassName('tabcontent');
            for (i = 0; (node = tabs[i++]);) {
                node.style.display = 'none';
            }
            tabContent.style.display = 'flex';

            tablink = document.getElementsByClassName('tablink');
            for (i = 0; (node = tablink[i++]);) {
                node.classList.toggle('active', false);
            }
            link.classList.toggle('active', !link.classList.contains('active'));
        }

        if (dataFootprints) {
            toggleTab();
        } else if (!activeTab) {
            const tabLinks = tabContent.getElementsByTagName('a');
            tabLinks.length ? tabLinks[0].click() : null;
        } else {
            toggleTab();
        }
    }

    function openTutorialVideo() {
        const modalRoot = document.getElementById('modals-root');
        modalRoot.textContent = '';

        const backDrop = document.createElement('div');
        backDrop.className = 'popupmodal-backdrop';
        modalRoot.appendChild(backDrop);

        const modal = document.createElement('div');
        modal.classList.add('landspot-modal', 'wide-popup', 'top-action-buttons');

        const modalHeader = document.createElement('div');
        modalHeader.className = 'popupmodal-header';

        const closeButton = document.createElement('button');
        closeButton.classList.add('button', 'close', 'transparent');
        closeButton.innerHTML = '<i class="landspot-icon times"></i>';
        closeButton.addEventListener('click', closeTutorialVideo);

        const modalBody = document.createElement('div');
        modalBody.className = 'popupmodal-body';
        modalBody.innerHTML = `<iframe src="https://player.vimeo.com/video/469663906" width="100%" height="360" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;

        modalHeader.appendChild(closeButton);
        modal.appendChild(modalHeader);
        modal.appendChild(modalBody);
        modalRoot.appendChild(modal);
    }

    function closeTutorialVideo() {
        const modalRoot = document.getElementById('modals-root');
        modalRoot.textContent = '';
    }
</script>

<nav class="app-nav" role="navigation">
    <div class="nav-header">
        <a class="active logo" href="/" title="{{config('app.name', 'Landspot')}}"></a>
        <ul class="left-nav">
            @if($isEstatesEnabled)
                <li class="nav-item">
                    <a href="/" id="landspot-nav" class="tablink" onclick="openTab(event)"
                       data-tab-content="landspot-items"
                       title="{{config('app.name', 'Landspot')}}">{{config('app.PRE_LAUNCH_MENU_FORMAT') ? 'Discovery' : config('app.name', 'Landspot')}}</a>
                </li>
            @endif

            @if($userCompany->isBuilder() || $isGlobalAdmin)
                <li class="nav-item">
                    <a href="{{$user->state->getSitingAccess($user->company) == 1 ? (config('app.SITINGS_URL') . route('reference-plan', [], false)) : config('app.FOOTPRINTS_URL') }}"
                       title="Sitings">Sitings</a>
                </li>
            @endif

            @if($canManageUsers || ($canDiscovery &&
            ($canDiscoveryManager || ($canPdfManagers && $canEstateAccess))) ||
            $canBillingAccess || $isUserManager || $canNearmapAdmin)
                <li class="nav-item">
                    <a href="#" class="tablink"
                       id="management-nav"
                       @if(!$isGlobalAdmin && ($canFootprints || ($isUserManager && $canFootprints)))
                       data-footprints="true"
                       @endif
                       data-tab-content="management-items"
                       onclick="openTab(event)" title="Management">Management</a>
                </li>
            @endif
            @if($isGlobalAdmin)
                <li class="nav-item">
                    <a href="#"
                       class="tablink"
                       id="kaspa-engine-nav"
                       data-tab-content="kaspa-engine-items"
                       onclick="openTab(event)"
                       title="Kaspa Engine">Kaspa Engine</a>
                </li>
            @endif
            <li class="nav-item">
                <a href="#" class="tablink"
                   id="my-clients-nav"
                   data-tab-content="my-clients-items"
                   onclick="openTab(event)" title="My Clients">My Clients</a>
            </li>

            @can('portal-access')
                <li class="nav-item">
                    <a class="{{Request::is('sitings/plans*') ? 'active' : ''}}"
                       href="https://www.landconnect.com.au/portal" title="Plan Portal">Plan Portal</a>
                </li>
            @endcan

            @if($hasTrainingVideo)
                <li class="nav-item">
                    <a href="#" class="tablink watch-video"
                       id="my-clients-nav"
                       onclick="openTutorialVideo()" title="Watch Lotmix Training Video">Watch Training Video</a>
                </li>
            @endif
        </ul>
        <ul class="right-nav">
            @if($userCompany->isBuilder())
                <li class="nav-item company-logo">
                    <img src="{{$Logo_Icon_Expanded}}" alt="company logo"/>
                </li>
            @endif
            @if($canEstateAccess)

                <li id="minimized-chat"
                    class="nav-item @can('chat') messenger @endcan @cannot('chat') without-chat @endcan"></li>

            @endif
            <li class="nav-item dropdown"
                data-selected="{{Request::is('profile*')}}"
                data-tab-link-id="landspot-nav">
                <a class="{{Request::is('profile*') ? 'active' : ''}}"
                   href="{{route('profile.index', [], false)}}"
                   onclick="event.preventDefault();">
                    <i class="landspot-icon user" aria-hidden="true"></i>
                    <i class="landspot-icon angle-down" aria-hidden="true"></i>
                </a>
                <ul class="dropdown-content">
                    <li class="nav-item">
                        @if(!$isGlobalAdmin && $canFootprints)
                            <a href="{{config('app.LANDCONNECT_ACCOUNT_URL')}}">
                                Account Settings
                            </a>
                        @else
                            <a class="{{Request::is('profile*') ? 'active' : ''}}"
                               href="{{ route('profile.index', [], false) }}">
                                Profile
                            </a>
                        @endif
                    </li>

                    <li class="nav-item">
                        <a href="mailto:support@landconnect.com.au">
                            Contact Support
                        </a>
                    </li>

                    @if($canFootprints && !$isGlobalAdmin)
                        <li class="nav-item">
                            <a href="{{config('app.LANDCONNECT_POLICY_URL')}}">
                                Privacy Policy
                            </a>
                        </li>
                    @endif

                    <li class="nav-item">
                        <a href="{{ UrlHelper::logoutUrl() }}">
                            Log Out
                        </a>
                    </li>
                </ul>
            </li>
        </ul>
    </div>
    <ul class="nav-items tabcontent" id="landspot-items">
        @if($userCompany->isBuilder() && !$isGlobalAdmin && $canEstateAccess && $canEstateAccess)
            <li class="nav-item"
                data-selected="{{Request::is(['landspot/my-estates*', 'landspot/estate*'])}}"
                data-tab-link-id="landspot-nav">
                <a class="{{Request::is(['landspot/my-estates*', 'landspot/estate*']) ? 'active' : ''}}"
                   href="{{route('landspot.my-estates', [], false)}}">
                    Estates
                </a>
            </li>
        @endif

        @if($developerOnly)
            <li class="nav-item"
                data-selected="{{Request::is(['landspot/my-estates*', 'landspot/estate*', 'landspot/lot-drawer*'])}}"
                data-tab-link-id="landspot-nav">
                <a class="{{Request::is(['landspot/my-estates*', 'landspot/estate*', 'landspot/lot-drawer*']) ? 'active' : ''}}"
                   href="{{route('landspot.my-estates', [], false)}}">
                    Estates
                </a>
            </li>
        @endif

        @if($developerOnly)
            <li class="nav-item"
                data-selected="{{Request::is('landspot/discovery*')}}"
                data-tab-link-id="landspot-nav">
                <a class="{{Request::is('landspot/discovery*') ? 'active' : ''}}"
                   href="{{route('landspot.discovery', [], false)}}">
                    {{config('app.PRE_LAUNCH_MENU_FORMAT') ? 'Floorplans' : 'Discovery'}}
                </a>
            </li>
        @endif

        @if($canDiscovery && !$isGlobalAdmin)
            <li class="nav-item"
                data-selected="{{Request::is('discovery*')}}"
                data-tab-link-id="landspot-nav">
                <a class="{{Request::is('discovery*') ? 'active' : ''}}"
                   href="{{route('discovery', [], false)}}">
                    {{config('app.PRE_LAUNCH_MENU_FORMAT') ? 'Floorplans' : 'Discovery'}}
                </a>
            </li>
        @endif
    </ul>
    {{--<ul class="nav-items tabcontent" id="sitings-items">--}}
    {{--@if($canFootprints)--}}
    {{--<li class="nav-item">--}}
    {{--@if(App::environment('production'))--}}
    {{--<a href="{{config('app.FOOTPRINTS_URL')}}">--}}
    {{--Footprints--}}
    {{--</a>--}}
    {{--@else--}}
    {{--<a class="{{Request::is('footprints') ? 'active' : ''}}"--}}
    {{--href="{{route('footprints', [], false)}}">--}}
    {{--Footprints--}}
    {{--</a>--}}
    {{--@endif--}}
    {{--</li>--}}
    {{--@if($user->has_portal_access == 1)--}}
    {{--<li class="nav-item">--}}
    {{--<a href="{{config('app.LANDCONNECT_PLAN_PORTAL_URL')}}">--}}
    {{--Plan Portal--}}
    {{--</a>--}}
    {{--</li>--}}
    {{--@endif--}}
    {{--@if($user->isBuilderAdmin())--}}
    {{--<li class="nav-item dropdown">--}}
    {{--<a href="#" onclick="event.preventDefault();">--}}
    {{--Statistics--}}

    {{--<i class="landspot-icon angle-down" aria-hidden="true"></i>--}}
    {{--</a>--}}
    {{--<ul class="dropdown-content">--}}
    {{--<li class="nav-item">--}}
    {{--<a href="{{config('app.LANDCONNECT_PDF_EXPORT_URL')}}">--}}
    {{--PDF Exports--}}
    {{--</a>--}}
    {{--</li>--}}
    {{--<li class="nav-item">--}}
    {{--<a href="{{config('app.LANDCONNECT_SAVED_SESSIONS_URL')}}">--}}
    {{--Saved Sessions--}}
    {{--</a>--}}
    {{--</li>--}}
    {{--<li class="nav-item">--}}
    {{--<a href="{{config('app.LANDCONNECT_HOUSE_USAGE_URL')}}">--}}
    {{--House Usage--}}
    {{--</a>--}}
    {{--</li>--}}
    {{--</ul>--}}
    {{--</li>--}}

    {{--@endif--}}
    {{--@endif--}}
    {{--</ul>--}}
    <ul class="nav-items tabcontent" id="management-items">
        @if($canManageUsers || $isUserManager || $isBuilderAdmin)
            <li class="nav-item"
                data-selected="{{Request::is('landspot/user-manager*')}}"
                data-tab-link-id="management-nav">
                <a class="{{Request::is('landspot/user-manager*') ? 'active' : ''}}"
                   href="{{$isGlobalAdmin ? route('landspot.user-manager', [], false) : route('landspot.user-company', ['company' => $userCompany], false)}}">
                    User Manager
                </a>
            </li>
        @elseif(!$isGlobalAdmin && $canFootprints && ($canManageUsers || $isUserManager || $isBuilderAdmin))
            <li class="nav-item"
                data-selected=""
                data-tab-link-id="management-nav">
                <a href="{{config('app.LANDCONNECT_USERS_URL')}}">
                    User Manager
                </a>
            </li>
        @endif

        @if($canDiscovery && !$isGlobalAdmin)
            @if($canDiscoveryManager)
                <li class="nav-item"
                    data-selected="{{Request::is('manager')}}"
                    data-tab-link-id="management-nav">
                    <a class="{{Request::is('manager') ? 'active' : ''}}"
                       href="{{route('manager', [], false)}}">
                        Discovery Manager
                    </a>
                </li>
            @endif
            @if($canPdfManagers && $canEstateAccess)
                <li class="nav-item"
                    data-selected="{{Request::is('landspot/pdf-manager*')}}"
                    data-tab-link-id="management-nav">
                    <a class="{{Request::is('landspot/pdf-manager*') ? 'active' : ''}}"
                       href="{{$isGlobalAdmin ? route('landspot.pdf-manager', [], false) : route('landspot.pdf-company', ['company' => $userCompany], false)}}">
                        PDF Manager
                    </a>
                </li>
            @endcan
        @endif

        @if($canPdfManagers && $isGlobalAdmin)
            <li class="nav-item"
                data-selected="{{Request::is('landspot/pdf-manager*')}}"
                data-tab-link-id="management-nav">
                <a class="{{Request::is('landspot/pdf-manager*') ? 'active' : ''}}"
                   href="{{$isGlobalAdmin ? route('landspot.pdf-manager', [], false) : route('landspot.pdf-company', ['company' => $userCompany], false)}}">
                    PDF Manager
                </a>
            </li>
        @endif

        @can('manage-notifications')
            <li class="nav-item dropdown"
                data-selected="{{Request::is('landspot/notifications*')}}"
                data-tab-link-id="management-nav">
                <a class="{{Request::is('landspot/notifications*') ? 'active' : ''}}"
                   onclick="event.preventDefault();"
                   href="{{route('features.index', [], false)}}">
                    Notification Manager

                    <i class="landspot-icon angle-down" aria-hidden="true"></i>
                </a>

                <ul class="dropdown-content">
                    <li class="nav-item">
                        <a class="{{Request::is('landspot/notifications/features*') ? 'active' : ''}}"
                           href="{{route('features.index', [], false)}}">
                            Features
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="{{Request::is('landspot/notifications/media*') ? 'active' : ''}}"
                           href="{{route('media-file.index', [], false)}}">
                            Media
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="{{Request::is('landspot/notifications/lotmix-notification*') ? 'active' : ''}}"
                           href="{{route('lotmix-notification.index', [], false)}}">
                            Lotmix Notification
                        </a>
                    </li>
                </ul>
            </li>
        @endcan

        @if($canBillingAccess)
            <li class="nav-item">
                <a href="{{config('app.LANDCONNECT_BILLING_URL')}}">
                    Billing
                </a>
            </li>
        @endif

        @if($canNearmapAdmin)
            <li class="nav-item"
                data-selected="{{Request::is('landspot/nearmap-settings')}}"
                data-tab-link-id="management-nav">
                <a class="{{Request::is('landspot/nearmap-settings') ? 'active' : ''}}"
                   href="{{route('nearmap-settings.index', [], false)}}">
                    Nearmap Settings
                </a>
            </li>
        @endif

        @if($isGlobalAdmin)
            <li class="nav-item"
                data-selected="{{Request::is('landspot/admin/developers-features*') ? 'active' : ''}}"
                data-tab-link-id="management-nav">
                <a class="{{Request::is('landspot/admin/developers-features*') ? 'active' : ''}}"
                   href="{{route('developers-features.index', [], false)}}">
                    Premium Features
                </a>
            </li>
            <li class="nav-item"
                data-selected="{{Request::is('landspot/site-settings')}}"
                data-tab-link-id="management-nav">
                <a class="{{Request::is('landspot/site-settings') ? 'active' : ''}}"
                   href="{{route('site-settings.index', [], false)}}">
                    Landspot Settings
                </a>
            </li>
        @endif
    </ul>

    <ul class="nav-items tabcontent" id="my-clients-items">
        @if($canManageMyClients)
            <li class="nav-item"
                data-selected="{{Request::is('landspot/my-clients*')}}"
                data-tab-link-id="my-clients-nav">
                <a class="{{Request::is('landspot/my-clients*') ? 'active' : ''}}"
                   href="{{route('my-clients.index', [], false)}}">
                    My Clients
                </a>
            </li>
        @else
            <li class="nav-item"
                data-selected="{{Request::is('landspot/draft-sitings*')}}"
                data-tab-link-id="my-clients-nav">
                <a class="{{Request::is('landspot/draft-sitings*') ? 'active' : ''}}" href="{{route('draft-sitings')}}">
                    Draft Sitings
                </a>
            </li>
            <li class="nav-item"
                data-selected="{{Request::is('landspot/old-sitings*')}}"
                data-tab-link-id="my-clients-nav">
                <a class="{{Request::is('landspot/old-sitings*') ? 'active' : ''}}" href="{{route('old-sitings')}}">
                    Old Sitings
                </a>
            </li>
        @endif
    </ul>
    <ul class="nav-items tabcontent" id="kaspa-engine-items">
        @if($isGlobalAdmin)
            <li class="nav-item"
                data-selected="{{Request::is('kaspa-engine/guideline-profiles*') ? 'active' : ''}}"
                data-tab-link-id="kaspa-engine-nav">
                <a class="{{Request::is('kaspa-engine/guideline-profiles*') ? 'active' : ''}}"
                   href="{{route('guideline-profiles', [], false)}}">
                    Guideline Profiles
                </a>
            </li>
            <li class="nav-item"
                data-selected="{{Request::is('kaspa-engine/formula-library*')}}"
                data-tab-link-id="kaspa-engine-nav">
                <a class="{{Request::is('kaspa-engine/formula-library*') ? 'active' : ''}}"
                   href="{{route('formula-library', [], false)}}">
                    Formula Library
                </a>
            </li>
        @endif
        @if($isGlobalAdmin)
            <li class="nav-item"
                data-selected="{{Request::is('kaspa-engine/package-settings*') ? 'active' : ''}}"
                data-tab-link-id="kaspa-engine-nav">
                <a class="{{Request::is('kaspa-engine/package-settings*') ? 'active' : ''}}"
                   href="{{route('kaspa.package-settings', [], false)}}">
                    Package Settings
                </a>
            </li>
            <li class="nav-item"
                data-selected="{{Request::is('kaspa-engine/site-costs*') ? 'active' : ''}}"
                data-tab-link-id="kaspa-engine-nav">
                <a class="{{Request::is('kaspa-engine/site-costs*') ? 'active' : ''}}"
                   href="{{route('kaspa.site-costs', [], false)}}">
                    Site Costs
                </a>
            </li>
            <li class="nav-item"
                data-selected="{{Request::is('kaspa-engine/my-estates*') ? 'active' : ''}}"
                data-tab-link-id="kaspa-engine-nav">
                <a class="{{Request::is('kaspa-engine/my-estates*') ? 'active' : ''}}"
                   href="{{route('kaspa.my-estates', [], false)}}">
                    My Estates
                </a>
            </li>
        @endif
    </ul>
</nav>