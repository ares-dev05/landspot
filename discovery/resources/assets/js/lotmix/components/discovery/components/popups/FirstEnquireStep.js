import React, {useState} from 'react';
import {validateEmail} from '~/helpers';

const FirstEnquireStep = ({nextStep, formState:{firstName, lastName, email}}) => {
    const [state, setState] = useState({
        firstName,
        lastName,
        email,
    });

    const handleNextStep = e => {
        e.preventDefault();
        const validator = {
            email: 'Enter a valid email address',
            firstName: 'Please fill first name field.',
            lastName: 'Please fill last name field.',
        };
        const errors = validateForm(validator);

        nextStep(state, errors);
    };

    const validateForm = (validator) => {

        const errors = Object
            .keys(validator)
            .reduce((accumulator, key) => {
                const value = state[key];
                let msg;

                if (key === 'email' && !validateEmail(value)) {
                    msg = validator[key];
                }

                if ((Array.isArray(value) && !value.length) || !value || /^\s*$/.test(value.toString())) {
                    msg = validator[key];
                }

                if (msg) {
                    accumulator.push(msg);
                }

                return accumulator;
            }, []);

        if (errors.length) {
            return errors;
        }

        return null;
    };

    return (
            <form onSubmit={handleNextStep} className="enquire-form">
                <div className='form-body'>
                    <div className='form-item'>
                        <h4>Name</h4>
                        <input
                            type="text"
                            className="enquire-input"
                            value={state.firstName}
                            name="name"
                            onChange={e => setState({...state, firstName: e.currentTarget.value})}
                            placeholder='First name...'
                        />
                        <input
                            type="text"
                            className="enquire-input"
                            value={state.lastName}
                            name="email"
                            onChange={e => setState({...state, lastName: e.currentTarget.value})}
                            placeholder='Last name...'
                        />
                    </div>
                    <div className='form-item'>
                        <h4>Email</h4>
                        <input
                            type="text"
                            className="enquire-input"
                            value={state.email}
                            name="phone"
                            placeholder='Email adress...'
                            onChange={e => setState({...state, email: e.currentTarget.value})}
                        />
                    </div>
                </div>
                <button className="enquire-button">Next</button>
            </form>
    );
};

export default FirstEnquireStep;