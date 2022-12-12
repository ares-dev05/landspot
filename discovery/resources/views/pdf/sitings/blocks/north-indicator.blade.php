<div class="north-indicator">
    <svg width="80px" height="80px" viewBox="0 0 80 80" version="1.1" xmlns="http://www.w3.org/2000/svg"
         xmlns:xlink="http://www.w3.org/1999/xlink">
        <g id="xxhdpi/ic_launcher_APP" stroke="none" stroke-width="1"
           transform="rotate({{$northRotation!=0 ? $northRotation : $rotation}} 40 40)"
           fill="none" fill-rule="evenodd">
            <circle id="circle" fill="{{$company ? $company->companyThemeColor : '#333'}}" cx="40" cy="40" r="19.5"/>
            <polygon id="arrow" fill="#FFFFFF" fill-rule="nonzero"
                     transform="translate(0 -1)"
                     points="33.2247503 47.6580073 40.2058539 32.7537005 47.1869576 47.6580073 40.2058539 43.9291345"/>
        </g>
    </svg>
</div>