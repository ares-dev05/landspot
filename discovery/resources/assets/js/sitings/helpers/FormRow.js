import React from 'react';
import classnames from 'classnames';
import NiceDropdown from './NiceDropdown';

export const FormRowInput = ({id, label, inputClassName, type = 'text', ...props}) => (
    <div className='form-row'>
        <label htmlFor={id}
               className='left-item'>{label}</label>
        <div className={classnames('landspot-input right-item', inputClassName)}>
            <input autoComplete='off' type={type} id={id} {...props}/>
        </div>
    </div>
);
export const FormRowDropdown = ({label, itemClass, ...props}) => (
    <div className="form-row">
        <label className="left-item">{label}</label>
        <NiceDropdown itemClass={classnames('right-item', itemClass)}
                      {...props}
        />
    </div>
);