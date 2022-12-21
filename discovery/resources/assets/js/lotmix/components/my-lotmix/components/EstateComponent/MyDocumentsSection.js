import React from 'react';
import PropTypes from 'prop-types';

const MyDocumentsSection = ({documents}) => {
    console.log(documents);
    return (
        <div className="my-documents-section">
            <h2 className="estate-header">My Documents</h2>
            <div className="documents">
                {documents.map(({id, thumbImage, fileURL}) => (
                    <a
                        target="_blank"
                        href={`/my-document/${id}`}
                        key={id}
                        className="document"
                        style={{backgroundImage: `url('${thumbImage || fileURL}')`}}
                    />
                ))}
            </div>
        </div>
    );
};

MyDocumentsSection.propTypes = {
    documents: PropTypes.array.isRequired
};

export default MyDocumentsSection;
