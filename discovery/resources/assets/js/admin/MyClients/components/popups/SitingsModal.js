import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withAlert} from 'react-alert';
import {PopupModal} from '~/popup-dialog/PopupModal';
import {LoadingSpinner} from '~/helpers';
import {isEqual} from 'lodash';
import * as actions from '../../store/popupDialog/actions';
import store from '../../store';
import SitingsTable from './SitingsTable';

class SitingsModal extends React.Component {
    static propTypes = {
        onSetUserAction: PropTypes.func.isRequired,
        getLegacySitings: PropTypes.func.isRequired,
        getDraftSitings: PropTypes.func.isRequired,
        cloneExistingSiting: PropTypes.func.isRequired,
        importSiting: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired,
        loading: PropTypes.bool.isRequired,
        errors: PropTypes.array.isRequired,
        alert: PropTypes.object.isRequired,
        updated: PropTypes.bool,
        draftFeature: PropTypes.bool.isRequired,
    };
    static defaultProps = {
        updated: false
    };

    state = {
        searchTerm: ''
    };

    componentWillUnmount() {
        this.props.resetDialogStore();
    }

    componentDidUpdate(prevProps) {
        const {
            errors,
            alert: {error, success},
            updated
        } = this.props;

        if (errors && errors.length && !isEqual(prevProps.errors, errors)) {
            error(
                errors.map((error, errorIndex) => (
                    <div key={errorIndex}>{error.message || error}</div>
                )),
                {
                    onClose() {
                        store.dispatch({type: 'RESET_POPUP_MESSAGES'});
                    }
                }
            );
        }
        if (updated) {
            success('My client info updated!');
            store.dispatch({type: 'RESET_POPUP_UPDATE_FLAG'});
        }
    }

    componentDidMount() {
        const {getLegacySitings} = this.props;

        getLegacySitings();
        // getDraftSitings();
    }

    render() {
        const {
            legacySitings, newSiting, onSetUserAction, loading, draftFeature, cloneExistingSiting, importSiting
        } = this.props;
        const {searchTerm} = this.state;

        if (newSiting) {
            let a = document.createElement('a');
            document.body.append(a);
            a.href = newSiting.absoluteUrl;
            a.click();
            a.remove();

            onSetUserAction(null);
        }
        return (
            <PopupModal
                dialogClassName={'extra-wide-popup'}
                okButtonTitle={'Ok'}
                title={'Old Sitings'}
                onOK={() => onSetUserAction(null)}
                onModalHide={() => onSetUserAction(null)}
                hideCancelButton
            >
                <div className="form-rows">
                    <div className="form-row">
                        <label className="left-item"
                               style={{
                                   flex: 'auto'
                               }}>
                            Search:
                        </label>
                        <div className="landspot-input"
                             style={{
                                 flex: '100%'
                             }}>
                            <input
                                type="text"
                                autoComplete="off"
                                onChange={e => {
                                    this.setState({searchTerm: e.target.value});
                                }}
                                placeholder="Name, house or address..."
                                maxLength={150}
                                value={searchTerm || ''}
                            />
                        </div>
                    </div>
                </div>

                {loading && <LoadingSpinner className={'overlay'}/>}
                <SitingsTable
                    sitings={legacySitings}
                    cloneExistingSiting={(siting) => cloneExistingSiting(siting)}
                    importSiting={(siting) => importSiting(siting)}
                    searchTerm={searchTerm}
                    onSetUserAction={onSetUserAction}
                />
            </PopupModal>
        );
    }
}

export default withAlert(
    connect(
        state => ({
            loading: state.popupDialog.loading,
            errors: state.popupDialog.errors,
            updated: state.popupDialog.updated,
            sitings: state.popupDialog.sitings,
            newSiting: state.popupDialog.newSiting,
            legacySitings: state.popupDialog.legacySitings,
            draftFeature: state.myClients.draftFeature
        }),
        actions
    )(SitingsModal)
);