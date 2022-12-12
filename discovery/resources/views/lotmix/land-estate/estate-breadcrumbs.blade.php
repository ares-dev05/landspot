<div class="estate-breadcrumbs">
    <ul class="page-breadcrumbs">
        <?php $segments = request()->segments(); ?>
        @foreach($segments as $segment)
            <li>
                <a href={{Breadcrumbs::publicEstateUrl($segment, $estate)}}>
                    {{Breadcrumbs::publicEstateName($segment, $estate, $state)}}
                </a>

                @if ($segment != end($segments))
                    <i class="fa fa-angle-right"></i>
                @endif
            </li>
        @endforeach
    </ul>
</div>