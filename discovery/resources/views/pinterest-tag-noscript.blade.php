@if(App::environment('production'))
    <!-- Pinterest Tag -->
    <noscript>
        <img height="1" width="1" style="display:none;" alt=""
             src="https://ct.pinterest.com/v3/?event=init&tid=2613490481879&pd[em]=<hashed_email_address>&noscript=1"/>
    </noscript>
    <!-- end Pinterest Tag -->
@endif