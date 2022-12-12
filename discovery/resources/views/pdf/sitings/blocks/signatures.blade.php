@php
    $builder = $builder ?? null;
@endphp
<div class="signatures {{$builder ?: $builder}}">
    @if($builder === 'homebuyers')
        <div class="double signature">
            <div class="signature">
                Date
            </div>
            <div class="signature">
                Job #
            </div>
        </div>
    @endif
    <div class="signature">
        @if($builder === 'homebuyers')
            Drafting Approved Signature
        @else
            Date
        @endif
    </div>
    <div class="signature">
        Signature 1
    </div>
    <div class="signature">
        Signature 2
    </div>
</div>