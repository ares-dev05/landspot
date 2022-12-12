@if(App::environment('production'))
    <!-- Global site tag (gtag.js) - Google Ads: 644554645 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=AW-448753310"></script>
    <script>
        window.dataLayer = window.dataLayer || [];

        function gtag() {
            dataLayer.push(arguments);
        }

        gtag('js', new Date());

        gtag('config', 'AW-448753310')
    </script>
@endif