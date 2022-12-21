import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import * as actions from '~sitings~/components/popup-dialog/store/actions'
import {dateFormat, LoadingSpinner, PopupModal} from '~sitings~/helpers';
import {HISTORY_EXISTS_UNREAD} from '../../Floorplans';

class ViewFloorplanHistoryDialog extends React.Component {
    state = {
        preloader: false
    };

    static propTypes = {
        userActionData: PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            filters: PropTypes.object.isRequired,
        }).isRequired,
        popupDialogStore: PropTypes.shape({
            floorplanHistory: PropTypes.array,
        }).isRequired,
        updateFloorplanHistory: PropTypes.func.isRequired,
        getFloorplanHistory: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired,
        resetErrorMessages: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.props.getFloorplanHistory({id: this.props.userActionData.id});
    }

    componentWillUnmount = () => {
        this.props.resetDialogStore();
    };

    acknowledgeHistory = () => {
        const {filters, id} = this.props.userActionData;
        this.setState({preloader: true});
        this.props.updateFloorplanHistory({id}, {...filters});
    };

    render() {
        const {
            popupDialogStore: {floorplanHistory, floorplanHistoryStatus},
            permissions: {isContractor, isAdmin},
        } = this.props;

        const {name} = this.props.userActionData;
        const isBuilder = !isAdmin && !isContractor;
        const ackHistory = floorplanHistoryStatus === HISTORY_EXISTS_UNREAD && !isContractor && !isAdmin;

        return (
            <PopupModal title={`"${name}" History`}
                        hideCancelButton={isContractor || isAdmin}
                        onModalHide={this.props.onCancel}
                        okButtonTitle={
                            ackHistory
                                ? 'ACKNOWLEDGE'
                                : 'OK'
                        }
                        onOK={ackHistory ? this.acknowledgeHistory : this.props.onCancel}
            >
                {
                    floorplanHistory
                        ? <table className='portal-table'>
                            <thead>
                            <tr>
                                <th>DATE</th>
                                <th>EVENT</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                floorplanHistory.map(({id, note, created_at, viewed}) =>
                                    <tr key={id} className={(isBuilder && !viewed) ? 'unread' : null}>
                                        <td className='date'>{dateFormat(created_at)}</td>
                                        <td className='text'>{note}</td>
                                    </tr>
                                )
                            }
                            </tbody>
                        </table>
                        : <LoadingSpinner/>
                }
                {
                    this.state.preloader && <LoadingSpinner/>
                }
            </PopupModal>
        );
    }
}

export default connect(
    (state => ({
        popupDialogStore: state.popupDialog,
        permissions: state.userProfile.permissions,
    })), actions
)(ViewFloorplanHistoryDialog);