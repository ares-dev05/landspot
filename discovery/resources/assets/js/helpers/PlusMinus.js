import React from 'react';

const PlusMinus = ({value, setValue, step = 5000}) => (
    <div className='plus-minus'>
        <button className='button default rounded' onClick={() => setValue(parseInt(value) + step)}>
            <i className="landspot-icon plus"/>
        </button>
        <button className='button default rounded' onClick={() => setValue(parseInt(value) - step)}>
            <i className="landspot-icon minus"/>
        </button>
    </div>
);

export default PlusMinus;