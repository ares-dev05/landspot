import React from 'react';
import PropTypes from 'prop-types';
import UserAction from '../../constants';
import EnquireDialog from './EnquireDialog';


const DialogList = ({userAction, setUserAction, userActionData}) => {


    switch (userAction) {
        case UserAction.SHOW_ENQUIRE_DIALOG:
            return <EnquireDialog setUserAction={setUserAction} userActionData={userActionData}/>;
        default:
            return null;
    }
};


DialogList.propTypes = {
    userAction: PropTypes.symbol,
    setUserAction: PropTypes.func.isRequired,
};

DialogList.defaultProps = {
    userAction: Symbol('')
};

export default DialogList;