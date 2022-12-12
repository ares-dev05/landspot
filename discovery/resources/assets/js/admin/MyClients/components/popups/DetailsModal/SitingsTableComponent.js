import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {ConfirmDialog, PopupModal} from '~/popup-dialog/PopupModal';
import {isEmpty} from 'lodash';
import moment from 'moment';

class SitingsTableComponent extends React.Component {
    static propTypes = {
        cloneExistingSiting: PropTypes.func.isRequired,
        sitings: PropTypes.array.isRequired,
        userActionData: PropTypes.object.isRequired,
        deleteInvitedUserSiting: PropTypes.func.isRequired,
    };
    state = {
        deleteItem: null,
        editItem: null,
    };

    static getDerivedStateFromProps(props) {
        const {
            newSiting
        } = props;

        if (newSiting) {
            let a = document.createElement('a');
            document.body.append(a);
            a.href = newSiting.absoluteUrl;
            a.click();
            a.remove();
        }
        return null;
    }

    onDelete = sitingId => {
        const {deleteInvitedUserSiting, userActionData} = this.props;
        deleteInvitedUserSiting({siting_id: sitingId}, {id: userActionData.id});
    };
    dateFormat = unix =>
        moment
            .unix(unix)
            .local()
            .format('MM/DD/YY');
    nameFormat = (first, last) => {
        const pieces = [];
        if (first && first.length) {
            pieces.push(first);
        }
        if (last && last.length) {
            pieces.push(last);
        }
        return pieces.length ? pieces.join(' ') : '—';
    };

    render() {
        const {sitings, cloneExistingSiting, userActionData} = this.props;
        const {deleteItem, editItem} = this.state;
        const {onDelete, dateFormat, nameFormat} = this;
        return (
            <Fragment>
                {!isEmpty(deleteItem) && (
                    <ConfirmDialog
                        onCancel={() => this.setState({deleteItem: null})}
                        onConfirm={() => {
                            this.setState({deleteItem: null});
                            onDelete(deleteItem.id);
                        }}
                    >
                        <p>Are you sure wish to delete the siting?</p>
                    </ConfirmDialog>
                )}
                {!isEmpty(editItem) && (
                    <PopupModal
                        onModalHide={() => this.setState({editItem: null})}
                        hideCancelButton
                        okButtonTitle="Create new"
                        onOK={() => {
                            cloneExistingSiting(editItem, {clientId: userActionData.id});
                            this.setState({editItem: null});
                        }}
                        customFooterButtons={(
                            <a
                                href={editItem.absoluteUrl}
                                className={'button primary'}
                            >Edit</a>
                        )}
                        onConfirm={() => {
                            this.setState({editItem: null});
                        }}
                    >
                        <p>Do you want to edit an existing siting or create a new one?</p>
                    </PopupModal>
                )}
                <table className="table">
                    <thead>
                    <tr>
                        <th title="Date" colSpan="2">
                            DATE
                        </th>
                        <th title="Client" colSpan="2">
                            CLIENT
                        </th>
                        <th title="Floorplan" colSpan="2">
                            FLOORPLAN
                        </th>
                        <th title="Facade" colSpan="2">
                            FACADE
                        </th>
                        <th title="Options" colSpan="2">
                            OPTIONS
                        </th>
                        <th title="Lot no" colSpan="2">
                            LOT NO.
                        </th>
                        <th title="Street" colSpan="2">
                            STREET
                        </th>
                        <th title="Action">ACTION</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sitings.length ? (
                        sitings.map(
                            ({
                                 id,
                                 lot_number,
                                 street,
                                 updated_at,
                                 first_name,
                                 last_name,
                                 house,
                                 protectedFileURL,
                                 facade,
                                 options,
                                 absoluteUrl,
                                 fileURL
                             }) => (
                                <tr key={id}>
                                    <td colSpan="2">
                                        {dateFormat(updated_at)}
                                    </td>
                                    <td colSpan="2">
                                        {nameFormat(first_name, last_name)}
                                    </td>
                                    <td colSpan="2">{house || '—'}</td>
                                    <td colSpan="2">{facade || '—'}</td>
                                    <td colSpan="2">{options || '—'}</td>
                                    <td colSpan="2">{lot_number || '—'}</td>
                                    <td colSpan="2">{street || '—'}</td>
                                    <td className="actions">
                                        <a onClick={() => this.setState({deleteItem: {id}})}>
                                            <i className="landspot-icon trash"/>
                                        </a>
                                        <a onClick={() => this.setState({editItem: {id, absoluteUrl}})}>
                                            <i className="landspot-icon pen"/>
                                        </a>
                                        {fileURL && protectedFileURL &&
                                        <a href={protectedFileURL}
                                           rel="noopener noreferrer"
                                           target={'_blank'}>
                                            <i className="fal fa-cloud-download"/>
                                        </a>
                                        }
                                    </td>
                                </tr>
                            )
                        )
                    ) : (
                        <tr>
                            <td className="my-clients-table_one-cell">
                                Table is empty
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </Fragment>
        );
    }
}

export default SitingsTableComponent;
