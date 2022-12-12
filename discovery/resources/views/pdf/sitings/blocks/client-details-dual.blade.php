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
        </ul>
    </div>
</div>