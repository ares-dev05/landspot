import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {PopupModal} from '~/popup-dialog/PopupModal';

class ResetUser2FADialog extends React.Component {
    state = {value: ''};

    render() {
        const {onConfirm, userActionData, onCancel} = this.props;
        const canDisable = this.state.value === 'DISABLE';
        return <PopupModal title="Confirm action"
                           okButtonDisabled={!canDisable}
                           onOK={() => canDisable && onConfirm(userActionData)}
                           onModalHide={onCancel}
        >
            <Fragment>
                <p>Disable two factor authorization for <b>{userActionData.user.display_name}</b>?</p>
                <p>Type <b>DISABLE</b> to confirm</p>
                <div className='landspot-input'>
                    <input type='text'
                           value={this.state.value}
                           maxLength={7}
                           onChange={e => this.setState({value: e.target.value})}
                    />
                </div>
            </Fragment>
        </PopupModal>;
    }
}

ResetUser2FADialog.propTypes = {
    userActionData: PropTypes.shape({
        user: PropTypes.object.isRequired
    }),
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default ResetUser2FADialog;
