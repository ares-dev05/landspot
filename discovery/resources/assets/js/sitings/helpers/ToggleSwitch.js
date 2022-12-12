import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {clickHandler} from '~sitings~/helpers';

export function ToggleSwitch({onClick, text, label, state, disabled, labelPosition}) {
    const labelText = state ? text.on : text.off;
    return (
        <button type="button"
                disabled={disabled}
                className={classnames('toggle-switch', labelPosition)}
                onClick={e => clickHandler(e, onClick)}>
            {
                labelPosition === 'left' && labelText
            }
            <i className={state ? 'on' : 'off'} data-label={state ? label.on : label.off}/>
            {
                labelPosition === 'right' && labelText
            }
        </button>
    )
}

ToggleSwitch.propTypes = {
    onClick: PropTypes.func.isRequired,
    text: PropTypes.object.isRequired,
    label: PropTypes.object.isRequired,
    labelPosition: PropTypes.oneOf(['left', 'right']),
};