import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';

import Accordion from './Accordion';
import classnames from 'classnames';
import EstatesMap from '~/lotmix/components/landspot/components/catalogue/EstatesMap';
import EducationIcon from '../../../icons/EducationIcon';
import HealthIcon from '../../../icons/HealthIcon';
import ShoppingIcon from '../../../icons/ShoppingIcon';
import DinningIcon from '../../../icons/DinningIcon';
import CubsIcon from '../../../icons/CubsIcon';
import AddAmenityForm from './AddAmenityForm';
import AmenitySnapshot from './AmenitySnapshot';


const categoryIcons = Object.freeze({
    education: props => <EducationIcon {...props} />,
    health: props => <HealthIcon {...props} />,
    shopping: props => <ShoppingIcon {...props} />,
    dining: props => <DinningIcon {...props} />,
    clubs: props => <CubsIcon {...props} />
});

const AmenitySection = ({
                            estate,
                            iconColor,
                            showForm,
                            addAmenity,
                            history,
                            headerText,
                            headerClassName,
                            updateSnapshots
                        }) => {
    const [place, setPlace] = useState({});

    return (
        <div className="amenity-section">
            <h2 className={classnames(headerClassName, 'dots-top-left')}>{headerText}</h2>
            <AmenitySnapshot
                iconColor={iconColor}
                showForm={showForm}
                updateSnapshots={updateSnapshots}
                estate={estate}
            />
            <div className="amenity-wrapper">
                <h3 className="amenity-title">Amenity Map For {estate.suburb} Estate</h3>
                <div className="amenity-map">
                    <div className="accordion-section">
                        {showForm && (
                            <AddAmenityForm
                                categories={Object.keys(categoryIcons)}
                                setPlace={setPlace}
                                estateId={estate.id}
                                addAmenity={addAmenity}
                            />
                        )}
                        <Accordion
                            estateAmenities={estate.sortEstateAmenities || {}}
                            categories={categoryIcons}
                            iconColor={iconColor}
                            setPlace={setPlace}
                        />
                    </div>
                    <div className="estate-map-section">
                        <EstatesMap
                            showPlace={place}
                            amenityIcons={categoryIcons}
                            amenityColor={iconColor}
                            onMounted={() => {
                            }}
                            displayMap
                            singleEstate
                            estates={[estate]}
                            setMapState={() => {
                            }}
                            onEstateSelect={
                                (estateID) => {
                                    history.push('/landspot/estate/' + estateID);
                                }
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

AmenitySection.propTypes = {
    estate: PropTypes.object.isRequired,
    addAmenity: PropTypes.func,
    iconColor: PropTypes.any,
    showForm: PropTypes.bool,
    headerText: PropTypes.string,
    headerClassName: PropTypes.string,
    updateSnapshots: PropTypes.func
};
AmenitySection.defaultProps = {
    showForm: false,
    addAmenity: () => {},
    headerText: 'Local Amenities in Suburb',
    headerClassName: 'estate-header',
    updateSnapshots: () => {},
};

export default withRouter(AmenitySection);
