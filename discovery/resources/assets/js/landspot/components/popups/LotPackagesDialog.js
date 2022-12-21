import PropTypes from 'prop-types';
import React from 'react';
import {withAlert} from 'react-alert';
import {connect} from 'react-redux';
import {LoadingSpinner} from '~/helpers';
import {PopupModal} from '~/popup-dialog/PopupModal';
import * as actions from '../../store/popupDialog/actions';
import LotPackage, {ReadOnlyLotPackageInstance as ReadOnlyLotPackage} from './LotPackage';

class LotPackagesDialog extends React.Component {

    static propTypes = {
        lotId: PropTypes.number.isRequired,
        isPdfManager: PropTypes.bool.isRequired,
        selectedFilters: PropTypes.object.isRequired,
        onCancel: PropTypes.func.isRequired,
        getLotPackagesForUpload: PropTypes.func.isRequired,
        updateLotPackages: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            preloader: false
        };
        this.lotPackages = [];
    }

    componentDidMount() {
        this.props.getLotPackagesForUpload({upload_package: -1, id: this.props.lotId});
    }

    componentWillUnmount() {
        this.props.resetDialogStore();
    }

    saveLotPackages = () => {
        const packages = this.lotPackages.map(callback => callback());
        if (packages.indexOf(false) === -1) {
            this.setState({preloader: true});
            this.props.updateLotPackages({
                packages,
                filters: this.props.selectedFilters
            }, {id: this.props.lotId});
        } else {
            return false;
        }
    };

    LotPackagesList = () => {
        const {
            popupDialog: {lotPackages},
            setUserAction,
            selectedFilters,
            lotId,
            isPdfManager
        } = this.props;
        const {preloader} = this.state;
        return <React.Fragment>
            <ul style={{opacity: preloader ? 0 : null}}>
                {
                    lotPackages.map(
                        (item, index) => <li key={index}>
                            {isPdfManager
                                ?
                                <LotPackage onMount={validationCallback => this.lotPackages[index] = validationCallback}
                                            onUnmount={() => this.lotPackages[index] = null}
                                            packageIndex={index}
                                            setUserAction={setUserAction}
                                            selectedFilters={selectedFilters}
                                            lotId={lotId}
                                />
                                : <ReadOnlyLotPackage packageIndex={index}/>
                            }
                        </li>
                    )
                }
            </ul>
            {preloader && <LoadingSpinner/>}
        </React.Fragment>;
    };

    render() {
        const {
            estate: {name},
            popupDialog: {lotPackages},
            onCancel,
            isPdfManager
        } = this.props;
        return (
            <PopupModal title={name + ' House and Land Packages'}
                        okButtonTitle={isPdfManager ? 'Upload' : 'OK'}
                        hideCancelButton={!isPdfManager}
                        dialogClassName="lot-packages-dialog"
                        onOK={isPdfManager ? this.saveLotPackages : onCancel}
                        onModalHide={onCancel}>
                {
                    lotPackages
                        ? (this.LotPackagesList())
                        : <LoadingSpinner isStatic={true}/>
                }
            </PopupModal>
        );
    }
}


export default withAlert(connect(
    (state => ({
        popupDialog: state.popupDialog,
        estate: state.estate.estate
    })), actions
)(LotPackagesDialog));