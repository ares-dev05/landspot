import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {isEmpty} from 'lodash';

import FaqSection from '~/lotmix/components/my-lotmix/components/EstateComponent/FaqSection';
import * as actions from '../store/actions';

const EstateFaq = ({estate, getEstate, location}) => {
    useEffect(() => {
        getEstate(location.pathname);
    }, []);

    return (
        <React.Fragment>
            {!isEmpty(estate) && (
                <FaqSection estate={estate}/>
            )}
        </React.Fragment>
    );
};
EstateFaq.propTypes = {
    estate: PropTypes.object.isRequired
};

export default connect(
    state => ({
        ...state.publicEstate
    }),
    actions
)(EstateFaq);
