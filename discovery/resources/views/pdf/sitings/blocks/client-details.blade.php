<div class="client-details">
    <div class="lists">
        <ul class="list">
            <li class="item">
                <span class="name">Client Name:</span>&nbsp;
                <span class="area important">{{$siting->first_name}} {{$siting->last_name}}</span>
            </li>
            <li class="item">
                <span class="name">Client Address:</span>&nbsp;
                <span class="area">{{$siting->lot_number ?? ''}} {{$siting->street ?? ''}}</span>
            </li>
            <li class="item">
                <span class="name">House & Facade:</span>&nbsp;
                <span class="area">{{$siting->house ?? ''}} - {{$siting->facade ?? ''}}</span>
            </li>
            <li class="item">
                <span class="name">Option(s):</span>&nbsp;
                <span class="area">{{$siting->options ?? ''}}</span>
            </li>
            <li class="item">
                <span class="name">Modifications:</span>&nbsp;
                <span class="area">{{$siting->extra_details ?? ''}}</span>
            </li>
        </ul>
    </div>
</div>