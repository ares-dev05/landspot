import React from 'react';
import PropTypes from 'prop-types';

const GallerySection = ({gallery}) => {
    return (
        <div className="gallery-section">
            <h2 className="estate-header">Estate Gallery</h2>
            <div className="gallery">
                {gallery.map(({id, file_url}) => (
                    <div
                        key={id}
                        className="image"
                        style={{backgroundImage: `url(${file_url})`}}
                    />
                ))}
            </div>
        </div>
    );
};

GallerySection.propTypes = {
    gallery: PropTypes.array.isRequired
};

export default GallerySection;
