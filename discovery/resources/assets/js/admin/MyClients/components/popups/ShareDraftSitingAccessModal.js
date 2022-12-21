import React from 'react';
import {withAlert} from 'react-alert';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {PopupModal} from '~/popup-dialog/PopupModal';
import * as actions from '../../store/popupDialog/actions';
import {LoadingSpinner, NiceCheckbox} from '~/helpers';
import store from '../../store';

class ShareDraftSitingAccessModal extends React.Component {
    static propTypes = {
        onCancel: PropTypes.func.isRequired,
        getDraftSitingManagers: PropTypes.func.isRequired,
        shareDraftSiting: PropTypes.func.isRequired,
        errors: PropTypes.array.isRequired
    };

    state = {
        selectedManagers: [],
        deletedManagers: [],
    };

    componentDidMount() {
        const {siting, getDraftSitingManagers} = this.props;

        getDraftSitingManagers({id: siting.id});
    }

    componentWillUnmount() {
        this.props.resetDialogStore();
    }

    componentDidUpdate(prevProps) {
        const {
            loading,
            managers,
            alert: {success, error},
            message,
            errors
        } = this.props;

        if (prevProps.loading && !loading && managers) {
            const selectedManagers = managers.filter(
                user => user.shared_siting.length !== 0
            );

            this.setState({selectedManagers});
        }

        if (errors && errors.length) {
            error(errors.map(
                (error, errorIndex) => <div key={errorIndex}>{error.message || error}</div>
            ));
            store.dispatch({type: 'RESET_POPUP_MESSAGES'});
        }

        if (message && message.success) {
            success(message.success);
            store.dispatch({type: 'RESET_POPUP_MESSAGES'});
        }
    }

    onSelectManager = (action, managerId) => {
        const {managers} = this.props;
        let {selectedManagers, deletedManagers} = this.state;

        const user = managers.find(user => user.id === managerId);

        switch (action) {
            case 'add': {
                const deletedUser = deletedManagers.find(manager => manager.id === user.id);
                if (deletedUser) {
                    deletedManagers = deletedManagers.filter(manager => manager.id !== deletedUser.id);
                }

                selectedManagers.push(user);
            }
                break;
            case 'remove': {
                const selectedUser = selectedManagers.find(manager => manager.id === user.id);
                if (selectedUser) {
                    deletedManagers = deletedManagers.concat(selectedUser);
                }

                selectedManagers = selectedManagers.filter(manager => manager.id !== user.id);
            }
                break;
        }

        this.setState({selectedManagers, deletedManagers});
    };

    shareAccess = () => {
        const {siting, shareDraftSiting} = this.props;
        const {selectedManagers, deletedManagers} = this.state;

        shareDraftSiting({selectedManagers, deletedManagers}, siting);
    };

    render() {
        const {loading, onCancel, managers} = this.props;
        const {selectedManagers} = this.state;
        return (
            <PopupModal
                title={'Share Draft Siting'}
                onOK={this.shareAccess}
                onModalHide={onCancel}
                okButtonTitle={'Save'}
            >
                {loading && <LoadingSpinner className={'overlay'}/>}

                <div className="form-rows">
                    {managers
                        ? managers.map(
                            manager => {
                                const selected = selectedManagers.find(user => user.id === manager.id);
                                const shared = manager.shared_siting.length !== 0;
                                return <div key={manager.id} className="form-row">
                                    <NiceCheckbox
                                        checked={!!selected}
                                        label={`${manager.display_name} ${shared ? '(already shared)' : ''}`}
                                        disabled={shared}
                                        name={manager.id}
                                        onChange={() => this.onSelectManager(selected ? 'remove' : 'add', manager.id)}
                                    />
                                </div>;
                            }
                        )
                        : ''
                    }
                </div>
            </PopupModal>
        );
    }
}

export default withAlert(
    connect(
        state => ({
            managers: state.popupDialog.managers,
            errors: state.popupDialog.errors,
            message: state.popupDialog.message,
            loading: state.popupDialog.loading
        }),
        actions
    )(ShareDraftSitingAccessModal)
);
