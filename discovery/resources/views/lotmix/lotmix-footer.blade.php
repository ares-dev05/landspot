<footer class="lotmix-footer">
    <div class="footer-container">
        <a class="footer-logo" href="/" title="Lotmix"></a>
        <p class="footer-text">
            Lotmix is run and operated by Landconnect Global Pty Ltd. Landconnect has been servicing new home
            builders and developers with smart and simple technology throughout Australia since 2014.
        </p>
        <div class="footer-links">
            <a href="{{UrlHelper::secureRoutePath('lotmix-tos')}}">Terms of Use</a>
            <a href="mailto:support@lotmix.com.au">Contact Us</a>
            <a href="{{ UrlHelper::securePath('/blog') }}">Blog</a>
        </div>
        <p class="footer-copyright">© {{ now()->year }} Lotmix </p>
    </div>
</footer>