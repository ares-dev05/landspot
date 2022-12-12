import React from 'react';
import PropTypes from 'prop-types';
import {withAlert} from 'react-alert';
import {connect} from 'react-redux';

import {PopupModal} from '~sitings~/helpers';
import * as actions from '~sitings~/components/popup-dialog/store/actions';

class NextStepDialog extends React.Component {
    static propTypes = {
        onCancel: PropTypes.func.isRequired,
        resiteLot: PropTypes.func.isRequired,
    };

    render() {
        let onCancel = this.props.onCancel || (() => {});

        return (
            <PopupModal title="How Do You Want To Proceed? "
                        onModalHide={onCancel}
                        onOK={onCancel}
                        dialogClassName='wide-popup'
                        modalBodyClass='sitings-invite'
                        customFooterButtons={
                            <React.Fragment>
                                <a className={'button default'}
                                   href={'/sitings/drawer/reference-plan'}>
                                    Start New Siting
                                </a>

                                <a className={'button default'}
                                   style={{
                                       marginLeft: '10px'
                                   }}
                                   href='#' onClick={() => this.props.resiteLot()}>
                                    Site This Lot Again
                                </a>

                                {this.props.userProfile.user.myClientsUrl
                                    ? <a className={'button default'}
                                       style={{
                                           marginLeft: 'auto'
                                       }}
                                       href={this.props.userProfile.user.myClientsUrl}>
                                        Go To My Clients
                                    </a>
                                    : null
                                }
                            </React.Fragment>
                        }
                        hideCancelButton={true}
                        hideOKButton={true}>
            </PopupModal>
        );
    }
}

export default withAlert(connect(
    (state => ({
        popupDialogStore: state.popupDialog,
        userProfile: state.userProfile
    })), actions
)(NextStepDialog));