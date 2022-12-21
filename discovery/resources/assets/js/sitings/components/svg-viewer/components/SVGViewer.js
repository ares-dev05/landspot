import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {withAlert} from 'react-alert';
import {connect} from 'react-redux';
import {LoadingSpinner} from '~sitings~/helpers';

import Utils from '~/sitings-sdk/src/utils/Utils';
import * as actions from '../store/manager/actions';
import AreaEditor, {FacadeItems, OptionItems, ViewerContext} from './AreaEditor';
import HouseViewer from './HouseViewer';
import {loadSVGFromURL} from './SVGLoader';

export const STEP_VIEWER = 0;
export const STEP_EDITOR = 1;

class SVGViewer extends Component {

    static propTypes = {
        floorplanId: PropTypes.number.isRequired,
        getSVG: PropTypes.func.isRequired,
        onMount: PropTypes.func.isRequired,
        resetStore: PropTypes.func.isRequired,
        resetSVGUpdated: PropTypes.func.isRequired,
        step: PropTypes.number.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            activeFacade: -1,
            activeOption: -1,
            facades: [],
            options: [],
            svgFacades: null,
            svgOptions: null,
            svgURL: null,
            preloader: true,
            houseData: null,
        };

        this.rawSVGData = '';
    }

    componentDidMount() {
        const {getSVG, floorplanId} = this.props;
        if (floorplanId) {
            getSVG({id: floorplanId});
        }
    }

    static parseAreaData = ({areaData, svgFacades, svgOptions}) => {
        const area = areaData ? areaData.area : {};
        let {facades, options} = area;

        if (facades || options) {
            return area;
        }

        facades = svgFacades.map(f => {
            const facadeId = f.id.toLowerCase().replace(/x5f_/gi, '');
            const facadeWithAttrs = {...f};

            if (area[facadeId]) {
                Object.keys(area[facadeId]).forEach(key => facadeWithAttrs[key] = area[facadeId][key] || '');
            } else {
                Object.keys(FacadeItems).forEach(key => facadeWithAttrs[key] = f[key] || '');
            }

            return facadeWithAttrs;
        });

        options = svgOptions.map(o => {
            const optId = o.id.toLowerCase().replace(/x5f_/gi, '');
            const optWithAttrs = {...o};

            if (area[optId]) {
                Object.keys(area[optId]).forEach(key => optWithAttrs[key] = area[optId][key] || '');
            } else {
                Object.keys(OptionItems).forEach(key => optWithAttrs[key] = o[key] || '');
            }

            return optWithAttrs;
        });

        return {facades, options};
    };

    parseSVG = svgURL => {
        const {onMount, svgViewerManager: {floorplan: {area_data}}} = this.props;
        loadSVGFromURL(svgURL)
            .then(
                ({houseData, rawData}) => {
                    const svgFacades = SVGViewer.extractFacades(houseData);
                    const svgOptions = SVGViewer.extractOptions(houseData);

                    let area = {};
                    if (area) {
                        try {
                            const areaData = JSON.parse(area_data);
                            area = SVGViewer.parseAreaData({areaData, svgFacades, svgOptions});
                        } catch (e) {
                            console.error(e);
                        }
                    }
                    let {facades, options} = area;

                    const activeFacade = facades.length >= 0 ? 0 : -1;
                    const activeOption = options.length >= 0 ? 0 : -1;
                    this.setState({
                        houseData, facades, options, activeFacade, activeOption
                    });
                    this.rawSVGData = rawData;
                    onMount(this.generateSVGCallback);
                }
            );
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {svgURL} = this.state;
        if (svgURL && prevState.svgURL !== svgURL) {
            this.parseSVG(svgURL);
        }
    }

    static extractFacades(houseData) {
        const facades = [];
        for (let i = 0, f; (f = houseData.facades[i++]);) {
            let id = f.id;
            let name = Utils.svgIdToName(id);
            let visible = true;
            facades.push({id, name, visible});
        }
        return facades;
    }

    static extractOptions(houseData) {
        const options = [];
        for (let i = 0, o; (o = houseData.options[i++]);) {
            let name = Utils.svgIdToName(o.id);
            let id = o.id;
            let visible = true;
            options.push({id, name, visible});
        }
        return options;
    }

    componentWillUnmount() {
        this.props.onMount(null);
        this.props.resetStore();
    }

    generateSVGCallback = () => {
        const {facades, options} = this.state;

        const area = {
            facades,
            options
        };

        const svg = document.createElement('svg');
        svg.innerHTML = this.rawSVGData;
        const svgFacadeNodes = svg.querySelectorAll('g[id^="facade_" i]');
        const svgOptionNodes = svg.querySelectorAll('g[id^="option_" i]');

        function toFloat(s) {
            const v = parseFloat(s.toString().replace(',', '.'));
            return (isFinite(v) && v >= 0) ? v : 0;
        }

        if (facades.length === svgFacadeNodes.length) {
            facades.forEach((f, index) => {
                f.name = f.name.trim();
                f.floor = toFloat(f.floor);
                f.garage = toFloat(f.garage);
                f.alfresco = toFloat(f.alfresco);
                f.porch = toFloat(f.porch);
                const node = svgFacadeNodes[index];
                node.id = f.id = 'facade_' + f.name.toLowerCase().replace(' ', '_');
            });
        }

        if (options.length === svgOptionNodes.length) {
            options.forEach((o, index) => {
                o.name = o.name.trim();
                o.option = toFloat(o.option);
                const node = svgOptionNodes[index];
                node.id = o.id = 'option_' + o.name.toLowerCase().replace(' ', '_');
            });
        }

        return {
            areaJSON: JSON.stringify({area}),
            svgBlob: new Blob([svg.innerHTML], {type: 'image/svg+xml'})
        };
    };

    static getDerivedStateFromProps(props, state) {
        const newState = {};
        const {SVG_UPDATED, floorplan} = props.svgViewerManager;

        const {svgViewerManager:{errors}, alert:{error}} = props;

        if (errors && errors.length) {
            error(errors.map(
                (error, errorIndex) => <div key={errorIndex}>{error.message || error}</div>
            ));
            props.resetSVGMessages();
        }


        if (SVG_UPDATED) {
            newState.preloader = false;
            props.resetSVGUpdated();
        }
        if (floorplan) {
            const {svgURL} = floorplan;
            if (svgURL && !state.svgURL) {
                newState.svgURL = svgURL;
            }
        }
        return Object.keys(newState).length > 0 ? newState : null;
    }

    setActiveFacade = activeFacade => {
        this.setState({activeFacade});
    };

    setActiveOption = activeOption => {
        this.setState({activeOption});
    };

    setFacadeVisibility = (index, visible) => {
        const facade = {...this.state.facades[index]};
        facade.visible = visible;
        const {facades} = this.state;
        facades[index] = facade;
        this.setState({facades: [...facades]});
    };

    setOptionSelection = (index, visible) => {
        const option = {...this.state.options[index]};
        option.visible = visible;
        const {options} = this.state;
        options[index] = option;
        this.setState({options: [...options]});
    };

    onFacadeAttributeChange = (e, index, item) => {
        e.preventDefault();
        e.stopPropagation();
        const facade = {...this.state.facades[index]};

        facade[item] = e.target.value;
        const {facades} = this.state;
        facades[index] = facade;
        this.setState({facades: [...facades]});
    };

    onOptionAttributeChange = (e, index, item) => {
        e.preventDefault();
        e.stopPropagation();
        const option = {...this.state.options[index]};

        option[item] = e.target.value;
        const {options} = this.state;
        options[index] = option;
        this.setState({options: [...options]});
    };

    render() {
        const {houseData, activeFacade, activeOption, facades, options} = this.state;
        const selectedOptions = options.filter((option, optIndex) => optIndex === activeOption)
                                       .reduce((acc, option) => {
                                           acc.push(option.id);
                                           return acc;
                                       }, []);

        const {floorplan} = this.props.svgViewerManager;
        const {step} = this.props;

        const contextValues = {
            activeFacade,
            activeOption,
            facades,
            floorplan,
            houseData,
            options,
            selectedOptions,
            storeViewerRef: this.storeViewerRef,
            setActiveFacade: this.setActiveFacade,
            setActiveOption: this.setActiveOption,
            setFacadeVisibility: this.setFacadeVisibility,
            setOptionSelection: this.setOptionSelection,
            onFacadeAttributeChange: this.onFacadeAttributeChange,
            onOptionAttributeChange: this.onOptionAttributeChange,
        };

        return (
            floorplan
                ? <ViewerContext.Provider value={contextValues}>
                    {
                        step === STEP_VIEWER && <HouseViewer/>
                    }
                    {
                        step === STEP_EDITOR && <AreaEditor/>
                    }
                </ViewerContext.Provider>

                : <LoadingSpinner/>
        );
    }
}

export {SVGViewer};

export default withAlert(connect(
    (state => ({
        svgViewerManager: state.svgViewerManager,
        userProfile: state.userProfile,
    })), actions
)(SVGViewer));
