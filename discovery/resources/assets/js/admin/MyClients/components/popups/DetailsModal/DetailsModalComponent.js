import React from 'react';
import {withAlert} from 'react-alert';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {PopupModal} from '~/popup-dialog/PopupModal';
import * as actions from '../../../store/popupDialog/actions';
import {LoadingSpinner} from '~/helpers';
import classnames from 'classnames';
import ShortListComponent from './ShortListComponent';
import SitingsTableComponent from './SitingsTableComponent';
import UploadDocumentsComponent from './UploadDocumentsComponent';
import BriefComponent from './BriefComponent';

class DetailsModalComponent extends React.Component {
    static propTypes = {
        getInvitedUserDetails: PropTypes.func.isRequired,
        updateUserDetails: PropTypes.func.isRequired,
        cloneExistingSiting: PropTypes.func.isRequired,
        viewDocument: PropTypes.func.isRequired,
        deleteInvitedUserSiting: PropTypes.func.isRequired,
        houses: PropTypes.array.isRequired,
        shortLists: PropTypes.array.isRequired,
        loading: PropTypes.bool.isRequired,
        userActionData: PropTypes.shape({
            id: PropTypes.number.isRequired
        }).isRequired,
        errors: PropTypes.array,
        updated: PropTypes.bool,
        sitings: PropTypes.array.isRequired,
        isBuilder: PropTypes.bool.isRequired,
        estates: PropTypes.array,
        documents: PropTypes.array.isRequired,
        is_brief_admin: PropTypes.bool,
        accepted_brief: PropTypes.bool
    };
    static defaultProps = {
        updated: false,
        errors: [],
        estates: []
    };
    state = {
        activeSection: null,
        isFirstActive: false,
        createdShortLists: [],
        removedShortLists: [],
        removedDocuments: []
    };

    componentDidMount() {
        const {userActionData, getInvitedUserDetails} = this.props;
        getInvitedUserDetails(userActionData);
    }

    componentWillUnmount() {
        this.props.resetDialogStore();
    }

    componentDidUpdate() {
        const {
            errors,
            alert: {error, success},
            onCancel,
            updated
        } = this.props;

        if (errors && errors.length) {
            error(
                errors.map((error, errorIndex) => (
                    <div key={errorIndex}>{error.message || error}</div>
                ))
            );
            onCancel();
        }
        if (updated) {
            success('User details updated!');
            onCancel();
        }

        if (!this.state.isFirstActive && !!this.getDetails().length) {
            const sitingIndex = this.getDetails().findIndex(item => item.toLowerCase() === 'siting');
            this.setState({
                activeSection: sitingIndex >= 0 ? sitingIndex : 0,
                isFirstActive: true
            });
        }
    }

    setActiveSection = activeSection => this.setState({activeSection});
    onSaveChanges = () => {
        const {
            onCancel,
            updateUserDetails,
            alert: {success}
        } = this.props;
        const {createdShortLists, removedShortLists, removedDocuments} = this.state;

        if (createdShortLists.length || removedShortLists.length || removedDocuments.length) {
            updateUserDetails({
                removedShortLists,
                createdShortLists,
                removedDocuments
            });
        } else {
            success('User details updated!');
            onCancel();
        }
    };

    onDocumentDelete = id => {
        const {removedDocuments} = this.state;
        if (!removedDocuments.includes(id)) {
            this.setState({
                removedDocuments:
                    [...removedDocuments, id]
            });
        }
    };
    getDetails = key => {
        const {userActionData} = this.props;
        const details = {};
        if (this.props.is_brief_admin
            && this.props.accepted_brief
        ) {
            details['Brief'] = () => <BriefComponent userActionData={this.props.userActionData}/>;
        }
        if (!userActionData.email) {
            details['Siting'] = () => <SitingsTableComponent userActionData={userActionData}
                                                             deleteInvitedUserSiting={this.props.deleteInvitedUserSiting}
                                                             newSiting={this.props.newSiting}
                                                             sitings={this.props.sitings}
                                                             cloneExistingSiting={this.props.cloneExistingSiting}/>;
        } else {
            details['Short List'] = () => (userActionData.email && <ShortListComponent
                houses={this.props.houses}
                clientId={userActionData.id}
                shortLists={this.props.shortLists}
                onUpdateRemoveShortList={removedShortLists => this.setState({removedShortLists})}
                onUpdateCreateShortList={createdShortLists => this.setState({createdShortLists})}
                removedShortLists={this.state.removedShortLists}
                createdShortLists={this.state.createdShortLists}/>);

            details['Siting'] = () => <SitingsTableComponent userActionData={userActionData}
                                                             deleteInvitedUserSiting={this.props.deleteInvitedUserSiting}
                                                             newSiting={this.props.newSiting}
                                                             sitings={this.props.sitings}
                                                             cloneExistingSiting={this.props.cloneExistingSiting}/>;

            details['Documents'] = () => (userActionData.email &&
                <UploadDocumentsComponent userActionData={userActionData}
                                          sitings={this.props.sitings}
                                          houses={this.props.houses}
                                          viewDocument={this.props.viewDocument}
                                          estates={this.props.estates}
                                          uploadDocument={this.props.uploadDocument}
                                          documents={this.props.documents.filter(
                                              item => !this.state.removedDocuments.includes(item.id)
                                          )}
                                          onDocumentDelete={this.onDocumentDelete}
                                          onCreateDocument={this.onCreateDocument}
                                          isBuilder={this.props.isBuilder}/>);
        }

        return key ? details[key]() : Object.keys(details);
    };

    render() {
        const {loading, onCancel, userActionData} = this.props;
        const {activeSection} = this.state;
        return (
            <PopupModal
                hideCancelButton
                title={(<div
                    className="user-name">Details <span>{`${userActionData.first_name} ${userActionData.last_name}`}</span>
                </div>)}
                dialogClassName={'details-popup'}
                onOK={this.onSaveChanges}
                onModalHide={onCancel}
                okButtonTitle={'Save changes'}
            >
                {loading && <LoadingSpinner className={'overlay'}/>}
                <div className="details-accordion">
                    {this.getDetails().map((key, index) => (
                        <div key={index}>
                            <div
                                onClick={() =>
                                    this.setActiveSection(
                                        activeSection === index ? null : index
                                    )
                                }
                                className={classnames([
                                    'category',
                                    activeSection === index ? 'active' : ''
                                ])}
                            >
                                <span>{key}</span>
                                {activeSection === index ? (
                                    <i className="far fa-angle-up carpet"/>
                                ) : (
                                    <i className="far fa-angle-down carpet"/>
                                )}
                            </div>
                            {activeSection === index && this.getDetails(key)}
                        </div>
                    ))}
                </div>
            </PopupModal>
        );
    }
}

export default withAlert(
    connect(
        state => ({
            houses: state.myClients.houses,
            estates: state.myClients.estates,
            documents: state.popupDialog.documents,
            shortLists: state.popupDialog.shortLists,
            sitings: state.popupDialog.sitings,
            updated: state.popupDialog.updated,
            errors: state.popupDialog.errors,
            loading: state.popupDialog.loading,
            newSiting: state.popupDialog.newSiting,
            accepted_brief: state.popupDialog.accepted_brief
        }),
        actions
    )(DetailsModalComponent)
);