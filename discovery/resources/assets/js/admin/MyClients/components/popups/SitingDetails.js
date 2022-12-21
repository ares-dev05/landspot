import React, {useState, Fragment} from 'react';
import moment from 'moment';
import {isEmpty} from 'lodash';
import {PopupModal} from '~/popup-dialog/PopupModal';
import UserAction from '../constants';
import {connect} from 'react-redux';
import * as actions from '../../store/myClients/actions';

const SitingDetails = ({onCancel, userActionData, onSetUserAction, draftFeature, cloneExistingSiting}) => {
    const {
        id,
        lot_number,
        street,
        updated_at,
        absoluteUrl,
        first_name,
        protectedFileURL,
        last_name,
        house,
        facade,
        fileURL,
        options
    } = userActionData;

    const [editItem, setEditItem] = useState(null);

    const onDownload = siting => {
        if (draftFeature) {
            onSetUserAction(UserAction.SHOW_DRAFT_INVITE_CLIENT_DIALOG, siting);
        } else {
            window.open(siting.protectedFileURL, '_blank');
        }
    };
    const renderPopups = () => {
         if (!isEmpty(editItem)) {
            return (
                <PopupModal
                    onModalHide={() => setEditItem(null)}
                    hideCancelButton
                    okButtonTitle="Create new"
                    onOK={() => {
                        cloneExistingSiting(editItem);
                        setEditItem(null);
                    }}
                    customFooterButtons={(
                        <a
                            href={editItem.absoluteUrl}
                            className={'button primary'}
                        >Edit</a>
                    )}
                    onConfirm={() => {
                        setEditItem(null);
                    }}
                >
                    <p>Do you want to edit an existing siting or create a new one?</p>
                </PopupModal>
            );
        } else {
            return null;
        }
    };

    const dateFormat = unix =>
        moment
            .unix(unix)
            .local()
            .format('MM/DD/YY');

    const nameFormat = (first, last) => {
        const pieces = [];
        if (first && first.length) {
            pieces.push(first);
        }
        if (last && last.length) {
            pieces.push(last);
        }
        return pieces.length ? pieces.join(' ') : '—';
    };

    return <PopupModal
        dialogClassName={'extra-wide-popup'}
        okButtonTitle={'Ok'}
        title={'Siting Details'}
        onOK={onCancel}
        onModalHide={onCancel}
        hideCancelButton
    >
        <Fragment>
            {renderPopups()}
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
                <tr>
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
                        <a onClick={() => setEditItem({id, absoluteUrl})}>
                            <i className="landspot-icon pen"/>
                        </a>
                        {fileURL && protectedFileURL &&
                        <a onClick={() => onDownload(userActionData)}
                           rel="noopener noreferrer"
                           target={'_blank'}>
                            <i className="fal fa-download"/>
                        </a>}
                    </td>
                </tr>
                </tbody>
            </table>
        </Fragment>
    </PopupModal>;

};

export default connect(state => ({draftFeature: state.myClients.draftFeature}), actions)(SitingDetails);