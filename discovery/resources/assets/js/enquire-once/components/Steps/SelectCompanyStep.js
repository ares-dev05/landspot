import React, {useEffect, useState} from 'react';
import {xor, get} from 'lodash';
import {withAlert} from 'react-alert';
import {getBuilders} from '../../store/actions';
import StepLeftSection from '../StepLeftSection';

const SelectCompanyStep = ({alert, handleNextStep, formData}) => {
    const [builders, setBuilders] = useState([]);
    const [selectedCompanies, setSelectedCompanies] = useState(get(formData, 'companies', []));

    useEffect(() => {
        const {error} = alert;
        getBuilders().then(response => {
            setBuilders(response.data);
        }).catch(e => {
            error(<div><p>{e.response.data.message}</p></div>);
        });
    }, []);

    const onCompanySelect = id => {
        const result = xor(selectedCompanies, [id]);
        setSelectedCompanies(result);
    };

    return (
        <div className="multi-step-layout first-step">
            <StepLeftSection
                formData={formData}
                header={
                    <React.Fragment>
                        Complete your enquiry, <span>{get(formData, 'firstName', '')}!</span>
                    </React.Fragment>
                }
                text="Sick of trying to work out what land is available or if a floorplan will work on your lot of and? Fill out this short form so builders can help you find the information you need."
            />
            <div className="right-section">
                <div className="section-row navigation responsive">
                    <div className="step-number active">1</div>
                    <div className="step-number">2</div>
                    <div className="step-number">3</div>
                    <div className="step-number">4</div>
                    <div className="step-number">5</div>
                    <div className="step-number">6</div>
                </div>

                <div className="section-row">
                    <div className="step-number active desktop">1</div>
                    <p className="step-title active">
                        Select <span>Victorian builders</span> you would like information from:
                    </p>
                </div>
                <div className="section-row with-line">
                    <div className="card-block-holder">
                        <div className="card-block">
                            <div className="cards-list">
                                {
                                    builders.map(({id, company_small_logo}) => {
                                            const active = selectedCompanies.includes(id);
                                            return (
                                                <div key={id}
                                                     className={`card ${active ? 'selected' : ''}`}
                                                     onClick={() => onCompanySelect(id)}
                                                >
                                                    <div className="card-image" style={{
                                                        backgroundImage: `url(${company_small_logo})`
                                                    }}
                                                    >
                                                        {active && <div className='icon-vector'/>}
                                                    </div>
                                                </div>);
                                        }
                                    )
                                }
                            </div>
                        </div>
                        <button
                            disabled={!selectedCompanies.length}
                            className={`btn-step ${selectedCompanies.length ? 'next-step' : ''}`}
                            onClick={() => handleNextStep({
                                companies: selectedCompanies
                            })}
                        >
                            Next step
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default withAlert(SelectCompanyStep);