import React from 'react';

const OfferBlock = ({header, description, buttonText, link = '#'}) => {
    return (
        <div className='offer-block-container'>
            <div className='header'>{header}</div>
            <div className='description'>{description}</div>
            <a href={link} className='button-text'>{buttonText}</a>
        </div>
    );
};

export default OfferBlock;