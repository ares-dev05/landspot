import React from 'react';
import {clickHandler, ToggleButton} from '~sitings~/helpers';
import HouseRenderer from './HouseRenderer';

import {ViewerContext} from './AreaEditor';

const HouseViewer = () => (
    <ViewerContext.Consumer>
        {
            ({
                 houseData, selectedOptions, facades, activeFacade, activeOption,
                 options,
                 setActiveFacade, setFacadeVisibility, setOptionSelection, setActiveOption
             }) =>
                <div className='floorplan-viewer'>
                    {
                        houseData &&
                        <HouseRenderer houseData={houseData}
                                       selectedOptions={selectedOptions}
                                       activeFacadeId={facades[activeFacade] ? facades[activeFacade].id : ''}
                        />
                    }
                    <label>FACADES</label>
                    <FacadesList {...{
                        activeItem: activeFacade,
                        items: facades,
                        setActiveItem: setActiveFacade,
                        setItemVisibility: setFacadeVisibility,
                    }}/>

                    <label>OPTIONS</label>
                    <FacadesList {...{
                        activeItem: activeOption,
                        items: options,
                        setActiveItem: setActiveOption,
                        setItemVisibility: setOptionSelection,
                    }}/>
                </div>
        }
    </ViewerContext.Consumer>
);

const FacadesList = ({
                         activeItem, items, setActiveItem, setItemVisibility
                     }) => (
    <div className='item-options'>
        <div className='items-list'>
            {
                items.map((item, index) =>
                    <div key={index} className='item facade'>
                        <button type='button'
                                className='button transparent'
                                onClick={e => clickHandler(e, setActiveItem, [index])}>
                            <i className={
                                activeItem === index
                                    ? "beg-icon fas fa-circle"
                                    : "beg-icon fal fa-circle"}
                            />
                            {item.name}
                        </button>
                        <ToggleButton
                            key={index}
                            title='Visibility'
                            onClick={v => setItemVisibility(index, v)}
                            toggledOnText={''}
                            state={item.visible}
                            textPosition='left'
                            toggledOffText={''}
                        />
                    </div>
                )
            }
        </div>
    </div>
);

const OptionsList = ({items, setItemVisibility}) => (
    <div className='item-options'>
        <div className='items-list'>
            {
                items.map((item, index) =>
                    <div key={index} className='item'>
                        <span className='static-item'>{item.name}</span>
                        <ToggleButton
                            key={index}
                            title='Visibility'
                            onClick={v => setItemVisibility(index, v)}
                            toggledOnText={''}
                            state={item.selected}
                            textPosition='left'
                            toggledOffText={''}
                        />
                    </div>
                )
            }
        </div>
    </div>
);

export default HouseViewer;
