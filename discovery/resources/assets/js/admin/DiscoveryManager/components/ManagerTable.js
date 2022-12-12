import React from 'react';
import {clickHandler} from '~/helpers';
import UserAction from './consts';
import PropTypes from 'prop-types';
import {ToggleButton} from '~/helpers';

const ManagerTable = ({
                          houses, sortHouses, setUserAction, sortable, updateDiscovery
                      }) => {
    const getSortClass = () => {
        if (sortable.order === 'asc') {
            return 'fal fa-sort-alpha-up';
        } else if (sortable.order === 'desc') {
            return 'fal fa-sort-alpha-down';
        } else {
            return 'fal fa-sort';
        }
    };

    return (
        <table className="table">
            <thead>
            <tr>
                <th>RANGE</th>
                <th>
                    <a href="#"
                       onClick={
                           (e) => clickHandler(e, sortHouses, [false])
                       }
                       aria-hidden="true">
                        NAME <i className={getSortClass()} aria-hidden="true"/>
                    </a>
                </th>
                <th>FACADES</th>
                <th>FLOORPLAN</th>
                <th>GALLERY</th>
                <th>DETAILS</th>
                <th>DISCOVERY</th>
                <th>ACTION</th>
            </tr>
            </thead>
            <tbody>
            {houses.data.map(house =>
                <tr key={house.id}>
                    <td>{house.rangeName}</td>
                    <td className='title'>{house.title}</td>
                    <td>
                        <a href="#"
                           onClick={(e) => clickHandler(e, setUserAction, [UserAction.SHOW_HOUSE_MEDIA_DIALOG, {
                               house,
                               mediaType: 'facades'
                           }])}
                           className="button transparent" aria-hidden="true">
                            <i className='landspot-icon cog'/>
                        </a>
                    </td>
                    <td>
                        <a href="#"
                           onClick={(e) => clickHandler(e, setUserAction, [UserAction.SHOW_HOUSE_MEDIA_DIALOG, {
                               house,
                               mediaType: 'floorplans'
                           }])}
                           className="button transparent" aria-hidden="true">
                            <i className='landspot-icon cog'/>
                        </a>
                    </td>
                    <td>
                        <a href="#"
                           onClick={(e) => clickHandler(e, setUserAction, [UserAction.SHOW_HOUSE_MEDIA_DIALOG, {
                               house,
                               mediaType: 'gallery'
                           }])}
                           className="button transparent" aria-hidden="true">
                            <i className='landspot-icon cog'/>
                        </a>
                    </td>
                    <td>
                        <a href="#"
                           onClick={(e) => clickHandler(e, setUserAction, [UserAction.SHOW_DETAILS_DIALOG, {
                               house,
                           }])}
                           className="button transparent" aria-hidden="true">
                            <i className='landspot-icon cog'/>
                        </a>
                    </td>
                    <td>
                        <ToggleButton
                            onClick={() => updateDiscovery({house})}
                            state={house.discovery > 0}
                        />
                    </td>
                    <td className="actions">
                        <a title="Delete house"
                           href="#"
                           onClick={(e) => clickHandler(e, setUserAction, [UserAction.CONFIRM_REMOVE_ITEM, {
                               itemId: house.id,
                               itemName: house.title,
                               itemType: 'house'
                           }])}
                           aria-hidden="true">
                            <i className='landspot-icon trash'/>
                        </a>
                    </td>
                </tr>
            )}
            </tbody>
        </table>
    );
};

ManagerTable.propTypes = {
    houses: PropTypes.shape({
        data: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number,
                title: PropTypes.string,
                rangeName: PropTypes.string,
                discovery: PropTypes.number
            })
        )
    }).isRequired,
    sortable: PropTypes.object.isRequired,

    sortHouses: PropTypes.func.isRequired,
    setUserAction: PropTypes.func.isRequired,
    updateDiscovery: PropTypes.func.isRequired
};

export default ManagerTable;