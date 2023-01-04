import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Checkbox from '~/../img/Checkbox.svg';
import CheckboxChecked from '~/../img/Checkbox-checked.svg';

const HouseRadioGroup = ({value, radioClass, labels = {'0': 'No', '1': 'Yes'}, name, onChange}) => {
    return (
        <div className={classnames('nice-radio', radioClass)}>
            {
                Object.keys(labels).map(key => {
                        const checked = String(value) === key.toString();
                        return (
                            <div key={key}
                                 className='radio-item'>
                                <label role="radio" aria-checked={checked}>
                                    <input name={name}
                                           checked={checked}
                                           type="radio"
                                           value={key}
                                           onChange={e => onChange && onChange(e.target.value)}
                                    />
                                    <i className="fa"/>
                                    <span>{labels[key].replace('_', ' ')}</span>
                                </label>
                            </div>
                        )
                    }
                )
            }
        </div>
    );
};

HouseRadioGroup.propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    name: PropTypes.string,
    radioClass: PropTypes.string,
    labels: PropTypes.object,
    onChange: PropTypes.func
};

const HouseRadio= ({value, radioClass, label = 'Check me', name, onChange, checked = false}) => {
    return (
        <div className={classnames('nice-radio', radioClass)}>
            <div className='radio-item'>
                <label role="radio" aria-checked={checked} onClick={e => onChange && onChange(value)}>
                    <img 
                           src={checked == true? CheckboxChecked : Checkbox}
                    />
                    <span>{name}</span>
                </label>
            </div>
        </div>
    );
};

HouseRadio.propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    name: PropTypes.string,
    radioClass: PropTypes.string,
    label: PropTypes.string,
    onChange: PropTypes.func
};

export {HouseRadioGroup, HouseRadio};