import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Media from 'react-media';

import PackagesList from './PackagesList';

const documentTypes = Object.freeze([
    {key: 'quote', title: 'quote', icon: 'ic-quote'},
    {key: 'drawings', title: 'drawings', icon: 'ic-drawings'},
    {key: 'brochures', title: 'brochures', icon: 'ic-brochure'},
    {key: 'other', title: 'other', icon: 'ic-other'},
    {key: 'package', title: 'H&L package', icon: 'cube'}
]);

const MyDocumentsComponent = ({documents}) => {
    const [activeTab, setTub] = useState(0);
    const filteredDocuments = documents.filter(document => document.type_name === documentTypes[activeTab].key);

    const renderPackages = function () {
        return (
            <div className="packages">
                {filteredDocuments.length ? (
                    <PackagesList
                        key="key"
                        documents={filteredDocuments}
                    />
                ) : (
                    <p>
                        No documents have been shared
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="my-documents">
            <Media query="(min-width:761px)">
                <React.Fragment>
                    <ul className="documents-tabs">
                        {documentTypes.map((type, index) => (
                            <li className={`documents-tabs_tab ${activeTab === index ? 'active' : ''}`}
                                onClick={() => setTub(index)}
                                key={index}>
                                <i className={`landspot-icon ${type.icon}`}/>{type.title}
                            </li>))}
                    </ul>
                    {
                        renderPackages()
                    }
                </React.Fragment>
            </Media>
            <Media query="(max-width:760px)">
                <React.Fragment>
                    <div className="documents-tabs-vertical">
                        {documentTypes.map((type, index) => (
                            <div className={`documents-tabs-vertical_tab ${activeTab === index ? 'active' : ''}`}
                                 onClick={() => setTub(index)}
                                 key={index}
                            >
                                <div className='documents-tab'>
                                    <span className='tab-title'><i
                                        className={`landspot-icon ${type.icon}`}/>{type.title}</span>
                                    <i className={'angle-down landspot-icon'} aria-hidden="true"/>
                                </div>
                                {
                                    activeTab === index ? renderPackages() : null
                                }
                            </div>
                        ))}
                    </div>
                </React.Fragment>
            </Media>

        </div>
    );
}


MyDocumentsComponent.propTypes = {
    documents: PropTypes.array.isRequired,
};


export default MyDocumentsComponent;
