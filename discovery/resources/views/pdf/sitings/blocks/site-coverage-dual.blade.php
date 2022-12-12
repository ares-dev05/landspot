<div class="site-coverage">
    <div class="heading">Site Coverage</div>
    <div class="lists">
        <ul class="list">
            <li class="item">
                <span class="name">House Design & Facade</span>&nbsp;
            </li>
            @foreach ($areaData->dualOccArea as $houseArea)
                <li class="item">
                    <span class="name" style="min-width: 14mm">{{$houseArea->houseName}}</span>&nbsp;
                </li>
            @endforeach
        </ul>

        <ul class="list" style="padding-left: 2mm">
            <li class="item">
                <span class="name" style="min-width: 14mm">Ground Floor</span>&nbsp;
            </li>
            @foreach ($areaData->dualOccArea as $houseArea)
                <li class="item">
                    <span class="area">{{number_format((float)($houseArea->floor ?? 0), 2, '.', '')}}</span>
                </li>
            @endforeach
        </ul>

        <ul class="list" style="padding-left: 2mm">
            <li class="item">
                <span class="name" style="min-width: 14mm">Garage</span>&nbsp;
            </li>
            @foreach ($areaData->dualOccArea as $houseArea)
                <li class="item">
                    <span class="area">{{number_format((float)($houseArea->garage ?? 0), 2, '.', '')}}</span>
                </li>
            @endforeach
        </ul>

        <ul class="list" style="padding-left: 2mm">
            <li class="item">
                <span class="name" style="min-width: 14mm">Alfresco</span>&nbsp;
            </li>
            @foreach ($areaData->dualOccArea as $houseArea)
                <li class="item">
                    <span class="area">{{number_format((float)($houseArea->alfresco ?? 0), 2, '.', '')}}</span>
                </li>
            @endforeach
        </ul>

        <ul class="list" style="padding-left: 2mm">
            <li class="item">
                <span class="name" style="min-width: 14mm">Porch</span>&nbsp;
            </li>
            @foreach ($areaData->dualOccArea as $houseArea)
                <li class="item">
                    <span class="area">{{number_format((float)($houseArea->porch ?? 0), 2, '.', '')}}</span>
                </li>
            @endforeach
        </ul>

        <ul class="list" style="padding-left: 2mm">
            <li class="item">
                <span class="name" style="min-width: 14mm">Option</span>&nbsp;
            </li>
            @foreach ($areaData->dualOccArea as $houseArea)
                <li class="item">
                    <span class="area">{{number_format((float)($houseArea->options ?? 0), 2, '.', '')}}</span>
                </li>
            @endforeach
        </ul>

        <ul class="list" style="padding-left: 2mm">
            <li class="item">
                <span class="name" style="min-width: 14mm">Ext/Red</span>&nbsp;
            </li>
            @foreach ($areaData->dualOccArea as $houseArea)
                <li class="item">
                    <span class="area">{{number_format((float)($houseArea->transformations ?? 0), 2, '.', '')}}</span>
                </li>
            @endforeach
        </ul>

        <ul class="list" style="padding-left: 2mm">
            <li class="item">
                <span class="name" style="min-width: 14mm">Total</span>&nbsp;
            </li>
            @foreach ($areaData->dualOccArea as $houseArea)
                <li class="item">
                    <span class="area">{{number_format((float)($houseArea->totalArea ?? 0), 2, '.', '')}}</span>
                </li>
            @endforeach
        </ul>
    </div>
    <div class="lists">
        <ul class="list" style="padding-left: 140mm;">
            <li class="item">
                <span class="name">House Area</span>&nbsp;
                <span class="area">{{number_format((float)($areaData && $areaData->totalHouseArea ? $areaData->totalHouseArea : 0), 2, '.', '')}}</span>
            </li>
            <li class="item">
                <span class="name">Lot Area</span>&nbsp;
                <span class="area">{{number_format((float)($areaData && $areaData->lotArea ? $areaData->lotArea : 0), 2, '.', '')}}</span>
            </li>
            <li class="item">
                <span class="important">
                    <span class="name">Coverage</span>&nbsp;
                    <span class="area">{{number_format((float)($areaData && $areaData->totalCoverage ? $areaData->totalCoverage : 0), 2, '.', '')}}%</span>
                </span>
            </li>
        </ul>
    </div>
</div>