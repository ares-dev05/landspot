import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {isEmpty} from 'lodash';

import AmenitySection from '~/lotmix/components/my-lotmix/components/EstateComponent/AmenitySection';
import * as actions from '../store/actions';

const EstateAmenities = ({estate, getEstate, location}) => {
    useEffect(() => {
        getEstate(location.pathname);
    }, []);

    return (
        <div>
            {!isEmpty(estate) && (
                <AmenitySection estate={estate}
                                iconColor="#29C97C"
                                headerText={`Local Amenities in ${estate.suburb}`}
                                headerClassName="estate-subheader"/>
            )}
        </div>
    );
};
EstateAmenities.propTypes = {
    estate: PropTypes.object.isRequired
};

export default connect(
    state => ({
        ...state.publicEstate
    }),
    actions
)(EstateAmenities);
