<footer>
    <div class="container">
        <div class="row">
            <div class="col-lg-2 col-col-md-12 col-sm-8 col-xs-6">
                <div class="footer-logo">
                </div>
            </div>
            <div class="footer-flex-box col-lg-9 offset-lg-1 col-md-12 col-sm-8 col-xs-6">
                <div class="copyright">
                    Powered by Landconnect Global Pty Ltd. {{date("Y")}}
                </div>
                <div class="footer-links">
                    @if($theme['brand'] == 'landconnect')
                        <a href="/insights/">Insights</a>
                    @else
                    @endif
                    {{--                    <a href="{{route('tos', [], false)}}">Terms Of Service</a>--}}
                </div>
            </div>
        </div>
    </div>
</footer>