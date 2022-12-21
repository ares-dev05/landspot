import React from 'react';
import {NavLink} from 'react-router-dom';

const StepLeftSection = ({header, text, formData: {firstName, lastName, email, tos}}) => (
    <div className="step-details">
        <div className="details-wrapper">
            <NavLink to={{
                pathname: '/enquire',
                state: {firstName, lastName, email, tos}
            }}
                     className='back-nav step-back-enquire'
            >
                <i className="fal fa-arrow-left"/>
                <span> Back to enquire once</span>
            </NavLink>
            <div className="step-header">
                {header}
            </div>
            <div className="step-text">{text}</div>
            <div className="sms-details">
                <div className="phone-img"/>
                <div className="description">
                    This process requires SMS verification. Have your phone ready.
                </div>
            </div>
        </div>
    </div>
);

export default StepLeftSection;
