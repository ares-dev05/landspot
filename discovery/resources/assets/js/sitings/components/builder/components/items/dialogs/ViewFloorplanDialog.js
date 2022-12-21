import React, {Component, useState} from 'react';
import {connect} from 'react-redux';
import PropTypes from "prop-types";
import {clickHandler, LoadingSpinner, dateFormat} from '~sitings~/helpers';
import {NiceRadioGroup} from '~sitings~/helpers/NiceRadio';
import {PopupModal} from '~sitings~/components/popup-dialog/PopupModal';
import * as actions from '~sitings~/components/popup-dialog/store/actions'
import {CssStatuses, HISTORY_EXISTS_UNREAD} from './../../Floorplans';
import * as FormItem from '../index';
import classnames from "classnames";

class ViewFloorplanDialog extends Component {
    state = {
        preloader: false,
        review_status: '',
        issue_text: '',
    };

    static propTypes = {
        userActionData: PropTypes.shape({
            floorplanId: PropTypes.number.isRequired,
            // permissions: PropTypes.object.isRequired,
        }).isRequired,
        popupDialogStore: PropTypes.shape({
            // history: PropTypes.array,
        }).isRequired,
        getFloorplanData: PropTypes.func.isRequired,
        updateFloorplan: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired,
        resetFloorplanDataUpdated: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
    };

    componentDidMount() {
        const {getFloorplanData, userActionData: {floorplanId}} = this.props;
        if (floorplanId) {
            getFloorplanData({id: floorplanId});
        }
    }

    componentWillUnmount = () => {
        this.props.resetDialogStore();
    };

    static getDerivedStateFromProps(props, state) {
        const newState = {};

        const {FLOORPLAN_DATA_UPDATED} = props.popupDialogStore;

        if (FLOORPLAN_DATA_UPDATED) {
            newState.preloader = false;
            props.resetFloorplanDataUpdated();
            if (state.preloader) {
                props.alert.success('Floorplan has been successfully reviewed');
            }
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    onReviewChange = data => this.setState(data);

    setIssueStatus = issues_status => {
        this.setState({preloader: true});
        const {match: {params: {floorplanId: id}}} = this.props;
        this.props.updateFloorplan({id}, {issues_status}, {single: 1});
    };

    submitContractorReview = () => {
        const {review_status, issue_text} = this.state;
        const {match: {params: {floorplanId: id}}} = this.props;
        this.setState({preloader: true});
        this.props.updateFloorplan({id}, {review_status, issue_text}, {single: 1});
    };

    acknowledgeNotes = () => {
        const {match: {params: {floorplanId: id}}} = this.props;
        this.props.updateFloorplanHistory({id}, {is_single: true});
    };

    render() {
        const {floorplanId} = this.props.userActionData;

        const {ranges, states, floorplanData} = this.props.popupDialogStore;
        const {permissions} = this.props.userProfile;
        const {review_status, issue_text, preloader} = this.state;
        const {onReviewChange, setIssueStatus, submitContractorReview, acknowledgeNotes} = this;

        return (
            <PopupModal title={`${floorplanId ? 'Edit' : 'Create'} Floorplan`}
                        onModalHide={this.props.onCancel}
                        hideCancelButton={true}
                        onOK={this.props.onCancel}>
                <div className="floorplan-details">
                    {
                        floorplanData
                            ? <ViewFloorplan {...{
                                floorplanData,
                                ranges,
                                states,
                                permissions,
                                review_status,
                                issue_text,
                                onReviewChange,
                                setIssueStatus,
                                submitContractorReview,
                                acknowledgeNotes,
                            }}
                                             backToResults={this.backToResults}/>
                            : <LoadingSpinner/>
                    }
                    {
                        preloader && <LoadingSpinner/>
                    }
                </div>
            </PopupModal>
        );
    }
}

const ViewFloorplan = ({
                           backToResults, onReviewChange, submitContractorReview, setIssueStatus,
                           floorplanData, ranges, states, permissions: {isContractor, isAdmin},
                           review_status, issue_text,
                           acknowledgeNotes,
                       }) => {
    const {
        id: floorplanId, files, range: {state_id, name}, status, live_date, floorplan_history,
        hasUnreviewedIssues, issues, history,
    } = floorplanData;

    return (
        <div className="view-floorplan flex-fill">
            <button type='button'
                    className='close-btn transparent'
                    onClick={e => backToResults(e)}>&times;
            </button>
            <header className="floorplan-header">
                <div className='ellipsis'>Floorplan {floorplanData.name}</div>

                <div className="floorplan-status">
                    <span>
                        <i className={CssStatuses[floorplanData.status]}/>
                        {floorplanData.status}
                    </span>
                </div>
            </header>

            <div className="basic-information">
                <h5>Basic information</h5>
                <FormItem.StatesInput states={states}
                                      value={state_id}
                                      disabled={true}
                                      onFloorplanFormInputChange={null}
                />

                <FormItem.RangesInput ranges={ranges}
                                      disabled={true}
                                      state_id={state_id}
                                      value={name}
                                      onFloorplanFormInputChange={() => {
                                      }}
                />

                <FormItem.LiveDate live_date={live_date}
                                   name='view'
                                   floorplanId={floorplanId}
                                   onFloorplanFormInputChange={null}
                />
            </div>
            <div className="files-information">
                <h5>Uploaded files</h5>

                {
                    files.map((file, index) => (
                            <p className='ellipsis flex-centered file-data' key={index}>
                                <i className="fal fa-paperclip" aria-hidden="true"/>&nbsp;
                                {
                                    isContractor ? file.name : <a href={file.fileUrl}>{file.name}</a>
                                }
                            </p>
                        )
                    )
                }
                {
                    (isContractor || isAdmin) && files.length > 0 &&
                    <a href={floorplanData.zipUrl}
                       onClick={
                           () => isContractor && status === 'Attention' && !hasUnreviewedIssues &&
                               setTimeout(backToResults, 200)
                       }
                       className='button default download'>
                        DOWNLOAD&nbsp;ALL
                    </a>
                }
            </div>
            {
                isContractor && status === 'In Progress' &&
                <div className='contractor-approval'>
                    <h5>Please review this floorplan</h5>
                    <NiceRadioGroup
                        value={review_status}
                        labels={{0: 'This plan has issues', 1: 'No issues'}}
                        name='plan-review'
                        onChange={review_status => onReviewChange({review_status})}
                    />
                    {
                        review_status === '0' &&
                        <textarea placeholder='Enter the text of the issue'
                                  maxLength={255}
                                  onChange={e => onReviewChange({'issue_text': e.target.value})}
                                  value={issue_text}
                        />
                    }
                    {
                        review_status !== '' && !hasUnreviewedIssues &&
                        <button type='button'
                                onClick={submitContractorReview}
                                className={classnames('button primary', review_status === '1' ? 'ok' : 'error')}>
                            {
                                review_status === '1' ? 'SUBMIT FOR APPROVAL' : 'ISSUE'
                            }
                        </button>
                    }
                </div>
            }
            {
                (isContractor || isAdmin) &&
                <IssuesHistory {...{issues, hasUnreviewedIssues, isAdmin, isContractor, setIssueStatus}}/>
            }

            {
                floorplan_history.length > 0 &&
                <FloorplanHistory {...{floorplan_history, history, isAdmin, isContractor, acknowledgeNotes}}/>
            }
        </div>
    );
};

const FloorplanHistory = ({floorplan_history, history, isAdmin, isContractor, acknowledgeNotes}) => {
    const isBuilder = !isAdmin && !isContractor;
    const [collapsed, setState] = useState(isBuilder && history !== HISTORY_EXISTS_UNREAD);
    const ackHistory = history === HISTORY_EXISTS_UNREAD && isBuilder;

    return (
        <div className="history-notes">
            <h5>Floorplan history
                <button type='button'
                        onClick={e => clickHandler(e, setState, [!collapsed])}
                        className='button transparent'>
                    <i className={'landconnect-icon ' + (collapsed ? 'plus' : 'minus')}/>{collapsed ? 'View' : 'Hide'}
                </button>
            </h5>
            <div className='table-wrapper'>
                <table className='portal-table' style={collapsed ? {display: 'none'} : null}>
                    <thead>
                    <tr>
                        <th>DATE</th>
                        <th>EVENT</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        floorplan_history.map(({id, note, created_at, viewed}) =>
                            <tr key={id} className={(isBuilder && !viewed) ? 'unread' : null}>
                                <td className='date'>{dateFormat(created_at)}</td>
                                <td className='text'>{note}</td>
                            </tr>
                        )
                    }
                    </tbody>
                </table>
                {
                    ackHistory &&
                    <button type='button'
                            onClick={e => clickHandler(e, acknowledgeNotes)}
                            className='button default'>
                        ACKNOWLEDGE
                    </button>
                }
            </div>
        </div>
    );
};

const IssuesHistory = ({hasUnreviewedIssues, issues, isContractor, isAdmin, setIssueStatus}) => {
    return (
        <div className="history-issues">
            <h5>Issues</h5>
            {
                hasUnreviewedIssues && isContractor &&
                <p className='red'>
                    Landconnect is verifying submitted issue. Please wait.
                </p>
            }
            {
                issues &&
                <div className='table-wrapper'>
                    <table className='portal-table'>
                        <thead>
                        <tr>
                            <th>DATE</th>
                            <th>EVENT</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            issues.map(({id, issue_text, created_at}) =>
                                <tr key={id}>
                                    <td className='date'>{dateFormat(created_at)}</td>
                                    <td className='text'>{issue_text}</td>
                                </tr>
                            )
                        }
                        </tbody>
                    </table>
                </div>
            }
            {
                hasUnreviewedIssues && isAdmin &&
                <div className='issues-button-group'>
                    <button type='button'
                            onClick={() => setIssueStatus(1)}
                            className='button primary'>
                        ACCEPT ISSUES
                    </button>
                    <button type='button'
                            onClick={() => setIssueStatus(0)}
                            className='button default'>
                        REJECT ISSUES
                    </button>
                </div>
            }
        </div>
    );
};


export default connect(
    (state => ({
        popupDialogStore: state.popupDialog,
        userProfile: state.userProfile,
    })), actions
)(ViewFloorplanDialog);