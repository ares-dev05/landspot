import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withAlert} from 'react-alert';
import {PopupModal} from '~/popup-dialog/PopupModal';
import {LoadingSpinner} from '~/helpers';
import {connect} from 'react-redux';
import * as actions from '../../store/popupDialog/actions';
import store from '../../store';
import {FormRowDropdown} from '~/helpers/FormRow';
import {LeftPanel, RightPanel} from '~/helpers/Panels';
import LotDetails from '../LotDetails';
import LotView from './items/LotView';
import CanvasModel, {imageSizes, defaultTheme} from '../drawer/CanvasModel';

class LotDrawerDetailsDialog extends Component {
    static propTypes = {
        lotId: PropTypes.any.isRequired,
        lotNumber: PropTypes.any.isRequired,
        onCancel: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired,
        getLotDrawerData: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            lotId: props.lotId || null,
            lotNumber: props.lotNumber || null,
            theme: {...defaultTheme},
            preloader: false
        };
    }

    componentDidMount() {
        this.getLotData();
    }

    componentDidUpdate(prevProps, prevState) {
        const {lotId} = this.state;
        const {lotId: prevLotId} = prevState;

        if (lotId !== prevLotId) {
            this.props.resetDialogStore();
            this.getLotData();
        }
    }

    componentWillUnmount() {
        CanvasModel.resetModel();
        this.props.resetDialogStore();
    }

    static getDerivedStateFromProps(props) {
        const {
            popupDialog: {drawerTheme, POPUP_UPDATED},
        } = props;
        let newState = {};

        if (POPUP_UPDATED) {
            const theme = JSON.parse(drawerTheme.theme);
            if (theme) {
                newState.theme = {...defaultTheme, ...theme};
            }
            newState.preloader = false;
            store.dispatch({type: 'RESET_POPUP_UPDATED'});
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    getLotData = () => {
        const {lotId} = this.state;
        const {getLotDrawerData} = this.props;
        getLotDrawerData({lotId});
        this.setState({
            preloader: true,
            theme: {...defaultTheme}
        });
    };

    onItemChange = (data) => {
        this.setState({...this.state, ...data});
    };

    saveAndExport = () => {
        this.setState({preloader: true});
        store.dispatch({type: 'EXPORT_LOT_DATA'});
    };

    render() {
        const {
            onCancel,
            isBuilder,
            popupDialog: {
                lotData, lots
            }
        } = this.props;
        const {preloader, lotId, lotNumber, theme} = this.state;

        return (
            <PopupModal okButtonTitle={'Save'}
                        dialogClassName={'lot-drawer-popup'}
                        modalBodyClass={'lot-drawer'}
                        title={`Lot No ${lotNumber}`}
                        hideOKButton={true}
                        hideCancelButton={true}
                        onOK={onCancel}
                        onModalHide={onCancel}>
                <React.Fragment>
                    {preloader && <LoadingSpinner className={'overlay'}/>}

                    <LeftPanel className='sidebar'>
                        <div className="lot-settings">
                            <div className="form-rows">
                                <FormRowDropdown
                                    label='SELECT A LOT'
                                    itemClass=""
                                    defaultItem={null}
                                    items={
                                        lots
                                            ? lots.map(lot => ({value: lot.id, text: lot.lot_number}))
                                            : [{
                                                value: lotData ? lotData.lot.id : lotId,
                                                text: lotData ? lotData.lot.lot_number : lotNumber
                                            }]
                                    }
                                    onChange={lotId => this.onItemChange({lotId})}
                                    value={lotId || null}
                                />
                            </div>

                            {!isBuilder &&
                            <React.Fragment>
                                <div className='header'>Output settings</div>
                                <div className="form-rows">
                                    <FormRowDropdown
                                        label='IMAGE SIZE'
                                        itemClass="wide"
                                        defaultItem={null}
                                        items={imageSizes}
                                        onChange={imageSize => {
                                            const {
                                                imageSize: prevImageSize,
                                            } = theme;

                                            if (prevImageSize === imageSize) {
                                                return;
                                            } else {
                                                const newTheme = {...theme, imageSize};
                                                this.onItemChange({theme: newTheme});
                                            }
                                        }}
                                        value={theme.imageSize}
                                    />
                                </div>

                                <div className="form-rows">
                                    <div className="form-row">
                                        <button className="button primary"
                                                type="button"
                                                onClick={() => this.saveAndExport()}>
                                            Export
                                        </button>
                                    </div>
                                </div>
                            </React.Fragment>
                            }
                        </div>
                    </LeftPanel>
                    <RightPanel className='summary'>
                        {!isBuilder &&
                        <a href={LotDetails.componentUrl.replace(':lotId', encodeURIComponent(lotId))}
                           className='button default edit-btn'>EDIT</a>
                        }
                        <LotView theme={theme} onItemChange={this.onItemChange}/>
                    </RightPanel>
                </React.Fragment>
            </PopupModal>
        );
    }
}

export default withAlert(connect(
    (state => ({
        popupDialog: state.popupDialog,
    })), actions
)(LotDrawerDetailsDialog));
