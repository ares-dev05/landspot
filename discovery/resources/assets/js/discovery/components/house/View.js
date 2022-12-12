import React from 'react';
import {Route, Switch} from 'react-router-dom';
import {clickHandler} from '~/helpers';
import NiceDropdown from '~/helpers/NiceDropdown';
import {RightPanel} from '~/helpers/Panels';
import {HouseContext} from '../../House';
import Facade from './Facade';
import Floorplan from './Floorplan';
import Gallery from './Gallery';
import HouseNavigation from './HouseNavigation';
import Options from './Options';
import Overview3D from './Overview3D';
import {PathNavLink} from '~/helpers';

const View = () => (
    <HouseContext.Consumer>
        {
            ({
                 selectedHouse: {
                     id, checkOptions, title, facades, floorplans, gallery, overview3DUrl,
                     hidePrintBrochure, canFindLots,
                     attributes: {depth, width}
                 },
                 selectedFacadeIndex, basePath, selectFacade
            }) =>
                <RightPanel>
                    <div className='nav-panel nav-panel-layout'>
                        {
                            canFindLots &&
                            <PathNavLink
                                to='/landspot/my-estates?depth=:depth&width=:width&from_house=:from_house'
                                urlArgs={{depth, width, from_house: id}}
                                className={'button default'}>
                                Find lots
                            </PathNavLink>
                        }
                        {
                            basePath === '/footprints' &&
                            <button className="button default"
                                    onClick={
                                        e => clickHandler(
                                            e, () => window.parent.postMessage({
                                                event: 'selectHouse',
                                                //houseRange: selectedHouse.range.name,
                                                houseName: title
                                            }, '*')
                                        )
                                    }
                            >Load in sitings
                            </button>
                        }

                        <FacadesSelect {...{facades, selectedFacadeIndex, selectFacade}}/>
                        {
                            !hidePrintBrochure &&
                            <PathNavLink
                                to={`/discovery/print-brochure/${facades[selectedFacadeIndex].id}`}
                                className={'button default'}>
                                <i className='far fa-file-pdf'/>
                                Print Flyer
                            </PathNavLink>
                        }
                    </div>
                    <HouseNavigation/>
                    <Switch>
                        <Route exact path={basePath + '/overview/:houseId'} component={Facade}/>
                        {
                            floorplans.length > 0 &&
                            <Route exact path={basePath + '/floorplan/:houseId'} component={Floorplan}/>
                        }
                        {
                            overview3DUrl &&
                            <Route path={basePath + '/volume/:houseId'} component={Overview3D}/>
                        }
                        {
                            checkOptions &&
                            <Route path={basePath + '/available-options/:houseId'} component={Options}/>
                        }
                        {
                            gallery.length > 0 &&
                            <Route path={basePath + '/gallery/:houseId'} component={Gallery}/>
                        }

                    </Switch>
                </RightPanel>
        }
    </HouseContext.Consumer>

);

const FacadesSelect = ({facades, selectedFacadeIndex, selectFacade}) => (
    <div className='select-facade'>
        Facade option
        <NiceDropdown
            items={facades.map((facade, index) => ({text: facade.title || 'Unnamed', value: index}))}
            onChange={selectFacade}
            defaultItem={null}
            defaultValue={null}
            value={selectedFacadeIndex}
        />
    </div>
);


export default View;