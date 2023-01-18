import React, {Component} from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import {DrawerContext} from '../../DrawerContainer';
import {HouseRadio} from '~sitings~/helpers/HouseRadio';
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
            selectedFacadeName: '',
            rangeMinimized: 0,
            houseMinimized: 0,
            facadeMinimized: 0,
            searchText: '',
            ranges: [],
            houses: [],
            houseLoading: false,
            houseAngle: 0,
            currentSliderAngle: []
        };
    }

    componentDidMount() {
        const {
            sitingId,
        } = this.props;

        const companyLoaded = true

        if (companyLoaded) {
            this.checkHouseModel();
        }

        const json = JSON.parse(localStorage.getItem(sitingId.toString()));
        

        if(json == null) {
            localStorage.setItem(sitingId.toString(), JSON.stringify({
                rangeMinimized: 0,
                houseMinimized: 0,
                facadeMinimized: 0,
            }))
        } else {
            this.setState({
                rangeMinimized: json.rangeMinimized,
                houseMinimized: json.houseMinimized,
                facadeMinimized: json.facadeMinimized,
                selectedRangeName: json.selectedRangeName,
                selectedHouseName: json.selectedHouseName,
                selectedFacadeName: json.selectedFacadeName
            })
        }
    }

    componentWillUnmount() {
        this.removeMultiHouseListener();
    }

    componentDidUpdate(prevProps, prevState) {
        // const {
        //     companyLoaded,
        // } = this.props;

        const companyLoaded = true;

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
                    this.setState({selectedRangeName: range.displayName})
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
                        this.setState({selectedHouseName: house.name})
                    }
                })
            }
        } else if (houseId != null && houseId != prevState.houseId) {
            houses.map((house, index) => {
                if (String(houseId) === house.id.toString()) {
                    this.setState({selectedHouseName: house.name})
                }
            })
        }

        let  houseRotation = 0;
        try {
            const canvasModel = CanvasModel.getModel();
            houseRotation = canvasModel.multiFloors.crtFloor.rotation;
            houseRotation = Math.round((houseRotation + Number.EPSILON) * 100) / 100;
    
            if(houseRotation != null && houseRotation != 0 && this.state.houseAngle == 0) {
                this.setState({houseAngle: houseRotation})
            }
        } catch (e) {}
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

    toggleMirror = () => {
        const {
            setDrawerData,
            mirrored
        } = this.props;
        const canvasModel = CanvasModel.getModel();
        const houseModel  = canvasModel.multiFloors.crtFloor;

        if (!houseModel) return;

        houseModel.toggleMirror();
        setDrawerData({mirrored: !mirrored});
    };

    render() {
        const {
            sitingId,
            mirrored,
        } = this.props;

        const {ranges, houses, rangeId, searchText, houseLoading} = this.state;
        
        const houseId = houseModel && houseModel.houseData ? houseModel.houseData.id : null;

        let houseModel = null;
        let canvasModel = null;

        let  houseRotation = 0;
        try {
            canvasModel = CanvasModel.getModel();
            houseRotation = canvasModel.multiFloors.crtFloor.rotation;
            houseModel = canvasModel.multiFloors.crtFloor;
        } catch (e) {}
        houseRotation = Math.round((houseRotation + Number.EPSILON) * 100) / 100;

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
                                        this.setState({rangeMinimized : 0});

                                        const json = JSON.parse(localStorage.getItem(sitingId.toString()));

                                        localStorage.setItem(sitingId.toString(), JSON.stringify({
                                            rangeMinimized: 0,
                                            houseMinimized: json.houseMinimized,
                                            facadeMinimized: json.facadeMinimized,
                                            selectedRangeName: this.state.selectedRangeName,
                                            selectedHouseName: this.selectedHouseName,
                                            selectedFacadeName: this.selectedFacadeName,
                                        }))
                                    }} />
                            </div>}
                        {this.state.rangeMinimized == 0 && <img
                                src={CarrotUp}
                                onClick={() => {
                                    this.setState({rangeMinimized: 1});

                                    const json = JSON.parse(localStorage.getItem(sitingId.toString()));

                                    localStorage.setItem(sitingId.toString(), JSON.stringify({
                                        rangeMinimized: 1,
                                        houseMinimized: json.houseMinimized,
                                        facadeMinimized: json.facadeMinimized,
                                        selectedRangeName: this.state.selectedRangeName,
                                        selectedHouseName: this.selectedHouseName,
                                        selectedFacadeName: this.selectedFacadeName,
                                    }))
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
                                        name={`${range.name}`}
                                        value={range.id}
                                        checked={String(rangeId) === range.id.toString()}
                                        label={range.name.toUpperCase()}
                                        onChange={rangeId => {
                                            if (houseModel) {
                                                houseModel.houseData = null;
                                                houseModel.clearLayers();
                                            }
                                            this.setState({rangeMinimized: 1});
                                            this.filterCompanyData({rangeId});

                                            const json = JSON.parse(localStorage.getItem(sitingId.toString()));
                                            

                                            localStorage.setItem(sitingId.toString(), JSON.stringify({
                                                rangeMinimized: 1,
                                                houseMinimized: json.houseMinimized,
                                                facadeMinimized: json.facadeMinimized,
                                                selectedRangeName: this.state.selectedRangeName,
                                                selectedHouseName: this.selectedHouseName,
                                                selectedFacadeName: this.selectedFacadeName,
                                            }))
                                        }}
                                    />
                                </div>
                            )
                        }
                    </div>
                </React.Fragment>
                }

                <div className='header'>
                        <span>Select a floorplan</span>
                        {this.state.houseMinimized == 1 && <div className='flex'>
                                <p>{this.state.houseId == null? '' : this.state.selectedHouseName}</p>
                                <img
                                    src={CarrotDown}
                                    onClick={() => {
                                        this.setState({houseMinimized : 0});   
                                        const json = JSON.parse(localStorage.getItem(sitingId.toString()));

                                        localStorage.setItem(sitingId.toString(), JSON.stringify({
                                            rangeMinimized: json.rangeMinimized,
                                            houseMinimized: 0,
                                            facadeMinimized: json.facadeMinimized,
                                            selectedRangeName: this.state.selectedRangeName,
                                            selectedHouseName: this.selectedHouseName,
                                            selectedFacadeName: this.selectedFacadeName,
                                        }))  
                                    }} />
                            </div>}
                        {this.state.houseMinimized == 0 && <img
                                src={CarrotUp}
                                onClick={() => {
                                    this.setState({houseMinimized: 1});
                                    const json = JSON.parse(localStorage.getItem(sitingId.toString()));

                                    localStorage.setItem(sitingId.toString(), JSON.stringify({
                                        rangeMinimized: json.rangeMinimized,
                                        houseMinimized: 1,
                                        facadeMinimized: json.facadeMinimized,
                                        selectedRangeName: this.state.selectedRangeName,
                                        selectedHouseName: this.selectedHouseName,
                                        selectedFacadeName: this.selectedFacadeName,
                                    })) 
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
                                    name={`${house.name}`}
                                    value={house.id}
                                    checked={String(this.state.houseId) === house.id.toString()}
                                    label={house.name.toUpperCase()}
                                    onChange={houseId => {
                                        const selectedHouse = houses.find(house => house.id === houseId);
                                        console.log('selectedHouse', selectedHouse)
                                        this.loadHouse(selectedHouse);

                                        this.setState({houseId: houseId});
                                        this.setState({houseMinimized: 1});
                                        this.setState({selectedHouseName: `${house.name}`})

                                        const json = JSON.parse(localStorage.getItem(sitingId.toString()));

                                        localStorage.setItem(sitingId.toString(), JSON.stringify({
                                            rangeMinimized: json.rangeMinimized,
                                            houseMinimized: 1,
                                            facadeMinimized: json.facadeMinimized,
                                            selectedRangeName: this.state.selectedRangeName,
                                            selectedHouseName: this.selectedHouseName,
                                            selectedFacadeName: this.selectedFacadeName,
                                        })) 
                                    }}
                                />
                            </div>
                        )
                    }
                </div>

                {!searchText &&
                <React.Fragment>
                    <div className='header'>
                        <span>Select a facade</span>
                        {this.state.facadeMinimized == 1 && <div className='flex'>
                                <p>{this.state.selectedFacadeName}</p>
                                <img
                                    src={CarrotDown}
                                    onClick={() => {
                                        this.setState({facadeMinimized : 0});   
                                        
                                        const json = JSON.parse(localStorage.getItem(sitingId.toString()));

                                        localStorage.setItem(sitingId.toString(), JSON.stringify({
                                            rangeMinimized: json.rangeMinimized,
                                            houseMinimized: json.houseMinimized,
                                            facadeMinimized: 0,
                                            selectedRangeName: this.state.selectedRangeName,
                                            selectedHouseName: this.selectedHouseName,
                                            selectedFacadeName: this.selectedFacadeName,
                                        })) 
                                    }} />
                            </div>}
                        {this.state.facadeMinimized == 0 && <img
                                src={CarrotUp}
                                onClick={() => {
                                    this.setState({facadeMinimized: 1});

                                    const json = JSON.parse(localStorage.getItem(sitingId.toString()));

                                    localStorage.setItem(sitingId.toString(), JSON.stringify({
                                        rangeMinimized: json.rangeMinimized,
                                        houseMinimized: json.houseMinimized,
                                        facadeMinimized: 1,
                                        selectedRangeName: this.state.selectedRangeName,
                                        selectedHouseName: this.selectedHouseName,
                                        selectedFacadeName: this.selectedFacadeName,
                                    })) 
                                }}
                            />
                        }
                    </div>
                    <div className="form-rows">
                        {
                            (houseModel && houseModel.format === HouseModel.FORMAT_XML) ?
                                (houseModel.xmlData.reader.facades.map(
                                    facade => {
                                        return (
                                            <div key={facade.id}
                                                 className="form-row">
                                                <HouseRadio
                                                    name={`${facade.id}`}
                                                    value={facade.id}
                                                    checked={facade === houseModel.xmlMerger.facade}
                                                    label={facade.name.toUpperCase()}
                                                    onChange={() => {
                                                        houseModel.setXMLSelectedFacade(facade);
                                                        this.recordState();
                                                        this.setState({selectedFacadeName: `${facade.id}`});
                                                        this.setState({facadeMinimized: 1});

                                                        const json = JSON.parse(localStorage.getItem(sitingId.toString()));

                                                        localStorage.setItem(sitingId.toString(), JSON.stringify({
                                                            rangeMinimized: json.rangeMinimized,
                                                            houseMinimized: json.houseMinimized,
                                                            facadeMinimized: 1,
                                                            selectedRangeName: this.state.selectedRangeName,
                                                            selectedHouseName: this.selectedHouseName,
                                                            selectedFacadeName: this.selectedFacadeName,
                                                        })) 
                                                        
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
                                                            name={`${group.id}`}
                                                            value={group.id}
                                                            checked={facade.visible}
                                                            label={label.toUpperCase()}
                                                            onChange={facadeId => {
                                                                houseModel.selectFacade(facadeId);
                                                                this.recordState();
                                                                this.setState({selectedFacadeName: `${group.id}`});
                                                                this.setState({facadeMinimized: 1});

                                                                const json = JSON.parse(localStorage.getItem(sitingId.toString()));

                                                                localStorage.setItem(sitingId.toString(), JSON.stringify({
                                                                    rangeMinimized: json.rangeMinimized,
                                                                    houseMinimized: json.houseMinimized,
                                                                    facadeMinimized: 1,
                                                                    selectedRangeName: this.state.selectedRangeName,
                                                                    selectedHouseName: this.selectedHouseName,
                                                                    selectedFacadeName: this.selectedFacadeName,
                                                                })) 
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
                                                    <HouseRadio
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
                                                        <HouseRadio
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
                                    onClick={() => this.toggleMirror()}
                                    text={{on: 'Mirror floorplan', off: 'Mirror floorplan'}}
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
                drawerData, setDrawerData,
            }}/>
        }
    </DrawerContext.Consumer>
);

const LotHousesInstance = connect((state) => ({
    drawerDetails: state.sitingsDrawerDetails,
}), null)(LotHousesConsumer);

export default LotHousesInstance;