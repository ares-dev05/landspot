import React from 'react';
import PropTypes from 'prop-types';
import UserAction from '../../constants';
import {withAlert} from 'react-alert';
import BriefComponent from './BriefComponent';
import {PopupModal} from '~/popup-dialog/PopupModal';
import {connect} from 'react-redux';
import * as actions from '../../../store/myClients/actions';

class BriefModalComponent extends React.Component {

    static propTypes = {
        acceptBriefClient: PropTypes.func.isRequired,
        rejectBriefClient: PropTypes.func.isRequired,
        company: PropTypes.object.isRequired,
        userActionData: PropTypes.object,
        alert: PropTypes.func
    };

    isEmptyObject = (value) => (Object.keys(value).length === 0);

    acceptBrief = async () => {
        const {userActionData, alert: error} = this.props;

        try {
            await this.props.acceptBriefClient({
                accepted_brief: true,
                brief_id: userActionData.brief.id
            });
        } catch (e) {
            if (e.response.data.errors && !this.isEmptyObject(e.response.data.errors)) {
                error(
                    Object.values(e.response.data.errors).flat().map(
                        (msg, errorIndex) => <div key={errorIndex}><p>{msg}</p></div>
                    )
                );
            }
            (e.response.data.message && error(<div><p>{e.response.data.message}</p></div>));
        }

        this.props.setUserAction(UserAction.SHOW_INVITED_USER_DETAILS_DIALOG, userActionData);
    }

    rejectBrief = async () => {
        const {userActionData, onCancel, alert: {error}} = this.props;

        try {
            await this.props.rejectBriefClient({
                accepted_brief: false,
                brief_id: userActionData.brief.id
            });
        } catch (e) {
            if (e.response.data.errors && !this.isEmptyObject(e.response.data.errors)) {
                error(
                    Object.values(e.response.data.errors).flat().map(
                        (msg, errorIndex) => <div key={errorIndex}><p>{msg}</p></div>
                    )
                );
            }
            (e.response.data.message && error(<div><p>{e.response.data.message}</p></div>));
        }
        onCancel();
    }

    render() {
        const {onCancel, userActionData} = this.props;
        return (
            <PopupModal
                title={(<div
                    className="brief-header">Brief
                </div>)}
                dialogClassName={'brief-popup'}
                hideCancelButton
                hideOKButton={userActionData.accepted_brief}
                onOK={this.acceptBrief}
                okButtonTitle={'Accept'}
                onModalHide={onCancel}
                customFooterButtons={
                    !userActionData.accepted_brief
                        ? (<button className={'button reject'}
                                   onClick={this.rejectBrief}>
                            Reject
                        </button>)
                        : null
                }
            >
                <BriefComponent userActionData={userActionData}/>
            </PopupModal>
        );
    }
}

BriefModalComponent.propTypes = {
    onCancel: PropTypes.func,
    userActionData: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    setUserAction: PropTypes.func.isRequired
};


export default withAlert(
    connect(
        null,
        actions
    )(BriefModalComponent)
);