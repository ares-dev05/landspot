import React from 'react';
import {Route, Switch} from 'react-router-dom';
import {clickHandler, PathNavLink} from '~/helpers';
import {RightPanel} from '~/helpers/Panels';
import {HouseContext} from '~/discovery/House';
import Floorplan from '~/discovery/components/house/Floorplan';
import Gallery from '~/discovery/components/house/Gallery';
import FacadeGallery from './FacadesGallery';
import HouseNavigation from './HouseNavigation';
import Options from '~/discovery/components/house/Options';
import Overview3D from '~/discovery/components/house/Overview3D';
import {LandspotEstates} from '../../../landspot/LandspotEstates';

const View = () => (
    <HouseContext.Consumer>
        {
            ({
                 selectedHouse: {
                     id, checkOptions, title, facades, floorplans, gallery, overview3DUrl,
                     hidePrintBrochure, canFindLots,
                     attributes: {depth, width}
                 },
                 selectedFacadeIndex, basePath
             }) =>
                <RightPanel className="lotmix-floorplan">
                    <div className='nav-panel'>
                        <HouseNavigation/>
                        {
                            canFindLots &&
                            <PathNavLink
                                to={`${LandspotEstates.componentUrl}?depth=:depth&width=:width&from_house=:from_house`}
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
                        {
                            !hidePrintBrochure &&
                            <a href={'/floorplans/print-brochure/' + facades[selectedFacadeIndex].id}
                               className="button primary flyer">
                                <i className="fa fa-file-pdf-o"/>Print Flyer</a>
                        }

                    </div>


                    <Switch>
                        <Route exact path={basePath + '/overview/:houseId'} component={FacadeGallery}/>
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

export default View;