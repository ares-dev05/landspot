import React, {Component} from 'react';
import {ContentPanel} from '~/helpers/Panels';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {isEqual} from 'lodash';

import * as actions from '../store/popupDialog/actions';
import store from '../store';
import {LoadingSpinner} from '~/helpers';
import {withAlert} from 'react-alert';
import SitingsTable from './popups/SitingsTable';

class DraftSitingsComponent extends Component {
    static draftSitingsUrl = '/landspot/draft-sitings';
    static legacySitingsUrl = '/landspot/old-sitings';

    static propTypes = {
        getDraftSitings: PropTypes.func.isRequired,
        sitings: PropTypes.array.isRequired,
        updated: PropTypes.bool,
        oldSitings: PropTypes.bool
    };
    static defaultProps = {
        updated: false,
        oldSitings: false
    };
    state = {
        searchTerm: '',
        showDraftInviteClientDialog: false
    };

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
        const {oldSitings, getDraftSitings, getLegacySitings} = this.props;

        if (oldSitings) {
            getLegacySitings();
        } else {
            getDraftSitings();
        }
    }

    render() {
        const {searchTerm} = this.state;
        const {loading, sitings, draftFeature, deleteMySiting, cloneExistingSiting, oldSitings} = this.props;
        return (
            <ContentPanel className="my-clients_content">
                <div className="header table-header">
                    <div className="my-clients_title">{oldSitings ? 'Old Sitings' : 'Draft Sitings'}</div>
                </div>
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
                                 flex: '0 1 25%'
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
                    draftFeature={draftFeature}
                    legacySitingsMode={oldSitings}
                    sitings={sitings}
                    onDelete={id => deleteMySiting({id})}
                    cloneExistingSiting={(siting) => cloneExistingSiting(siting)}
                    searchTerm={searchTerm}
                    onSetUserAction={() => this.setState({showDraftInviteClientDialog: true})}
                />
            </ContentPanel>
        );
    }
}

const DraftSitingsInstance = withAlert(
    connect(
        state => ({
            loading: state.popupDialog.loading,
            errors: state.popupDialog.errors,
            updated: state.popupDialog.updated,
            sitings: state.popupDialog.sitings,
            newSiting: state.popupDialog.newSiting,
            draftFeature: state.myClients.draftFeature
        }),
        actions
    )(DraftSitingsComponent)
);

export {DraftSitingsInstance, DraftSitingsComponent};
