import React, {useState} from 'react';
import {FormRowDropdown} from '~/helpers/FormRow';
import {get} from 'lodash';

const TYPE_PREFIX = 'Metro';

const SecondEnquireStep = ({nextStep, formState: {regionId = 1, buyerTypeId = 1}, regions, buyerTypes}) => {
    const [state, setState] = useState({
        regionId: regionId || get(regions, '[0].id', 1),
        buyerTypeId: buyerTypeId || get(buyerTypes, '[0].id', 1),
    });

    const handleNextStep = e => {
        e.preventDefault();
        nextStep(state);
    };

    return (
        <form onSubmit={handleNextStep} className="enquire-form">
            <div className='form-body'>
                <div className='form-item'>
                    <h4>Buyer Type</h4>
                    <FormRowDropdown
                        defaultItem={null}
                        itemClass="states-select"
                        items={
                            buyerTypes.map(({id, name}) => ({value: id, text: name}))
                        }
                        onChange={id => setState({...state, buyerTypeId: id ? parseInt(id) : null})}
                        value={state.buyerTypeId}
                    />
                </div>
                <div className='form-item'>
                    <h4>Region you want to build in (VIC)</h4>
                    <FormRowDropdown
                        defaultItem={null}
                        itemClass="states-select"
                        items={
                            regions.map(({id, name}) => ({
                                value: id, text:
                                    name !== 'Regional'
                                        ? TYPE_PREFIX + ' ' + name
                                        : name
                            }))
                        }
                        onChange={id => setState({...state, regionId: id ? parseInt(id) : null})}
                        value={state.regionId}
                    />
                </div>
            </div>
            <button className="enquire-button">Next</button>
        </form>
    );
};

export default SecondEnquireStep;