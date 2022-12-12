import React from 'react';
import PropTypes from 'prop-types';

const ContentSectionComponent = ({
                                     title = '',
                                     editInfo = '',
                                     subMain = false,
                                     children
                                 }) => (
    <div className='content-section'>
        {title &&
        <div className='section-title'>
            <span className='title'>{title}</span>
            {editInfo && <span className='edit-info'>{editInfo}</span>}
        </div>
        }
        <div className={`section-main ${subMain ? 'sub-main-section' : ''}`}>
            {children}
        </div>
    </div>
);


ContentSectionComponent.propTypes = {
    title: PropTypes.string,
    editInfo: PropTypes.string,
    subMain: PropTypes.bool,
    subTitle: PropTypes.string,
    children: PropTypes.node
};

export default ContentSectionComponent;