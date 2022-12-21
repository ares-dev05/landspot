import React, {useState} from 'react';

import classnames from 'classnames';
import {withAlert} from 'react-alert';
import StepLeftSection from '../StepLeftSection';

const HouseRequirementStep = ({handleNextStep, formData, handlePrevStep}) => {
    const story = Object.freeze({
        double_story: true,
        single_story: false
    });
    const [selectedStories, setStories] = useState(formData.stories || story);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState(formData.houseRequirements || {
        bedrooms: '',
        bathrooms: '',
    });

    const {bedrooms, bathrooms} = form;

    const onInputChange = e => {
        const numberedValue = Number(e.target.value.toString().replace(/[^0-9]/g, ''));
        setForm({
            ...form,
            [e.target.name]: numberedValue
        });
    };

    const validateName = e => {
        setErrors({
            ...errors,
            [e.target.name]: e.target.value.length > 0
                ? null
                : 'This field must be longer than your character'
        });
    };

    const validateFields = () => {
        return (
            (selectedStories.double_story || selectedStories.single_story)
            && Number.isInteger(bedrooms)
            && Number.isInteger(bathrooms)
        );
    };

    const beforeNextStep = () => {
        handleNextStep({
            stories: selectedStories,
            houseRequirements: form
        });
    };

    return (
        <div className="multi-step-layout">
            <StepLeftSection
                formData={formData}
                header={
                    <React.Fragment>
                        If you are unsure on double or single. <span>Mark both!</span>
                    </React.Fragment>
                }
            />
            <div className="right-section">
                <div className="section-row with-line active desktop">
                    <button className="btn-step" onClick={() => handlePrevStep()}>Back to previous section</button>
                </div>

                <div className="section-row navigation responsive">
                    <div className="step-number complete" onClick={() => handlePrevStep(3)}>&#10003;</div>
                    <div className="step-number complete" onClick={() => handlePrevStep(2)}>&#10003;</div>
                    <div className="step-number complete" onClick={() => handlePrevStep()}>&#10003;</div>
                    <div className="step-number active">4</div>
                    <div className="step-number">5</div>
                    <div className="step-number">6</div>
                </div>

                <div className="section-row">
                    <div className="step-number active desktop">4</div>
                    <p className="step-title active">House Requirements</p>
                </div>
                <div className="section-row with-line">
                    <div className="land-step-form">
                        <div className="land-radio">
                            <div
                                className={classnames('land-text', (selectedStories.double_story && 'selected'))}
                                onClick={() => setStories({
                                    ...selectedStories,
                                    double_story: !selectedStories.double_story
                                })}
                            >
                                Double story
                                {selectedStories.double_story && <div className='icon-vector'/>}
                            </div>
                            <div
                                className={classnames('land-text', (selectedStories.single_story && 'selected'))}
                                onClick={() => setStories({
                                    ...selectedStories,
                                    single_story: !selectedStories.single_story
                                })}
                            >
                                Single story
                                {(selectedStories.single_story && 'selected') && <div className='icon-vector'/>}
                            </div>
                        </div>
                        <div className="input-row">
                            <label className="form-label">How many bedrooms?</label>
                            <div className="form-group">
                                <input
                                    className='bedrooms register-input'
                                    placeholder="Write how many bedrooms..."
                                    name="bedrooms"
                                    value={bedrooms.toLocaleString()}
                                    onBlur={validateName}
                                    onChange={(e) => onInputChange(e)}
                                />
                                {errors.bedrooms && <div className='invalid-feedback'>{errors.bedrooms}</div>}
                            </div>
                        </div>
                        <div className="input-row">
                            <label className="form-label">How many bathrooms?</label>
                            <div className="form-group">
                                <input
                                    className='bathrooms register-input'
                                    placeholder="Write how many bathrooms..."
                                    name="bathrooms"
                                    value={bathrooms.toLocaleString()}
                                    onBlur={validateName}
                                    onChange={(e) => onInputChange(e)}
                                />
                                {errors.bathrooms && <div className='invalid-feedback'>{errors.bathrooms}</div>}
                            </div>
                        </div>
                        <button
                            disabled={!validateFields()}
                            className={`btn-step ${validateFields() ? 'next-step' : ''}`}
                            onClick={() => beforeNextStep()}
                        >
                            Next step
                        </button>
                    </div>
                </div>
                <div className="section-row with-line"/>
                <div className="section-row desktop">
                    <div className="step-number">5</div>
                    <p className="step-title">Finance</p>
                </div>
                <div className="section-row with-line"/>
                <div className="section-row desktop">
                    <div className="step-number">6</div>
                    <p className="step-title">SMS Verification</p>
                </div>
            </div>
        </div>
    );
};

export default withAlert(HouseRequirementStep);