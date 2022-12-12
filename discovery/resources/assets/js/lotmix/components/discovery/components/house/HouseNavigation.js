import React from 'react';
import {PathNavLink} from '~/helpers';
import {HouseContext} from '~/discovery/House';

const Navigation = () => (
    <HouseContext.Consumer>
        {
            ({basePath, selectedHouse: {id, checkOptions, facades, floorplans, gallery, overview3DUrl}}) => (
                <nav className='floorplan-nav' role="navigation">
                    <PathNavLink activeClassName='active'
                                 urlArgs={{id}}
                                 to={`${basePath}/overview/:id`}>
                        <i className="fas fa-images"/>Facade
                    </PathNavLink>

                    {
                        floorplans.length > 0 &&
                        <PathNavLink activeClassName='active'
                                     urlArgs={{id}}
                                     to={`${basePath}/floorplan/:id`}>
                            <i className="landspot-icon floorplan"/>Floorplan
                        </PathNavLink>
                    }

                    {
                        overview3DUrl &&
                        <PathNavLink activeClassName='active'
                                     urlArgs={{id}}
                                     to={`${basePath}/volume/:id`}>
                            <i className="landspot-icon cube"/>3D Walkthrough
                        </PathNavLink>
                    }

                    {
                        checkOptions &&
                        <PathNavLink activeClassName='active'
                                     urlArgs={{id}}
                                     to={`${basePath}/available-options/:id`}>
                            <i className="landspot-icon list"/>Options
                        </PathNavLink>
                    }
                    {
                        gallery.length > 0 &&
                        <PathNavLink activeClassName='active'
                                     urlArgs={{id}}
                                     to={`${basePath}/gallery/:id`}>
                            <i className="fas fa-images"/>Image Gallery
                        </PathNavLink>
                    }

                </nav>
            )
        }

    </HouseContext.Consumer>
);

export default Navigation;