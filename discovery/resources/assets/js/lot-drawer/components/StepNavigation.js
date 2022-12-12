import React from 'react';
import PropTypes from 'prop-types';
import {LotDrawerContext} from '../LotDrawerContainer';

const StepNavigation = ({
                            prevWithState = false, disabledNext = false, hideNext = false, saveState = false
                        }) => (
    <LotDrawerContext.Consumer>
        {({state: {currentStep}, setNextStep, saveDrawerData}) => (
            <div className="step-nav">
                <button type="button" className='button transparent'
                        onClick={() => saveState ? saveDrawerData(currentStep - 1) : setNextStep(currentStep - 1, prevWithState)}>
                    <i className="landspot-icon arrow-left"/>
                </button>

                {
                    !hideNext &&
                    <button type="button" className='button transparent'
                            disabled={disabledNext}
                            onClick={() => saveDrawerData(currentStep + 1)}>
                        Next step &nbsp;&nbsp;&nbsp;<i className="landspot-icon arrow-right"/>
                    </button>
                }
            </div>
        )}
    </LotDrawerContext.Consumer>
);

StepNavigation.propTypes = {
    prevWithState: PropTypes.bool,
    disabledNext: PropTypes.bool,
};

export default StepNavigation;