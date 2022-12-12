import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {PopupModal} from '~/popup-dialog/PopupModal';
import * as actions from '../../store/popupDialog/actions';
import CheckBoxList from './CheckBoxList';
import {LoadingSpinner} from '~/helpers';

const VISIBILITY_DISABLED = 0;
const VISIBILITY_PARTIAL = 1;
const VISIBILITY_ALL = 2;

class LotVisibilityDialog extends React.Component {

    static propTypes = {
        lotId: PropTypes.number.isRequired,
        getLotVisibility: PropTypes.func.isRequired,
        updateLotVisibility: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
        selectedFilters: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.getCheckboxState = null;
        this.state = {
            preloader: false
        };
    }

    componentDidMount() {
        this.props.getLotVisibility(null, {id: this.props.lotId});
    }

    componentWillUnmount() {
        this.props.resetDialogStore();
    }

    saveLotVisibility = () => {
        this.props.updateLotVisibility(
            {
                ...this.getCheckboxState(), ...{filters: this.props.selectedFilters}
            },
            {id: this.props.lotId}
        );
        this.setState({preloader: true});
    };

    render() {
        const {builderCompanies, lotNumber, selectedCompanies, globalVisibility} = this.props.popupDialog;
        return (
            <PopupModal title="Lot Visibility"
                        okButtonTitle='Save'
                        dialogClassName="edit-lot-visibility"
                        onOK={this.saveLotVisibility}
                        onModalHide={this.props.onCancel}
            >
                {
                    builderCompanies
                        ? <div>
                            {this.state.preloader && <LoadingSpinner className='overlay'/>}
                            <p>SHOW LOT {lotNumber} TO</p>
                            <div className="select-wrapper">
                                <CheckBoxList
                                    onMount={getState => this.getCheckboxState = getState}
                                    checkAllOptionsText='SHOW TO ALL'
                                    unCheckAllOptionsText='HIDE FROM ALL'
                                    allChecked={globalVisibility === VISIBILITY_ALL}
                                    customOptionsChecked={globalVisibility === VISIBILITY_PARTIAL}
                                    allUnchecked={globalVisibility === VISIBILITY_DISABLED}
                                    options={builderCompanies}
                                    selectedOptions={selectedCompanies}
                                    selectedOptionsLimit={3}
                                />
                            </div>
                            <p>You can select up to 3 companies.</p>
                        </div>
                        : <LoadingSpinner/>
                }
            </PopupModal>
        );
    }
}


export default connect(
    (state => ({popupDialog: state.popupDialog})), actions
)(LotVisibilityDialog);