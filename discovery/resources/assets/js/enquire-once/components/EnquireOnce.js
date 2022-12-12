import React from 'react';
import {get} from 'lodash';
import {validateEmailStrict} from '~/helpers';
import MultiStepForm from './MultiStepForm';

class EnquireOnce extends React.Component {
    static componentUrl = '/enquire/'

    state = {
        firstName: get(this.props, 'location.state.firstName', ''),
        lastName: get(this.props, 'location.state.lastName', ''),
        email: get(this.props, 'location.state.email', ''),
        tos: get(this.props, 'location.state.tos', false),
        disabled: true,
        errors: {
            firstName: null,
            lastName: null,
            email: null,
        }
    };

    componentDidMount() {
        const {disabled} = this.state;
        const isValidated = this.validateFields();
        if (isValidated === disabled) {
            this.toggleChangeDisabled();
        }
    }

    componentDidUpdate() {
        const {disabled} = this.state;
        const isValidated = this.validateFields();
        if (isValidated === disabled) {
            this.toggleChangeDisabled();
        }
    }

    validateFields = () => {
        const {firstName, lastName, email, tos} = this.state;
        const validEmail = validateEmailStrict(email);
        return (
            firstName.length > 2
            && lastName.length > 2
            && validEmail
            && tos
        );
    };

    onInputChange = e => this.setState({
        [e.target.name]: e.target.value
    });

    validateName = e => {
        this.setState({
            errors: {
                ...this.state.errors,
                [e.target.name]: e.target.value.length > 2
                    ? null
                    : 'This field must be longer than 2 characters'
            }
        });
    };

    validateEmail = e => {

        this.setState({
            errors: {
                ...this.state.errors,
                email: validateEmailStrict(e.target.value) ? null : 'You have entered an invalid email address'
            }
        });
    };

    toggleChangeDisabled = () => {
        this.setState({
            disabled: !this.state.disabled
        });
    };

    toggleChangeTos = () => {
        this.setState({
            tos: !this.state.tos,
        });
    };

    handleSubmit = (event) => {
        event.preventDefault();

        const {firstName, lastName, email, tos} = this.state;

        this.props.history.push({
            pathname: MultiStepForm.componentUrl,
            state: {firstName, lastName, email, tos}
        });
    };

    render() {
        const {
            errors,
            firstName,
            lastName,
            email,
            disabled,
            tos,
        } = this.state;
        const {
            validateName,
            onInputChange,
            validateEmail,
            toggleChangeDisabled,
            toggleChangeTos,
            handleSubmit,
        } = this;

        return (
            <div className="wrapper">
                <div className="content">
                    <p className="main-heading dots-top-left">Enquire Once with <span>Lotmix</span></p>
                    <p className="secondary-heading">The hassle free way to start your house and land journey</p>
                    <div className="mobile-register-image"/>
                    <p className="description">
                        Fill out your requirements and have leading builders respond with house
                        &
                        land that match
                    </p>
                    <form onSubmit={handleSubmit}>
                        <div className="form-wrapper">
                            <div className="row">
                                <label className="form-label">Name</label>
                                <div className="form-group">
                                    <input
                                        className={`register-input ${errors.firstName ? 'is-invalid' : ''}`}
                                        placeholder="First name..."
                                        name="firstName"
                                        onChange={onInputChange}
                                        onBlur={validateName}
                                        value={firstName}
                                    />
                                    <div className='invalid-feedback'>{errors.firstName}</div>
                                </div>
                                <div className="form-group">
                                    <input
                                        className={`register-input last-name${errors.lastName ? 'is-invalid' : ''}`}
                                        placeholder="Last name..."
                                        name="lastName"
                                        onChange={onInputChange}
                                        onBlur={validateName}
                                        value={lastName}
                                    />
                                    <div className='invalid-feedback'>{errors.lastName}</div>
                                </div>
                            </div>
                            <div className="row">
                                <label className="form-label">Email</label>
                                <div className="form-group">
                                    <input
                                        className={`email register-input ${errors.email ? 'is-invalid' : ''}`}
                                        placeholder="Email address..."
                                        name="email"
                                        onChange={onInputChange}
                                        onBlur={validateEmail}
                                        value={email}
                                    />
                                    <div className='invalid-feedback'>{errors.email}</div>
                                </div>
                            </div>
                        </div>
                        <div className="row row-submit">
                            <div className="gdpr">
                                <input
                                    type="checkbox"
                                    name="tos"
                                    checked={tos}
                                    onChange={toggleChangeTos}
                                />
                                <p>I agree to the <span className="dedicated-text"><a
                                    href="/tos">Terms of use</a></span> & <span className="dedicated-text"><a
                                    href="/privacy-policy">Privacy policy*</a></span></p>
                            </div>
                            <button
                                type="submit"
                                className="create-btn"
                                disabled={disabled}
                                onChange={toggleChangeDisabled}
                            >
                                Start Now
                            </button>
                        </div>
                    </form>
                </div>
                <div className="register-image"/>
            </div>
        );
    }
}

export default EnquireOnce;