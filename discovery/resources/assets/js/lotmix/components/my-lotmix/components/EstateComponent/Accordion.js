import React, {useState} from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';

const Accordion = ({categories, iconColor, estateAmenities, setPlace}) => {
    const [activeSection, setActiveSection] = useState(null);

    return (
        <div className="amenities-accordion">
            {Object.keys(categories).map((key, index) => (
                <div key={index}>
                    <div
                        onClick={() =>
                            setActiveSection(
                                activeSection === index ? null : index
                            )
                        }
                        className={classnames([
                            'category',
                            activeSection === index ? 'active' : ''
                        ])}
                    >
                        {categories[key]({
                            active: activeSection === index,
                            color: (typeof iconColor === 'string') ? iconColor : iconColor[key]
                        })}
                        {key}
                        {activeSection === index ? (
                            <i className="far fa-angle-up carpet" />
                        ) : (
                            <i className="far fa-angle-down carpet" />
                        )}
                    </div>
                    {activeSection === index && (
                        <ol className="amenity-list">
                            {estateAmenities[key] &&
                                estateAmenities[key].map((val, index) => (
                                    <li
                                        key={index}
                                        onClick={() =>
                                            setPlace({
                                                geometry: {
                                                    location: {
                                                        lat: parseFloat(
                                                            val.lat
                                                        ),
                                                        lng: parseFloat(
                                                            val.long
                                                        )
                                                    }
                                                }
                                            })
                                        }
                                    >
                                        {val.name}
                                    </li>
                                ))}
                        </ol>
                    )}
                </div>
            ))}
        </div>
    );
};

Accordion.propTypes = {
    categories: PropTypes.instanceOf(Object).isRequired,
    estateAmenities: PropTypes.object.isRequired,
    setPlace: PropTypes.func.isRequired
};
export default Accordion;
