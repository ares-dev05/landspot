import React from 'react';
import classnames from 'classnames';

const Input = ({className, maxLength, ...props}) => (
    <div className={classnames('landspot-input', className)}>
        <input maxLength={maxLength || '250'} {...props}/>
    </div>
);

export default Input;