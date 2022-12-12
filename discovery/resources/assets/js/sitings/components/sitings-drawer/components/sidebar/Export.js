import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {DrawerContext} from '../../DrawerContainer';
import NiceDropdown from '~sitings~/helpers/NiceDropdown';
import {clickHandler} from '~sitings~/helpers';
import DisplayManager from '~/sitings-sdk/src/utils/DisplayManager';
import CanvasModel from '../CanvasModel';
import UserAction from '../consts';
import store from '~sitings~/store';
import PdfPage from '~/sitings-sdk/src/sitings/global/PdfPage';
import {CompanyDataContext} from '../CompanyDataContainer';

// All the available page scales. Not all will be enabled
const PAGE_SCALES = [
    100, 150, 200, 250, 300, 400, 1000, 1500, 2000, 2500, 3000, 4000, 4500, 5000
];

// This indicates the available width & height on a PDF template. The height doesn't cover the full page height due to the
// header and footer. The width is calculated with a 1cm margin removed from both sides
const PAGE_DIMENSIONS = [
    // PdfPage.SIZE_A4
    {width: 19, height: 20},
    // PdfPage.SIZE_A3
    {width: 27.7, height: 30}
];

const actionLabels = {
    SAVE_AND_EXPORT: 'Save + Create PDF',
    ASSIGN_TO_CLIENT: 'Save to Client'
};

class Export extends Component {
    static propTypes = {
        setDrawerData: PropTypes.func.isRequired,
        setUserAction: PropTypes.func.isRequired,
        showErrors: PropTypes.func.isRequired,
        companyLoaded: PropTypes.bool.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {availableScales: PAGE_SCALES};
        this.canvasSvgView = null;
    }

    componentDidMount() {
        this.validatedPageSize = -1;
        this.calculateMinimumPageScale();
    }


    componentWillUnmount() {
    }

    componentDidUpdate(prevProps) {
        this.calculateMinimumPageScale();
    }

    showClientDetailsDialog = ({exportType}) => {
        const {setUserAction, companyLoaded} = this.props;
        const siting = _.get(this.props, 'drawerData.siting') || {};
        const clientDetails = companyLoaded ? CanvasModel.getModel().clientDetails : {};
        setUserAction(exportType, {
            siting,
            clientDetails,
            exportType,
            clientInviteCallback: this.clientInviteCallback
        });
    };

    clientInviteCallback = (form) => {
        const {
            setDrawerData,
            showErrors,
            setUserAction,
            userActionData: {
                exportType
            }
        } = this.props;

        if (!exportType) {
            setUserAction(null);
            showErrors('Invalid operation');
        }

        setDrawerData(
            {form},
            () => {
                this.saveAndExport({exportType});
                setUserAction(null);
            }
        );
    };

    changeSiting = (data) => {
        if (typeof data.page_size !== 'undefined') {
            this.calculateMinimumPageScale();
        }

        const {
            setDrawerData,
        } = this.props;
        const siting = _.get(this.props, 'drawerData.siting') || {};

        setDrawerData({
            siting: {...siting, ...data}
        });
    };

    calculateMinimumPageScale = () => {
        // Wait for the siting session to restore fully before
        if (this.props.drawerData.restored !== true) {
            return;
        }

        const svgView = CanvasModel.svgView;
        const siting = this.props.drawerData.siting;
        const pageSize = siting.page_size || PdfPage.SIZE_A4;

        if (pageSize === this.validatedPageSize) {
            return;
        }

        this.validatedPageSize = pageSize;

        let div = document.createElement('div');
        div.id = 'bounds-calculation';
        div.setAttribute('style', 'opacity: 0');
        document.body.append(div);

        // Send the Page size and Export scale to the SVG renderer
        const size = svgView.draw(
            'bounds-calculation',
            // selected page size
            pageSize,
            // 1:100 for easy calculation
            100
        );

        div.remove();

        // determine the minimum scale at which this siting will fit on the current page size
        const pageDimensions = PAGE_DIMENSIONS[pageSize];
        const minScale = Math.max(
            size.width / pageDimensions.width,
            size.height / pageDimensions.height
        ) * 100;

        console.log('Siting Size: ', size, 'Page size: ', pageDimensions);
        console.log('Min Scale: ', minScale);

        const availableScales = PAGE_SCALES.filter(scale => scale >= minScale);
        if (!availableScales.length) {
            availableScales.push(5000);
        }

        // Make sure the minimum supported scale is selected
        if (!siting.page_scale || availableScales[0] > siting.page_scale) {
            this.changeSiting({page_scale: availableScales[0]});
        }

        // Update the list of available scales
        this.setState({availableScales: availableScales});
    };

    onClientDetailsChange = () => {
        const {
            setDrawerData
        } = this.props;
        const canvasModel = CanvasModel.getModel();
        setDrawerData({sitingSession: canvasModel.recordState()});
    };

    saveAndExport = (data) => {
        store.dispatch({
            type: 'EXPORT_LOT_DATA',
            payload: {data}
        });
    };

    render() {
        const siting = _.get(this.props, 'drawerData.siting') || {};
        const {companyLoaded} = this.props;
        const {
            userActions = []
        } = siting;
        const clientDetails = companyLoaded ? CanvasModel.getModel().clientDetails : {};
        const {availableScales} = this.state;

        return (
            <div className='lot-settings export'>
                <div className='header'>Output settings</div>
                <div className="form-rows">
                    <div className="form-row">
                        <label className="left-item">Page size</label>

                        <NiceDropdown
                            itemClass='right-item'
                            defaultValue=''
                            defaultItem='Page size'
                            items={
                                [
                                    {
                                        text: 'A4',
                                        value: PdfPage.SIZE_A4
                                    },
                                    {
                                        text: 'A3',
                                        value: PdfPage.SIZE_A3
                                    },
                                ]
                            }
                            onChange={page_size => this.changeSiting({page_size})}
                            value={siting.page_size || 0}
                        />
                    </div>
                    <div className="form-row">
                        <label className="left-item">Page scale</label>

                        <NiceDropdown
                            itemClass='right-item'
                            defaultValue=''
                            defaultItem='Page scale'
                            items={
                                availableScales.map(scale => ({
                                    text: `1:${scale}`,
                                    value: scale
                                }))
                            }

                            onChange={page_scale => {
                                if (!page_scale || !isFinite(page_scale) || parseInt(page_scale) <= 0) {
                                    page_scale = DisplayManager.DEFAULT_SCALE;
                                }

                                this.changeSiting({page_scale});
                            }}

                            value={siting.page_scale || 0}
                        />
                    </div>
                </div>

                <div className='header'>Document details</div>
                <div className="document-details">
                    <div className="form-rows">
                        <div className="form-row">
                            <div className='landconnect-input'>
                                <input type='text'
                                       autoComplete="off"
                                       onChange={(e) => {
                                           clientDetails.firstName = e.target.value;
                                           this.onClientDetailsChange();
                                           this.changeSiting(
                                               {
                                                   first_name: e.target.value,
                                               }
                                           );
                                       }}
                                       onFocus={(event) => event.target.select()}
                                       placeholder='First name'
                                       maxLength={155}
                                       value={clientDetails.firstName || ''}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className='landconnect-input'>
                                <input type='text'
                                       autoComplete="off"
                                       onChange={(e) => {
                                           clientDetails.lastName = e.target.value;
                                           this.onClientDetailsChange();
                                           this.changeSiting(
                                               {
                                                   last_name: e.target.value,
                                               }
                                           );
                                       }}
                                       onFocus={(event) => event.target.select()}
                                       placeholder='Last name'
                                       maxLength={155}
                                       value={clientDetails.lastName || ''}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className='landconnect-input'>
                                <input type='text'
                                       autoComplete="off"
                                       onChange={(e) => {
                                           clientDetails.lotNumber = e.target.value;
                                           this.onClientDetailsChange();
                                           this.changeSiting(
                                               {
                                                   lot_number: e.target.value,
                                               }
                                           );
                                       }}
                                       onFocus={(event) => event.target.select()}
                                       placeholder='Lot/street number'
                                       maxLength={155}
                                       value={clientDetails.lotNumber || ''}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className='landconnect-input'>
                                <input type='text'
                                       autoComplete="off"
                                       onChange={(e) => {
                                           clientDetails.address = e.target.value;
                                           this.onClientDetailsChange();
                                           this.changeSiting(
                                               {
                                                   street: e.target.value,
                                               }
                                           );
                                       }}
                                       onFocus={(event) => event.target.select()}
                                       placeholder='Street name'
                                       maxLength={155}
                                       value={clientDetails.address || ''}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className='landconnect-input'>

                            <textarea placeholder='Extra details'
                                      maxLength={255}
                                      rows={5}
                                      onChange={e => {
                                          clientDetails.extraDetails = e.target.value;
                                          this.onClientDetailsChange();
                                          this.changeSiting(
                                              {extra_details: e.target.value,}
                                          );
                                      }}
                                      value={clientDetails.extraDetails || ''}
                            />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='header'>Additional lot details</div>
                <div className="document-details">
                    <div className="form-rows">
                        <div className="form-row">
                            <div className='landconnect-input'>

                                <input type='text'
                                       autoComplete="off"
                                       onFocus={(event) => event.target.select()}
                                       maxLength={32}
                                       placeholder='Lot No.'
                                      onChange={e => {
                                          clientDetails.lotNo = e.target.value;
                                          this.onClientDetailsChange();
                                          this.changeSiting({lot_no: e.target.value});
                                      }}
                                      value={clientDetails.lotNo || ''}
                            />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className='landconnect-input'>

                                <input type='text'
                                       autoComplete="off"
                                       onFocus={(event) => event.target.select()}
                                       maxLength={32}
                                       placeholder='SP No.'
                                      onChange={e => {
                                          clientDetails.spNo = e.target.value;
                                          this.onClientDetailsChange();
                                          this.changeSiting({sp_no: e.target.value});
                                      }}
                                      value={clientDetails.spNo || ''}
                            />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className='landconnect-input'>

                                <input type='text'
                                       autoComplete="off"
                                       onFocus={(event) => event.target.select()}
                                       maxLength={32}
                                       placeholder='Parent Lot No.'
                                      onChange={e => {
                                          clientDetails.parentLotNo = e.target.value;
                                          this.onClientDetailsChange();
                                          this.changeSiting({parent_lot_no: e.target.value});
                                      }}
                                      value={clientDetails.parentLotNo || ''}
                            />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className='landconnect-input'>

                                <input type='text'
                                       autoComplete="off"
                                       onFocus={(event) => event.target.select()}
                                       maxLength={32}
                                       placeholder='Parent SP No.'
                                      onChange={e => {
                                          clientDetails.parentSpNo = e.target.value;
                                          this.onClientDetailsChange();
                                          this.changeSiting({parent_sp_no: e.target.value});
                                      }}
                                      value={clientDetails.parentSpNo || ''}
                            />
                            </div>
                        </div>
                    </div>

                    <div className="form-rows">
                        {
                            userActions.map(
                                (action, index) => {
                                    const exportType = UserAction[action];
                                    let exportAction = this.saveAndExport;
                                    if (exportType === UserAction.ASSIGN_TO_CLIENT) {
                                        exportAction = this.showClientDetailsDialog;
                                    }
                                    return (
                                        <div className="form-row" key={index}>
                                            <button className="button primary"
                                                    type="button"
                                                    onClick={e => {
                                                        clickHandler(e, exportAction({exportType}));
                                                    }}>
                                                {actionLabels[action]}
                                            </button>
                                        </div>
                                    );
                                }
                            )
                        }
                    </div>
                </div>
            </div>
        );
    }
}


const ExportConsumer = (props) => (
    <CompanyDataContext.Consumer>
        {
            ({companyLoaded}) =>
                <DrawerContext.Consumer>
                    {
                        ({
                             state: {drawerData, userActionData}, setDrawerData, showErrors, setUserAction,
                         }) => <Export  {...props} {...{
                            drawerData,
                            userActionData,
                            setDrawerData,
                            showErrors,
                            setUserAction,
                            companyLoaded
                        }}/>
                    }
                </DrawerContext.Consumer>
        }
    </CompanyDataContext.Consumer>
);

const ExportInstance = connect((state) => ({
    drawerDetails: state.sitingsDrawerDetails,
}), null)(ExportConsumer);

export default ExportInstance;