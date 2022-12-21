import React, {useState, useEffect} from 'react';
import {getRegions} from '../../store/actions';
import {withAlert} from 'react-alert';
import StepLeftSection from '../StepLeftSection';

const SelectRegionStep = ({handleNextStep, handlePrevStep, formData}) => {
    const [regions, setRegion] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState(formData.region);

    useEffect(() => {
        const {error} = alert;
        getRegions().then(regions => {
            setRegion(regions.data);
        }).catch(e => {
            error(<div><p>{e.response.data.message}</p></div>);
        });
    }, []);

    return (
        <div className="multi-step-layout">
            <StepLeftSection
                formData={formData}
                header={
                    <React.Fragment>
                        What region are you looking to <span>build in?</span>
                    </React.Fragment>
                }
                text="Not all home builders operate across all regions, let us know where you are looking to build!"
            />
            <div className="right-section">
                <div className="section-row with-line active desktop">
                    <button className="btn-step" onClick={() => handlePrevStep()}>Back to previous section</button>
                </div>

                <div className="section-row navigation responsive">
                    <div className="step-number complete" onClick={() => handlePrevStep()}>&#10003;</div>
                    <div className="step-number active">2</div>
                    <div className="step-number">3</div>
                    <div className="step-number">4</div>
                    <div className="step-number">5</div>
                    <div className="step-number">6</div>
                </div>

                <div className="section-row">
                    <div className="step-number active desktop">2</div>
                    <p className="step-title active">Select Region</p>
                </div>
                <div className="section-row with-line">
                    <div>
                        <div className="regions">
                            {
                                Object.values(regions).map(({id, name}, i) => {
                                    const active = selectedRegion === id;
                                    return (
                                        <div key={i}
                                             className={`region ${active ? 'selected' : ''}`}
                                             onClick={() => setSelectedRegion(id)}
                                        >
                                            {name}
                                            <div className={` ${active ? 'icon-vector' : ''} `}/>
                                        </div>
                                    );
                                })
                            }
                        </div>
                        <button
                            disabled={!selectedRegion}
                            className={`btn-step ${selectedRegion ? 'next-step' : ''}`}
                            onClick={() => handleNextStep({region: selectedRegion})}
                        >
                            Next step
                        </button>
                    </div>
                </div>
                <div className="section-row desktop">
                    <div className="step-number desktop">3</div>
                    <p className="step-title">Land Requirement</p>
                </div>
                <div className="section-row with-line"/>
                <div className="section-row desktop">
                    <div className="step-number desktop">4</div>
                    <p className="step-title">House Requirements</p>
                </div>
                <div className="section-row with-line"/>
                <div className="section-row desktop">
                    <div className="step-number desktop">5</div>
                    <p className="step-title">Finance</p>
                </div>
                <div className="section-row with-line"/>
                <div className="section-row desktop">
                    <div className="step-number desktop">6</div>
                    <p className="step-title">SMS Verification</p>
                </div>
            </div>
        </div>
    );

};

export default withAlert(SelectRegionStep);