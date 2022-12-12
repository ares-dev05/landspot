<div class="houses-section">
    <div class='houses-header dots-top-left'>Match house to land in {{$estate->name}} estate
    </div>
    <div class="houses-description">Browse leading builders to find the perfect floorplan
        for your family
    </div>

    <div class="floorplans">
        @foreach($houses as $house)
            <div class="floorplan">
                <div class="floorplan-content">
                    <div class="floorplan-image"
                         style="background-image: url({{$house->facades[0]->mediumImage}})">
                        <div class="company-image" style="background-image: url({{$house->company->company_logo ?: $house->company->company_expanded_logo}})"></div>
                    </div>
                    <div class="floorplan-description">
                        <p class="floorplan-title">{{$house->title}}</p>
                        <ul class="item-options">
                            @if ($house->beds>0)
                                <li>
                                    <i class="landspot-icon bedroom" aria-hidden="true">
                                    </i>
                                    <span>{{$house->beds}}</span>
                                </li>
                            @endif

                            @if ($house->cars>0)
                                <li>
                                    <i class="landspot-icon car-park" aria-hidden="true">
                                    </i>
                                    <span>{{$house->cars}}</span>
                                </li>
                            @endif

                            @if ($house->bathrooms>0)
                                <li>
                                    <i class="landspot-icon bathroom" aria-hidden="true">
                                    </i>
                                    <span>{{$house->bathrooms}}</span>
                                </li>
                            @endif
                        </ul>
                    </div>
                </div>
            </div>
        @endforeach
        <div class="custom-slider">
            <div class="slider-window">
                <div class="slides">
                    @foreach($houses as $house)
                        <div class="floorplan slide">
                            <div class="floorplan-content">
                                <div class="floorplan-image"
                                     style="background-image: url({{$house->facades[0]->mediumImage}})">
                                    <div class="company-image" style="background-image: url({{$house->company->company_logo ?: $house->company->company_expanded_logo}})"></div>
                                </div>
                                <div class="floorplan-description">
                                    <p class="floorplan-title">{{$house->title}}</p>
                                    <ul class="item-options">
                                        @if ($house->beds>0)
                                            <li>
                                                <i class="landspot-icon bedroom" aria-hidden="true">
                                                </i>
                                                <span>{{$house->beds}}</span>
                                            </li>
                                        @endif

                                        @if ($house->cars>0)
                                            <li>
                                                <i class="landspot-icon car-park" aria-hidden="true">
                                                </i>
                                                <span>{{$house->cars}}</span>
                                            </li>
                                        @endif

                                        @if ($house->bathrooms>0)
                                            <li>
                                                <i class="landspot-icon bathroom" aria-hidden="true">
                                                </i>
                                                <span>{{$house->bathrooms}}</span>
                                            </li>
                                        @endif
                                    </ul>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
            <div class="dots"></div>
        </div>
    </div>
    <div class='offer-block-container'>
        <div class='header'>Looking for your dream home?</div>
        <div class='description'>Start your building journey with the guidance of leading builders</div>
        <a href="/floorplans/" class='button-text'>Browse Floorplans</a>
    </div>
</div>