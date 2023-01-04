import React, {Component} from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import {DrawerContext} from '../../DrawerContainer';
import {HouseRadio} from '~sitings~/helpers/HouseRadio';
import {NiceCheckbox} from '~sitings~/helpers';
import HouseLayerType from '~/sitings-sdk/src/sitings/model/house/HouseLayerType';
import CanvasModel from '../CanvasModel';
import ModelEvent from '~/sitings-sdk/src/sitings/events/ModelEvent';
import HouseModel from '../../../../../sitings-sdk/src/sitings/model/house/HouseModel';
import CarrotUp from '~/../img/CarrotUp.svg'
import CarrotDown from '~/../img/CarrotDown.svg'
import {ToggleSwitch} from '~sitings~/helpers/ToggleSwitch';

const DEFAULT_REAR_OPTION = 'option_x5f_rear_x5f_standard';

class LotHouses extends Component {
    static propTypes = {
        setDrawerData: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            rangeId: null,
            houseId: null,
            selectedRangeName: '',
            selectedHouseName: '',
            rangeMinimized: 0,
            houseMinimized: 0,
            searchText: '',
            ranges: [],
            houses: [],
            houseLoading: false
        };
    }

    componentDidMount() {
        const {
            companyLoaded,
        } = this.props;

        if (companyLoaded) {
            this.checkHouseModel();
        }
    }

    componentWillUnmount() {
        this.removeMultiHouseListener();
    }

    componentDidUpdate(prevProps, prevState) {
        const {
            companyLoaded,
        } = this.props;

        const {
            rangeId,
            houseId,
            ranges,
            houses
        } = this.state;

        if (companyLoaded && !prevProps.companyLoaded) {
            this.checkHouseModel();
            this.addMultiHouseListener();
        } else if (rangeId != null && rangeId != prevState.rangeId) {
            ranges.map((range, index) => {
                if (String(rangeId) === range.id.toString()) {
                    const inx = index + 1;
                    this.setState({selectedRangeName: 'Item ' + inx})
                }
            })

            if (companyLoaded) {
                const canvasModel = CanvasModel.getModel();
                const houseModel  = canvasModel.multiFloors.crtFloor;
                const houseId     = houseModel && houseModel.houseData ? houseModel.houseData.id : null;
                
                if(this.state.houseId == null) {
                    this.setState({houseId: houseId});
                }

                houses.map((house, index) => {
                    if (String(houseId) === house.id.toString() && this.state.houseId == null) {
                        const inx = index + 1;
                        this.setState({selectedHouseName: 'Item ' + inx})
                    }
                })
            }
        } else if (houseId != null && houseId != prevState.houseId) {
            houses.map((house, index) => {
                if (String(houseId) === house.id.toString()) {
                    const inx = index + 1;
                    this.setState({selectedHouseName: 'Item ' + inx})
                }
            })
        }
    }

    addMultiHouseListener = () => {
        const canvasModel   = CanvasModel.getModel();

        if (canvasModel && canvasModel.multiFloors) {
            canvasModel.multiFloors.addEventListener(ModelEvent.SELECT, this.newHouseModelSelected, this);
        }
    };

    removeMultiHouseListener = () => {
        const canvasModel   = CanvasModel.getModel();

        if (canvasModel && canvasModel.multiFloors) {
            canvasModel.multiFloors.removeEventListener(ModelEvent.SELECT, this.newHouseModelSelected, this);
        }
    };

    newHouseModelSelected = () => {
        const rangeId = this.state.rangeId;

        this.checkHouseModel();

        // If the rangeId changes, an automatic update will be triggered. Otherwise, we need to force it ourselves
        if (rangeId === this.state.rangeId) {
            this.forceUpdate();
        }
    };

    checkHouseModel = () => {
        const canvasModel   = CanvasModel.getModel();
        const {companyData} = canvasModel;

        if (!companyData) {
            console.log('[Error]: companyData is null ', canvasModel);
            return;
        }

        const {ranges}      = companyData;
        const houseModel    = canvasModel.multiFloors.crtFloor;
        let houseId         = null;
        let rangeId         = null;

        if (houseModel) {
            houseId = houseModel.houseData ? houseModel.houseData.id : houseId;
            rangeId = houseId
                ? ranges.find(
                    range => range.houses.find(house => house.id === houseId) ? range : null
                ).id
                : rangeId;
        }

        this.filterCompanyData({rangeId});
    };

    filterCompanyData = ({rangeId = null}) => {
        const canvasModel   = CanvasModel.getModel();
        const {companyData} = canvasModel;
        const {ranges}      = companyData;

        const houses = rangeId
            ? ranges.reduce((accumulator, range) => {
                if (range.id === parseInt(rangeId)) {
                    accumulator = range.houses;
                }
                return accumulator;
            }, [])
            : [];

        this.setState({ranges, houses, rangeId, searchText: ''});
    };

    /**
     * @param selectedHouse {HouseData}
     */
    loadHouse = (selectedHouse) => {
        if (selectedHouse.parseFinished) {
            this.loadHouseOnDataReady(selectedHouse);
        }   else {
            const {loadHouseData} = this.props;
            this.setState({houseLoading: true});

            loadHouseData(selectedHouse).then(
                () => this.loadHouseOnDataReady(selectedHouse)
            );
        }
    };

    /**
     * @param selectedHouse
     */
    loadHouseOnDataReady = (selectedHouse) => {
        const canvasModel = CanvasModel.getModel();
        const houseModel  = canvasModel.multiFloors.crtFloor;

        houseModel.loadHouse(selectedHouse);

        if (selectedHouse.isXMLFormat) {
            const reader = selectedHouse.reader;
            if (reader) {
                if (reader.facades.length) {
                    houseModel.setXMLSelectedFacade(reader.facades[0]);
                }

                // Automatically select rear standard options
                if (reader.options.length) {
                    const rears = reader.options.filter(
                        option => option.name.toLowerCase() === DEFAULT_REAR_OPTION
                    );

                    if (rears.length) {
                        houseModel.setXMLSelectedOptions([rears[0]]);
                    }
                }
            }
        }   else {
            if (selectedHouse.facades.length) {
                const facade = selectedHouse.facades[0].id;
                houseModel.selectFacade(facade);
            }

            // Automatically select rear standard options
            if (selectedHouse.options.length) {
                const rears = selectedHouse.options.filter(
                    option => option.id.toLowerCase() === DEFAULT_REAR_OPTION
                );

                if (rears.length) {
                    houseModel.selectOptions([rears[0].id]);
                }
            }
        }

        this.setState({houseLoading: false});
        this.recordState({mirrored: false});

        if (this.state.searchText) {
            this.checkHouseModel();
        }
    };

    recordState = (data = {}) => {
        const {
            setDrawerData
        } = this.props;
        const canvasModel = CanvasModel.getModel();
        setDrawerData({sitingSession: canvasModel.recordState(), ...data});
    };

    filterFloors = (searchText) => {
        const canvasModel   = CanvasModel.getModel();
        const {companyData} = canvasModel;
        const {ranges}      = companyData;

        const houses = ranges.reduce((accumulator, range) => {
            const houses = range.houses.filter(
                house => house.name.toLowerCase().includes(searchText.toLowerCase())
            );
            accumulator = accumulator.concat(houses);
            return accumulator;
        }, []);

        this.setState({searchText, houses});
    };

    render() {
        const {
            companyLoaded,
        } = this.props;
        const {ranges, houses, rangeId, searchText, houseLoading} = this.state;

        let houseModel = null;
        let canvasModel = null;

        return (
            <div className={classnames('lot-settings add-house', houseLoading && 'disabled')}>
                <div className='search-floorplan'>
                    <input type='text'
                           autoComplete="off"
                           onChange={(e) => this.filterFloors(e.target.value)}
                           placeholder='Type a floorplan name'
                           value={searchText || ''}
                    />
                </div>

                <div id='browse-header'>Browse for a floorplan</div>

                {!searchText &&
                <React.Fragment>
                    <div className='header'>
                        <span>Select a range</span>
                        {this.state.rangeMinimized == 1 && <div className='flex'>
                                <p>{rangeId == null? '' : this.state.selectedRangeName}</p>
                                <img
                                    src={CarrotDown}
                                    onClick={() => {
                                        this.setState({rangeMinimized : !this.state.rangeMinimized});     
                                    }} />
                            </div>}
                        {this.state.rangeMinimized == 0 && <img
                                src={CarrotUp}
                                onClick={() => {
                                    this.setState({rangeMinimized: !this.state.rangeMinimized});
                                }}
                            />
                        }
                    </div>
                    <div className="form-rows">
                        {
                            this.state.rangeMinimized == 0 && ranges.map(
                                range => <div key={range.id}
                                              className="form-row">
                                    <HouseRadio
                                        name={`range-radio-${range.name}`}
                                        value={range.id}
                                        checked={String(rangeId) === range.id.toString()}
                                        label={range.name.toUpperCase()}
                                        onChange={rangeId => {
                                            if (houseModel) {
                                                houseModel.houseData = null;
                                                houseModel.clearLayers();
                                            }
                                            this.filterCompanyData({rangeId});
                                        }}
                                    />
                                </div>
                            )
                        }
                    </div>
                </React.Fragment>
                }

                <div className='header'>
                        <span>Floorplan</span>
                        {this.state.houseMinimized == 1 && <div className='flex'>
                                <p>{this.state.houseId == null? '' : this.state.selectedHouseName}</p>
                                <img
                                    src={CarrotDown}
                                    onClick={() => {
                                        this.setState({houseMinimized : !this.state.houseMinimized});     
                                    }} />
                            </div>}
                        {this.state.houseMinimized == 0 && <img
                                src={CarrotUp}
                                onClick={() => {
                                    this.setState({houseMinimized: !this.state.houseMinimized});
                                }}
                            />
                        }
                    </div>
                <div className="form-rows">
                    {
                        this.state.houseMinimized == 0 && houses.map(
                            (house, index) => <div key={index+'_'+house.id}
                                          className="form-row">
                                <HouseRadio
                                    name={`floorplan-radio-${house.name}`}
                                    value={house.id}
                                    checked={String(this.state.houseId) === house.id.toString()}
                                    label={house.name.toUpperCase()}
                                    onChange={houseId => {
                                        const selectedHouse = houses.find(house => house.id === houseId);
                                        this.loadHouse(selectedHouse);

                                        this.setState({houseId: houseId});
                                    }}
                                />
                            </div>
                        )
                    }
                </div>

                {!searchText &&
                <React.Fragment>
                    <div className='header'><span>Facade</span></div>
                    <div className="form-rows">
                        {
                            (houseModel && houseModel.format === HouseModel.FORMAT_XML) ?
                                (houseModel.xmlData.reader.facades.map(
                                    facade => {
                                        return (
                                            <div key={facade.id}
                                                 className="form-row">
                                                <HouseRadio
                                                    name={`facade-radio-${facade.id}`}
                                                    value={facade.id}
                                                    checked={facade === houseModel.xmlMerger.facade}
                                                    label={facade.name.toUpperCase()}
                                                    onChange={() => {
                                                        houseModel.setXMLSelectedFacade(facade);
                                                        this.recordState();
                                                    }}
                                                />
                                            </div>
                                        );
                                    }
                                ))
                                :(houseModel && houseId
                                    ? houseModel.layers
                                        .filter(layer => layer.type === HouseLayerType.FACADE)
                                        .map(
                                            facade => {
                                                const {group} = facade;
                                                const label = facade.getLayerLabel();
                                                return (
                                                    <div key={group.id}
                                                         className="form-row">
                                                        <HouseRadio
                                                            name={`facade-radio-${group.id}`}
                                                            value={group.id}
                                                            checked={facade.visible}
                                                            label={label.toUpperCase()}
                                                            onChange={facadeId => {
                                                                houseModel.selectFacade(facadeId);
                                                                this.recordState();
                                                            }}
                                                        />
                                                    </div>
                                                );
                                            }
                                        )
                                    : null
                                )
                        }
                    </div>
                </React.Fragment>
                }

                {!searchText &&
                <React.Fragment>
                    <div className='header'><span>Floorplan settings</span></div>
                    <div className="form-rows">
                        {
                            (houseModel && houseModel.format === HouseModel.FORMAT_XML) ?
                                (
                                    (houseModel.xmlMerger.facade ?
                                        houseModel.xmlData.reader.optionsForFacade(houseModel.xmlMerger.facade) :
                                        houseModel.xmlData.reader.options
                                    ).map(
                                        (option, index) => {
                                            return (
                                                <div key={index+'_'+option.name}
                                                     className="form-row">
                                                    <NiceCheckbox
                                                        name={`option-radio-${option.name}`}
                                                        value={option.name}
                                                        checked={houseModel.xmlMerger.selectedOptions.indexOf(option)!==-1}
                                                        label={option.displayName ? option.displayName.toUpperCase() : option.name.toUpperCase()}
                                                        onChange={() => {
                                                            const selection = houseModel.xmlMerger.selectedOptions;

                                                            if (selection.indexOf(option) !== -1) {
                                                                // remove it
                                                                selection.splice(selection.indexOf(option), 1);
                                                            }   else {
                                                                // add it
                                                                selection.push(option);
                                                            }

                                                            houseModel.setXMLSelectedOptions(selection);
                                                            this.recordState();
                                                        }}
                                                    />
                                                </div>
                                            );
                                        }
                                    )
                                ):
                                (houseModel && houseId
                                    ? houseModel.layers
                                        .filter(layer => layer.type === HouseLayerType.OPTION)
                                        .map(
                                            option => {
                                                const {group} = option;
                                                const label = option.getLayerLabel();
                                                return (
                                                    <div key={group.id}
                                                         className="form-row">
                                                        <NiceCheckbox
                                                            checked={option.visible}
                                                            label={label.toUpperCase()}
                                                            name={`option-${group.id}`}
                                                            onChange={() => {
                                                                const selection = houseModel.getSelectedOptions();

                                                                if (option.visible) {
                                                                    // remove it
                                                                    selection.splice(selection.indexOf(group.id), 1);
                                                                }   else {
                                                                    selection.push(group.id);
                                                                }

                                                                houseModel.selectOptions(selection);

                                                                this.recordState();
                                                            }}
                                                        />
                                                    </div>
                                                );
                                            }
                                        )
                                    : null
                                )
                        }
                        <ToggleSwitch
                                    labelPosition="left"
                                    onClick={() => this.toggleMirror(!mirrored)}
                                    text={{on: 'Mirror', off: 'Mirror'}}
                                    label={{on: '', off: ''}}
                                    state={mirrored}
                                />
                    </div>
                </React.Fragment>
                }
            </div>
        );
    }

}

const LotHousesConsumer = (props) => (
    <DrawerContext.Consumer>
        {
            ({
                 state: {drawerData}, setDrawerData
             }) => <LotHouses  {...props} {...{
                drawerData, setDrawerData
            }}/>
        }
    </DrawerContext.Consumer>
);

const LotHousesInstance = connect((state) => ({
    drawerDetails: state.sitingsDrawerDetails,
}), null)(LotHousesConsumer);

export default LotHousesInstance;