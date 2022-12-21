import React, {Component} from 'react';
import PropTypes from 'prop-types';

class Recaptcha extends Component {
    constructor(props) {
        super(props);
        this.script = null;
        this.state = {initialized: false};
        this.timer = null;
    }

    static propTypes = {
        siteKey: PropTypes.string.isRequired,
        onVerify: PropTypes.func.isRequired,
    };


    componentWillMount() {
        if (!window['grecaptcha']) {
            const script = document.createElement('script');
            script.async = true;
            script.defer = true;
            script.src = 'https://www.google.com/recaptcha/api.js';
            this.script = document.head.appendChild(script);
            this.timer = window.setInterval(
                () => {
                    if (window['grecaptcha']) {
                        window.clearInterval(this.timer);
                        this.timer = null;

                        window['grecaptcha'].ready(() => this.setState({
                                initialized: true
                            },
                            this.createRecaptcha
                        ));
                    }
                }, 200
            );
        } else {
            this.setState(
                {initialized: true},
                this.createRecaptcha
            );
        }
    }

    componentDidCatch(error, info) {
        console.error && console.error(error, info);
    }

    componentWillUnmount() {
        const {script} = this;

        if (script) {
            const parent = script.parentNode;
            if (parent) {
                parent.removeChild(script);
            }
            this.script = null;
        }

        if (this.timer) {
            window.clearInterval(this.timer);
            this.timer = null;
        }

        const {grecaptcha} = window;
        const {captchaNode} = this;

        if (grecaptcha && this.captchaNode) {
            const id = captchaNode.getAttribute('data-captcha');
            if (id) {
                grecaptcha.reset(captchaNode.getAttribute('data-captcha'));
            }
        }
    }

    createRecaptcha = () => {
        if (!this.state.initialized) {
            return;
        }
        const {captchaNode} = this;
        if (captchaNode && !captchaNode.getAttribute('data-captcha')) {
            const {grecaptcha} = window;
            const id = grecaptcha.render(captchaNode, {
                sitekey: this.props.siteKey,
                callback: this.props.onVerify,
                // 'expired-callback': r => console.log('expired-callback', r),
                // 'error-callback': r => console.log('error-callback', r),
            });
            captchaNode.setAttribute('data-captcha', id);
        }
    };

    render = () => (
        this.state.initialized ? <div ref={node => this.captchaNode = node}/> : 'Getting a captcha...'
    )
}

export default Recaptcha;