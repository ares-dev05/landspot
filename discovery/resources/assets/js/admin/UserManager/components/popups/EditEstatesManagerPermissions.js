import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withAlert} from 'react-alert';
import {isEqual} from 'lodash';
import * as actions from '../../store/popupDialog/actions';
import {LoadingSpinner, NiceCheckbox} from '~/helpers';
import {PopupModal} from '~/popup-dialog/PopupModal';

class EditEstatesManagerPermissions extends Component {

    static propTypes = {
        userActionData: PropTypes.object.isRequired,
        onCancel: PropTypes.func.isRequired,
        getEstatesWithUserPermissions: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            estates: [],
            permissions: [],
            preloader: false
        };
    }

    componentDidMount() {
        this.props.getEstatesWithUserPermissions(null, this.props.userActionData.user);
    }

    componentWillUnmount() {
        this.props.resetDialogStore();
    }

    componentDidUpdate(prevProps, prevState) {
        const {alert: { show }, onCancel} = this.props;
        const {estates, permissions, message} = this.props.popupDialog;

        if (message && message.success) {
            show(
                message.success,
                {
                    type: 'success',
                }
            );

            onCancel();
        }

        if (estates && !isEqual(estates, prevState.estates)) {
            this.setState({estates, permissions});
        }
    }

    onPermissionCheck = ({id, label, estateIndex}) => {
        const {estates, permissions} = this.state;
        const readOnly = permissions.find(permission => permission.label === 'Read only');

        if (estates[estateIndex].permissions[id]) {
            delete estates[estateIndex].permissions[id];
        } else {
            if (id === readOnly.id) {
                estates[estateIndex].permissions = {[id]: label};
            } else {
                delete estates[estateIndex].permissions[readOnly.id];
                estates[estateIndex].permissions = Object.assign({}, estates[estateIndex].permissions, {[id]: label});
            }
        }
        this.setState({estates});
    };

    savePermissions = () => {
        const {estates} = this.state;
        const {savePermissions, userActionData: {user}} = this.props;

        let permissions = {};
        estates.map((estate) => {
            permissions[estate.id] = estate.permissions;
        });

        savePermissions({permissions}, user);
        this.setState({preloader: true});
    };


    render() {
        const {onCancel, userActionData: {user}, popupDialog: {estates}} = this.props;
        const {preloader, estates: stateEstates, permissions} = this.state;

        return (
            <PopupModal dialogClassName={'wide-popup manager-permissions'}
                        topActionButtons={true}
                        okButtonTitle={'Save changes'}
                        title={`Assign ${user['display_name']} to Estates`}
                        onOK={this.savePermissions}
                        onModalHide={onCancel}
            >
                <React.Fragment>
                    {estates
                        ? <EstatesTable
                            estates={stateEstates}
                            permissions={permissions}
                            onPermissionCheck={this.onPermissionCheck}
                        />
                        : <LoadingSpinner className={'overlay'}/>
                    }
                    {preloader && <LoadingSpinner className={'overlay'}/>}
                </React.Fragment>
            </PopupModal>
        );
    }
}

const EstatesTable = ({estates, permissions, onPermissionCheck}) => (
    (estates && estates.length)
        ? <table className={'table'}>
            <thead>
            <tr>
                <th>ESTATE NAME</th>
                <th>READ ONLY</th>
                <th>LIST MANAGER</th>
                <th>PRICE LIST</th>
            </tr>
            </thead>
            <tbody>
            {estates.map((estate, estateIndex) =>
                <tr key={estate.id}>
                    <td>{estate.name}</td>
                    {permissions.map((permission, permissionIndex) =>
                        <td key={`${estate.id}-${permissionIndex}`} className={'permissions'}>
                            <NiceCheckbox
                                checked={!!estate.permissions[permission.id]}
                                name={`${estate.id}-${permission.name}`}
                                onChange={() => onPermissionCheck({
                                    id: permission.id,
                                    label: permission.label,
                                    estateIndex
                                })}
                            />
                        </td>
                    )}
                </tr>
            )}
            </tbody>
        </table>
        : <div className="no-results">No available estates</div>
);

export default withAlert(connect(
    (state => ({popupDialog: state.popupDialog})), actions
)(EditEstatesManagerPermissions));