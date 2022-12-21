import React from 'react';
import PropTypes from 'prop-types';
import {DrawerContext} from '../DrawerContainer';

const StepNavigation = ({
                            prevWithState = false, disabledNext = false, hideNext = false, hidePrev = false, saveState = false, disabledAll = false
                        }) => (
    <DrawerContext.Consumer>
        {({state: {currentStep}, setNextStep, saveDrawerData}) => (
            <div className="step-nav">
                {
                    !hidePrev &&
                    <button type="button" className='button transparent'
                            disabled={disabledAll}
                            onClick={() => saveState ? saveDrawerData(currentStep - 1) : setNextStep(currentStep - 1, prevWithState)}>
                        <i className="landconnect-icon arrow-left"/>
                    </button>
                }

                {
                    !hideNext &&
                    <button type="button" className='button next transparent'
                            disabled={disabledNext || disabledAll}
                            onClick={() => saveDrawerData(currentStep + 1)}>
                        Next step &nbsp;&nbsp;&nbsp;<i className="landconnect-icon arrow-right"/>
                    </button>
                }
            </div>
        )}
    </DrawerContext.Consumer>
);

StepNavigation.propTypes = {
    prevWithState: PropTypes.bool,
    disabledNext: PropTypes.bool,
    disabledAll: PropTypes.bool,
};

export default StepNavigation;