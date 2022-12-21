import React from 'react';
import PropTypes from 'prop-types';
import ReadMore from '~/helpers/ReadMore';

class EstateInfo extends React.Component {
    static propTypes = {
        estate: PropTypes.object.isRequired
    };

    render() {
        const {estate} = this.props;
        return (
            <div className="estate-info">
                <div className="estate-description-wrap">
                    <p className="estate-title">{estate.name}</p>
                    <p className="description">
                        {estate.description  || 'No description for this estate.'}
                    </p>
                    {estate.description ? <ReadMore content={estate.description} maxCharacters={110}/>
                    : <p className="mobile-estate-description">No description for this estate. </p>}
                </div>
                <div className="estate-logo">
                    <div className="logo"
                         style={{backgroundImage: `url('${estate.thumbImage}')`}}
                    />
                    <div className="footer-info">
                        <div className="address">
                            <h3 className="footer-title">ADDRESS</h3>
                            <p>{estate.address}</p>
                        </div>
                        <div className="contact">
                            <p>
                                {estate.website ? (
                                    <a href={estate.website}>{estate.website}</a>
                                ) : (
                                    'No website address.'
                                )}
                            </p>
                            <p>{estate.contacts}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default EstateInfo;
