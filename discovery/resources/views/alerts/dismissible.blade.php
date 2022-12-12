<div class='alert alert-{{ $type }} alert-dismissible'>
    <div style="transform: scale(1); transition: all 250ms ease-in-out 0s;">
        <div class="alert-container" role="alert" style="margin: 30px;">
            @if (isset($title))
                <strong>{{ $title }}</strong>
            @endif
            <i class="fa fa-check-circle" aria-hidden="true"></i>
            <div class="alert-popup">{{ $slot }}</div>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <i class="fa fa-times-circle" aria-hidden="true"></i>
            </button>
        </div>
    </div>
</div>