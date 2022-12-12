@php
    $userCompany = auth()->user()->company;
    $themeColor = $userCompany->companyThemeColor;
    $logoColor = $userCompany->isDeveloper() ? '#3D40C6' : null;
@endphp
<style type="text/css">
    :root {
        @if($themeColor)
            --main-color: {{$themeColor}};
        @endif
        @if($logoColor)
            --logo-color: {{$logoColor}};
        @endif
    }
</style>
