<div class="estate-info-section">
    <div class="estate-info">
        <div class="estate-description-wrap">
            <h1 class="estate-title">{{$estate->name}} Estate</h1>
            <p class="description">
                {{$estate->description ?? 'No description for this estate'}}
            </p>
        </div>
        <div class="estate-logo">
            <div class="logo"
                 style="background-image: url('{{$estate->thumbImage}}');"></div>
            <div class="footer-info">
                <div class="address">
                    <h3 class="footer-title">ADDRESS</h3>
                    <p>{{$estate->address}}</p>
                </div>
            </div>
        </div>
    </div>
    <div class="estate-contact-details">
        <div class="address">
            <h3 class="footer-title">Address</h3>
            <p>{{$estate->address}}</p>
        </div>
    </div>
    <div class='offer-block-container'>
        <div class='header'>Want to build here?</div>
        <div class='description'>Get help by leading builders.</div>
        <a href="/floorplans/" class='button-text'>Start by finding the perfect floorplan</a>
    </div>
</div>