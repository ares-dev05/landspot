import React, {Component} from 'react';
import {connect} from 'react-redux';
import axios from 'axios';
import {ContentPanel, LeftPanel} from '~/helpers/Panels';
import Sidebar from '../lotmix/components/discovery/components/house/Sidebar';
import View from './components/house/View';
import {CloseDiscoveryLink, LoadingSpinner, PathNavLink} from '~/helpers';

const HouseContext = React.createContext();

class House extends Component {

    constructor(props) {
        super(props);

        this.state = {
            path: '',
            selectedHouse: null,
            selectedFacadeIndex: 0,
        };
    }

    componentDidMount() {
        let resultsUrl = '';
        const {state} = this.props.location;
        if(state) resultsUrl = state.resultsUrl;

        const {houseId} = this.props.match.params;
        const {basePath} = this.props.catalogue;
        const housePath = basePath + '/' + houseId;
        const path = resultsUrl || basePath;

        this.setState({path});

        if (houseId) {
            this.getHouseOptions(housePath);
        }
    }

    getHouseOptions = (housePath) => {
        axios.get(housePath).then((response) => {
            this.setState({selectedHouse: response.data.house});
        });
    };

    backToResults = () => {
        const url = this.props.catalogue.url ? this.props.catalogue.url : this.state.path;
        this.props.history.push(url);
    };

    selectFacade = (selectedFacadeIndex) => this.setState({selectedFacadeIndex});

    render() {
        const {selectedHouse, selectedFacadeIndex, path} = this.state;
        const {basePath} = this.props.catalogue;

        const contextValues = {
            basePath, selectedHouse, selectedFacadeIndex,
            backToResults: this.backToResults,
            selectFacade: this.selectFacade
        };

        return (
            selectedHouse
                ?
                <HouseContext.Provider value={contextValues}>
                    <CloseDiscoveryLink/>
                    <ContentPanel className='house-overview'>
                        <div className='responsive-container house'>
                            <LeftPanel>
                                <PathNavLink className="back-nav" to={path}>
                                    <i className="fal fa-angle-left"/>
                                    <span>Back to all floorplans</span>
                                </PathNavLink>
                                <header className='ellipsis'>{selectedHouse.title}</header>
                                <Sidebar/>
                            </LeftPanel>
                            <View/>
                        </div>
                    </ContentPanel>
                </HouseContext.Provider>

                :
                <LoadingSpinner/>
        );
    }
}

export {HouseContext};

export default connect((state => ({catalogue: state.catalogue})))(House);