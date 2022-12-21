import React, {useEffect, useState} from 'react';

import classnames from 'classnames';
import {withAlert} from 'react-alert';
import StepLeftSection from '../StepLeftSection';
import {FormRowDropdown} from '~/helpers/FormRow';
import {getBuyerTypes} from '../../store/actions';

const FinanceStep = ({alert, handleNextStep, formData, handlePrevStep}) => {
    const [errors, setErrors] = useState({});
    const [buyerTypes, setBuyerTypes] = useState([]);
    const [form, setForm] = useState(formData.finance || {
        preApproval: false,
        buyerTypeId: ''
    });

    const {error} = alert;

    useEffect(() => {
        getBuyerTypes().then(response => {
            const data = response.data.map(({id, name}) => {
                return {
                    text: name,
                    value: id
                };
            });

            setBuyerTypes(data);

        }).catch(e => {
            error(<div><p>{e.response.data.message}</p></div>);
        });
    }, []);

    const {preApproval, buyerTypeId} = form;

    const validateName = e => {
        setErrors({
            ...errors,
            [e.target.name]: e.target.value.length > 0
                ? null
                : 'This field must be longer than your character'
        });
    };

    const getBuyerTypeId = (v) => {
        const buyerType = (buyerTypes.find(type => type.value === v) || '');
        return buyerType && buyerType.value || '';
    };

    return (
        <div className="multi-step-layout">
            <StepLeftSection
                formData={formData}
                header={
                    <React.Fragment>
                        You are <span>almost there!</span>
                    </React.Fragment>
                }
                text="Have you spoken to a broker or your bank? If you have pre-approval that's fantastic,let us know."
            />
            <div className="right-section">
                <div className="section-row with-line active desktop">
                    <button className="btn-step" onClick={() => handlePrevStep()}>Back to previous section</button>
                </div>

                <div className="section-row navigation responsive">
                    <div className="step-number complete" onClick={() => {
                        handlePrevStep(4);
                    }}>&#10003;</div>
                    <div className="step-number complete" onClick={() => {
                        handlePrevStep(3);
                    }}>&#10003;</div>
                    <div className="step-number complete" onClick={() => {
                        handlePrevStep(2);
                    }}>&#10003;</div>
                    <div className="step-number complete" onClick={() => handlePrevStep()}>&#10003;</div>
                    <div className="step-number active">5</div>
                    <div className="step-number">6</div>
                </div>

                <div className="section-row desktop">
                    <div className="step-number active desktop">5</div>
                    <p className="step-title active desktop">Finance</p>
                </div>
                <div className="section-row with-line">
                    <div className="land-step-form">
                        <div className="input-row">
                            <label className="form-label">Do you have pre-approval?</label>
                            <div className="form-group form-radio">
                                <div
                                    className={classnames('radio-input', preApproval && 'active')}
                                    onClick={() => setForm({...form, preApproval: true})}
                                >
                                    Yes{preApproval && <div className='icon-vector'/>}
                                </div>
                                <div
                                    className={classnames('radio-input', !preApproval && 'active')}
                                    onClick={() => setForm({...form, preApproval: false})}
                                >
                                    No{!preApproval && <div className='icon-vector'/>}
                                </div>
                                {errors.totalBudget && <div className='invalid-feedback'>{errors.totalBudget}</div>}
                            </div>
                        </div>
                        <div className="input-row">
                            <label className="form-label">Who are you?</label>
                            <div className="form-group">
                                <FormRowDropdown
                                    itemClass="states-select"
                                    defaultItem="Select buyer type"
                                    defaultValue="Select buyer type"
                                    items={buyerTypes}
                                    onBlur={validateName}
                                    onChange={(v) => setForm({
                                        ...form,
                                        buyerTypeId: getBuyerTypeId(v)
                                    })}
                                    value={form.buyerTypeId && form.buyerTypeId}
                                />
                                <div className='invalid-feedback'>{errors.state}</div>
                            </div>
                        </div>
                        <button
                            disabled={!buyerTypeId}
                            className={`btn-step ${buyerTypeId ? 'next-step' : ''}`}
                            onClick={() => handleNextStep({finance: form})}
                        >
                            Next step
                        </button>
                    </div>
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

export default withAlert(FinanceStep);