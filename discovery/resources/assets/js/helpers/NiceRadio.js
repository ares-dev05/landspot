import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const NiceRadioGroup = ({
    value,
    radioClass,
    labels = {'0': 'No', '1': 'Yes'},
    name,
    onChange
}) => {
    return (
        <div className={classnames('nice-radio', radioClass)}>
            {Object.keys(labels).map(key => (
                <div key={key} className="radio-item">
                    <label role="radio">
                        <input
                            name={name}
                            checked={value.toString() === key.toString()}
                            type="radio"
                            value={key}
                            onChange={e => onChange && onChange(e.target.value)}
                        />
                        <i className="fa" />
                        <span>{labels[key].replace('_', ' ')}</span>
                    </label>
                </div>
            ))}
        </div>
    );
};

NiceRadioGroup.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    radioClass: PropTypes.string,
    labels: PropTypes.object,
    onChange: PropTypes.func
};

const NiceRadio = ({
    value,
    radioClass,
    label = 'Check me',
    name,
    onChange,
    checked = false
}) => {
    return (
        <div className={classnames('nice-radio', radioClass)}>
            <div className="radio-item">
                <label role="radio" aria-checked={checked}>
                    <input
                        name={name}
                        checked={checked}
                        type="radio"
                        value={value}
                        onChange={e => onChange && onChange(e.target.value)}
                    />
                    <i className="fa" />
                    <span>{label}</span>
                </label>
            </div>
        </div>
    );
};

NiceRadio.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    radioClass: PropTypes.string,
    label: PropTypes.string,
    onChange: PropTypes.func
};

export {NiceRadioGroup, NiceRadio};
