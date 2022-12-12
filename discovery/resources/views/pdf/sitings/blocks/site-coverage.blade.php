<div class="site-coverage">
    <div class="lists">
        <ul class="list">
            <li class="item">
                <div class="heading">
                    <span class="name">Site Coverage</span>
                </div>
            </li>
            <li class="item">
                <span class="name">Ground Floor</span>&nbsp;
                <span class="area">{{number_format((float)($areaData->houseAreas->floor ?? 0), 2, '.', '')}}</span>
            </li>
            <li class="item">
                <span class="name">Garage</span>&nbsp;
                <span class="area">{{number_format((float)($areaData->houseAreas->garage ?? 0), 2, '.', '')}}</span>
            </li>
            <li class="item">
                <span class="name">Alfresco</span>&nbsp;
                <span class="area">{{number_format((float)($areaData->houseAreas->alfresco ?? 0), 2, '.', '')}}</span>
            </li>
            <li class="item">
                <span class="name">Porch</span>&nbsp;
                <span class="area">{{number_format((float)($areaData->houseAreas->porch ?? 0), 2, '.', '')}}</span>
            </li>
            <li class="item">
                <span class="name">Option</span>&nbsp;
                <span class="area">{{number_format((float)($areaData->houseAreas->options ?? 0), 2, '.', '')}}</span>
            </li>
            <li class="item">
                <span class="name">Ext/Red</span>&nbsp;
                <span class="area">{{number_format((float)($areaData->houseAreas->transformations ?? 0), 2, '.', '')}}</span>
            </li>
        </ul>
        <ul class="list">
            <li class="item">
                <div class="heading">
                    <span class="name">&nbsp;</span>
                </div>
            </li>
            <li class="item">
                <span class="name">Total House m<sup>2</sup></span>&nbsp;
                <span class="area">{{number_format((float)($areaData->totalHouseArea ?? 0), 2, '.', '')}}</span>
            </li>
            <li class="item">
                <span class="name">Lot Area</span>&nbsp;
                <span class="area">{{number_format((float)($areaData && $areaData->lotArea ? $areaData->lotArea : 0), 2, '.', '')}}</span>
            </li>
            <li class="item"><br></li>
            <li class="item">
                <span class="important">
                    <span class="name">Total Coverage</span>&nbsp;
                    <span class="area">{{number_format((float)($areaData && $areaData->totalCoverage ? $areaData->totalCoverage : 0), 2, '.', '')}}%</span>
                </span>
            </li>
        </ul>
        @if($siting->lot_no || $siting->sp_no || $siting->parent_lot_no || $siting->parent_sp_no)
            <ul class="list">
                <li class="item">
                    <div class="heading">
                        <span class="name">Lot Details</span>
                    </div>
                </li>
                <li class="item">
                    <span class="name">Lot No.</span>&nbsp;
                    <span class="area">{{$siting->lot_no ?? ''}}</span>
                </li>
                <li class="item">
                    <span class="name">SP No.</span>&nbsp;
                    <span class="area">{{$siting->sp_no ?? ''}}</span>
                </li>
                <li class="item">
                    <span class="name">Parent Lot No.</span>&nbsp;
                    <span class="area">{{$siting->parent_lot_no ?? ''}}</span>
                </li>
                <li class="item">
                    <span class="name">Parent SP No.</span>&nbsp;
                    <span class="area">{{$siting->parent_sp_no ?? ''}}</span>
                </li>
            </ul>
        @endif
        @if($signatures ?? null)
            <div class="list signatures">
                <div class="name">Date</div>
                <div class="signature"></div>
                <div class="name">Signature</div>
                <div class="signature"></div>
            </div>
        @endif
    </div>
</div>