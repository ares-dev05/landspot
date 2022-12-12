import React, {Component} from 'react';
import {validateEmail, LoadingSpinner} from '~blog~/helpers';
import {withAlert} from "react-alert";
import {connect} from "react-redux";
import * as actions from "../profile/store/actions";
import PropTypes from "prop-types";
import classnames from 'classnames';


class Subscription extends Component {
    static propTypes = {
        subscribe: PropTypes.func.isRequired,
        resetMessages: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            formPosition: 'fixed',
            email: '',
            isOpen: false,
            preloader: false
        };
    }

    componentDidMount() {
        window.addEventListener('resize', this.resizeEventListener);
        window.addEventListener('scroll', this.scrollEventListener);
        this.resizeEventListener();
    };

    componentDidUpdate(prevProps, prevState) {
        const {preloader, formPosition: currentPosition} = this.state;
        const formPosition = prevState.formPosition;

        if (preloader && preloader === prevState.preloader && currentPosition === formPosition) {
            this.setState({preloader: false})
        }

        const {message, errors} = this.props;
        if (message) {
            this.props.alert.show(
                <div className="alert-popup">{this.props.message}</div>,
                {
                    time: 5000,
                    type: 'success',
                }
            );
            this.props.resetMessages();
        }

        if (errors) {
            let err = [];
            if (typeof errors === 'object') {
                Object.keys(errors).forEach(error => {
                    err = errors[error];
                });
            } else {
                err.push(errors);
            }

            if (err.length) {
                this.showErrors(err);
            }

            this.props.resetMessages();
        }
    }

    showErrors = (errors) => {
        let errorMsgs = errors.map((item, index) => <div key={index}>{item.message || item}</div>);

        this.props.alert.show(
            <div className="alert-popup">{errorMsgs}</div>,
            {
                time: 5000,
                type: 'error',
            }
        );
    };

    componentWillUnmount() {
        window.removeEventListener('scroll', this.scrollEventListener);
        window.removeEventListener('resize', this.resizeEventListener);
    };

    resizeEventListener = () => {
        const {isOpen} = this.state;
        const screenSize = window.innerWidth;
        if ((screenSize > 760 && !isOpen) || (screenSize < 760 && isOpen)) {
            this.setState({isOpen: !isOpen});
        }
    };

    scrollEventListener = () => {
        const currentPosition = this.state.formPosition;

        let formPosition = 'fixed';
        if ((window.innerHeight + window.scrollY) > (document.body.offsetHeight - 146)) {
            formPosition = 'absolute';
        }

        if (formPosition !== currentPosition) {
            this.setState({formPosition});
        }
    };

    onInputChange = (email) => {
        this.setState({email});
    };

    subscribeHandler = () => {
        const {email, preloader} = this.state;
        if (!validateEmail(email)) {
            this.props.alert.show(
                <div className="alert-popup">Enter a valid email address.</div>,
                {
                    time: 5000,
                    type: 'error',
                }
            );
            return false;
        }

        this.props.subscribe({email});
        this.setState({preloader: !preloader, email: ''})
    };

    render() {
        const {formPosition: position, preloader, email, isOpen} = this.state;

        return (
            <div className="newsletter-sticky white-background" style={{position}}>
                {preloader && <LoadingSpinner isOverlay={true}/>}
                <div className="container container-fluid">
                    {isOpen
                        ? <React.Fragment>
                            <button className="close-button responsive-button"
                                    type="submit"
                                    onClick={() => this.setState({isOpen: !isOpen})}>
                                <i className="fa fa-times" aria-hidden="true"/>
                            </button>
                            <div className="row newsletter-row">
                                <Title/>
                                <div className="newsletter-form">
                                    <input type="text" name="email"
                                           placeholder="Enter your email address..."
                                           onChange={(e) => this.onInputChange(e.target.value)}
                                           value={email}
                                           required=""/>
                                    <button className="btn submit" type="submit"
                                            onClick={() => this.subscribeHandler()}>
                                        Sign Up
                                    </button>
                                </div>
                            </div>
                        </React.Fragment>
                        : <div className="responsive-block">
                            <Title/>
                            <button className="newsletter-button responsive-button"
                                    type="submit"
                                    onClick={() => this.setState({isOpen: !isOpen})}>
                                <i className="fa fa-envelope-o" aria-hidden="true"/>
                            </button>
                        </div>
                    }


                </div>
            </div>
        );
    }
}

const Title = () => (
    <div className="title"><span>Subscribe to our Newsletter for New Home Builders</span></div>
);

export default withAlert(connect((state => ({
    message: state.profile.message,
    errors: state.profile.errors,
})), actions)(Subscription));