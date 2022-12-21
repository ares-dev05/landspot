import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import {connect} from 'react-redux';
import * as actions from '~sitings~/components/popup-dialog/store/actions'
import {dateFormat, LoadingSpinner, PopupModal} from '~sitings~/helpers';

class ViewFloorplanFilesDialog extends React.Component {
    static propTypes = {
        userActionData: PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
        }).isRequired,
        popupDialogStore: PropTypes.shape({
            dwgFiles: PropTypes.array,
            zipURL: PropTypes.string,
        }).isRequired,
        permissions: PropTypes.object.isRequired,
        getFloorplanFiles: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired,
        resetErrorMessages: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.props.getFloorplanFiles({id: this.props.userActionData.id});
    }

    componentWillUnmount = () => {
        this.props.resetDialogStore();
    };

    render() {
        const {popupDialogStore: {dwgFiles, zipURL}, permissions} = this.props;
        const {name} = this.props.userActionData;

        return (
            <PopupModal title={`"${name}" DWG Files`}
                        onModalHide={this.props.onCancel}
                        onOK={this.props.onCancel}
            >
                {
                    dwgFiles
                        ? (
                            dwgFiles.length > 0
                                ?
                                <React.Fragment>
                                    <table className='portal-table'>
                                        <thead>
                                        <tr>
                                            <th>DATE</th>
                                            <th>FILE / NOTE</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {
                                            dwgFiles.map(({id, name, note, created_at, fileUrl}) =>
                                                <Fragment key={id}>
                                                    <tr>
                                                        <td className='date'
                                                            rowSpan={note ? 2 : 1}>{dateFormat(created_at)}</td>
                                                        <td className='text'>
                                                            {
                                                                permissions.isContractor
                                                                    ? name
                                                                    : <a href={fileUrl}>
                                                                        <i className="fal fa-arrow-to-bottom"/>&nbsp;{name}
                                                                    </a>
                                                            }
                                                        </td>
                                                    </tr>
                                                    {
                                                        note &&
                                                        <tr>
                                                            <td>Note: {note}</td>
                                                        </tr>
                                                    }
                                                </Fragment>
                                            )
                                        }
                                        </tbody>
                                    </table>
                                    <a href={zipURL} className='button default'>
                                        DOWNLOAD&nbsp;ALL
                                    </a>
                                </React.Fragment>
                                : <p>No uploaded files</p>
                        )
                        : <LoadingSpinner/>
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
)(ViewFloorplanFilesDialog);