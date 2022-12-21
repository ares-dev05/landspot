import React, {useEffect, useState} from 'react';
import {isEmpty} from 'lodash';

import LandStep from './Steps/LandStep';
import FinanceStep from './Steps/FinanceStep';
import SMSVerification from './Steps/SMSVerification';
import SelectRegionStep from './Steps/SelectRegionStep';
import SelectCompanyStep from './Steps/SelectCompanyStep';
import HouseRequirementStep from './Steps/HouseRequirementStep';
import EnquireOnce from './EnquireOnce';

const steps = [
    'company',
    'region',
    'land',
    'house',
    'finance',
    'sms-verification'
];

const MultiStepForm = ({location: {state: data}, history}) => {
    const [formData, setFormData] = useState(data);
    const initialStep = 0;
    const [currentStep, setCurrentStep] = useState(initialStep);

    const stepName = steps[currentStep];

    useEffect(() => {
        if (!formData) {
            history.push(EnquireOnce.componentUrl);
        }
    }, []);

    function handleNextStep(newFormData) {
        if (!isEmpty(newFormData)) {
            setFormData({
                ...formData,
                ...newFormData
            });
            setCurrentStep(currentStep + 1);
        }
    }

    function handlePrevStep(delta = 1) {
        const step = currentStep - delta;
        if (step >= initialStep) {
            setCurrentStep(step);
        }
    }

    const props = {currentStep, formData, handleNextStep, handlePrevStep};

    if (!formData) {
        return null;
    }

    switch (stepName) {
        case 'company':
            return <SelectCompanyStep {...props} />;
        case 'region':
            return <SelectRegionStep {...props}/>;
        case 'land':
            return <LandStep {...props}/>;
        case 'house':
            return <HouseRequirementStep {...props}/>;
        case 'finance':
            return <FinanceStep {...props}/>;
        case 'sms-verification':
            return <SMSVerification {...props}/>;
        default:
            return null;
    }
};

MultiStepForm.componentUrl = '/enquire/steps/';

export default MultiStepForm;