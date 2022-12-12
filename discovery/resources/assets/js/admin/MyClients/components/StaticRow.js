import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import UserAction from './constants';
import {clickHandler} from '~/helpers';
import * as actions from '../store/myClients/actions';
import {connect} from 'react-redux';

const StaticRow = ({
                       clientInfo,
                       setUserAction,
                       estates,
                       onDownload,
                       isBuilder,
                       chasLotmix,
                       accepted_brief,
                       isDraftSiting,
                       allSitings
                   }) => {
    let status = 'pending';
    if (!clientInfo.email || isDraftSiting) {
        status = 'siting';
    } else if (clientInfo.user_invitations_count > 0) {
        status = 'claimed';
    } else if (clientInfo.pivot && clientInfo.pivot.status) {
        status = clientInfo.pivot.status;
    }
    const brief = status === 'brief';
    const acceptedBrief = accepted_brief || (clientInfo && clientInfo.accepted_brief);
    const documents = clientInfo.documents;
    const checkedBriefDocuments = brief && documents && documents.length;
    return (
        <tr className={clientInfo.recentlyCreated ? 'animated-row' : ''}>
            {allSitings && (
                <td colSpan='2' className='landspot-input'>
                    <p>{clientInfo.consultant || 'No Consultant'}</p>
                </td>
            )}
            <td colSpan="2" className="landspot-input">
                <p>{clientInfo.first_name || 'No first name'}</p>
            </td>
            <td colSpan="2" className="landspot-input">
                {brief
                    ? (acceptedBrief && checkedBriefDocuments
                            ? (<p>{clientInfo.last_name || 'No last name'}</p>)
                            : (<i className="far fa-lock icon-lock"/>)
                    )
                    : <p>{clientInfo.last_name || 'No last name'}</p>
                }
            </td>
            {!isBuilder && !brief ? (
                <td colSpan="2" className="landspot-input">
                    {estates.length && clientInfo.estate_short_lists.length
                        ? clientInfo.estate_short_lists
                            .reduce((accumulator, currentValue) => {
                                const estate = estates.find(
                                    estate => estate.id === currentValue.estate_id
                                );
                                if (estate && estate.name) {
                                    accumulator.push(estate.name);
                                }
                                return accumulator;
                            }, []).join(', ')
                        : 'empty'}
                </td>
            ) : (!isBuilder && <td colSpan="2"/>)}
            {isBuilder &&
            <td colSpan="2">
                <a
                    className={classnames(
                        'my-clients_view-document',
                        brief && !acceptedBrief ? 'disabled' : ''
                    )}
                    onClick={e => (!brief || acceptedBrief)
                        && clickHandler(e, setUserAction, [
                            isDraftSiting
                                ? UserAction.SHOW_SITING_DETAILS
                                : UserAction.SHOW_INVITED_USER_DETAILS_DIALOG,
                            clientInfo
                        ])
                    }
                >
                    <i className="landspot-icon eye"/>
                    View details
                </a>
            </td>
            }
            {chasLotmix && !isBuilder &&
            <td colSpan="2">
                <a
                    className="my-clients_view-document"
                    onClick={e =>
                        clickHandler(e, setUserAction, [
                            UserAction.SHOW_SHORT_LIST_DIALOG,
                            {
                                id: clientInfo.id
                            }
                        ])
                    }
                >
                    <i className="landspot-icon eye"/>
                    View
                </a>
            </td>
            }
            {chasLotmix &&
            <td colSpan="2">
                <div className="my-clients_status">
                    <div
                        className={classnames(
                            'status-dot',
                            status
                        )}
                    />
                    <span className="status-text">{isDraftSiting ? 'Draft Siting' : status}</span>
                </div>
            </td>
            }
            {isBuilder && (
                <td className="permissions">
                    <button type="button" className="button transparent"
                            onClick={e =>
                                isDraftSiting ?
                                    clickHandler(e, setUserAction, [UserAction.SHOW_DRAFT_SITING_ACCESS_DIALOG, clientInfo])
                                    : clickHandler(e, setUserAction, [
                                        UserAction.SHOW_ACCESS_DIALOG,
                                        {
                                            id: clientInfo.id
                                        }
                                    ])
                            }>
                        <i className='landspot-icon cog'/>
                    </button>
                </td>
            )}
            <td className="actions">
                {brief ? (
                        <div className="action-brief"
                             onClick={e =>
                                 clickHandler(e, setUserAction, [
                                     UserAction.SHOW_REVIEW_BRIEF_DIALOG,
                                     clientInfo
                                 ])
                             }
                        >Review Brief</div>)
                    : (
                        <a
                            onClick={e =>
                                clickHandler(e, setUserAction, [
                                    isDraftSiting ? UserAction.SHOW_CONFIRM_DELETE_SITING_DIALOG
                                        : UserAction.SHOW_CONFIRM_DELETE_MY_CLIENT_DIALOG,
                                    clientInfo
                                ])
                            }
                        >
                            <i className="landspot-icon trash"/>
                        </a>)}
                {status === 'pending' && (
                    <a
                        onClick={e =>
                            clickHandler(e, setUserAction, [
                                UserAction.SHOW_EDIT_USER_DIALOG,
                                clientInfo
                            ])
                        }
                    >
                        <i className="landspot-icon pen"/>
                    </a>
                )}
                {clientInfo.fileURL && !isDraftSiting &&
                <a onClick={() => onDownload(clientInfo)}
                   rel="noopener noreferrer"
                   target={'_blank'}>
                    <i className="fal fa-download"/>
                </a>
                }
            </td>
        </tr>
    );
};

StaticRow.propTypes = {
    setUserAction: PropTypes.func.isRequired,
    onDownload: PropTypes.func,
    isDraftSiting: PropTypes.bool,
    isBuilder: PropTypes.bool.isRequired,
    allSitings: PropTypes.bool.isRequired,
    estates: PropTypes.array.isRequired,
    clientInfo: PropTypes.shape({
        first_name: PropTypes.string.isRequired,
        last_name: PropTypes.string.isRequired,
        consultant: PropTypes.string,
        estate_short_lists: PropTypes.array,
        pivot: PropTypes.object,
        brief: PropTypes.object
    }).isRequired,
    is_brief_admin: PropTypes.bool,
    accepted_brief: PropTypes.bool
};
StaticRow.defaultProps = {
    isDraftSiting: false,
    onDownload: () => {
    }
};

export default connect(
    null,
    actions
)(StaticRow);