import React from 'react';
import ExistingRetainingWall from '~/sitings-sdk/src/sitings/model/levels/segmentation/ExistingRetainingWall';
import WallPortions from './WallPortions';


/**
 * @param wallPortion {WallPortion}
 * @param onCanvasModelChange
 */
const onWallPortionDelete = (wallPortion, onCanvasModelChange) => {
    wallPortion.deletePoint();
    onCanvasModelChange();
};


/**
 * @param wallNo
 * @param wall {ExistingRetainingWall}
 * @param onWallDelete
 * @param onCanvasModelChange
 * @returns {*}
 * @constructor
 */
const RetainingWall = ({wallNo, wall, onWallDelete, onCanvasModelChange}) => {
    let tabIndex = wallNo * 5;

    return (
        <div className="block">
            <div className="easement-number">
                {wallNo}
            </div>
            <div className="easement-type" style={{width: 'auto'}}>
                Retaining Wall
            </div>

            <div className='easement-dimension' style={{width: 'auto'}}>
                <div className='landconnect-input input-group'>
                    <div className="input-group-addon" style={{padding: '0 5px'}}>
                        <button type="button" className='button transparent'
                                onClick={() => {
                                    wall.insideLot = !wall.insideLot;
                                    onCanvasModelChange();
                                }}>
                            {wall.insideLot ? 'INTERIOR' : 'EXTERIOR'}
                        </button>
                    </div>
                </div>
                <div className='easement-angle'>
                    <div className='landconnect-input'>
                        <input type='number'
                               tabIndex={tabIndex++}
                               disabled={!wall.insideLot}
                               autoComplete="off"
                               onChange={(e) => {
                                   wall.inset = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                                   onCanvasModelChange();
                               }}
                               onMouseEnter={() => wall.highlight = ExistingRetainingWall.HIGHLIGHT_FULL}
                               onMouseLeave={() => wall.highlight = ExistingRetainingWall.HIGHLIGHT_NONE}
                               onFocus={(event) => event.target.select()}
                               maxLength={7}
                               placeholder={'Distance'}
                               value={wall.inset || ''}
                        />
                    </div>
                </div>
                <div className='easement-angle' style={{margin: '0', marginBottom: '10px'}}>
                    <div className='landconnect-input'>
                        <input type='number'
                               tabIndex={tabIndex++}
                               autoComplete="off"
                               onChange={(e) => {
                                   wall.startInnerLevel.height = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                                   onCanvasModelChange();
                               }}
                               onMouseEnter={() => wall.highlight = ExistingRetainingWall.HIGHLIGHT_START_IN}
                               onMouseLeave={() => wall.highlight = ExistingRetainingWall.HIGHLIGHT_NONE}
                               maxLength={7}
                               placeholder={'Inside Start Level'}
                               value={wall.startInnerLevel.height || ''}
                        />
                    </div>
                    <div className='landconnect-input'>
                        <input type='number'
                               tabIndex={tabIndex++}
                               autoComplete="off"
                               onChange={(e) => {
                                   wall.startOuterLevel.height = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                                   onCanvasModelChange();
                               }}
                               onMouseEnter={() => wall.highlight = ExistingRetainingWall.HIGHLIGHT_START_OUT}
                               onMouseLeave={() => wall.highlight = ExistingRetainingWall.HIGHLIGHT_NONE}
                               maxLength={7}
                               placeholder={'Outside Start Level'}
                               value={wall.startOuterLevel.height || ''}
                        />
                    </div>
                </div>

                <div className='easement-angle' style={{margin: '0', marginBottom: '10px'}}>
                    <div className='landconnect-input'>
                        <input type='number'
                               tabIndex={tabIndex++}
                               autoComplete="off"
                               onChange={(e) => {
                                   wall.endInnerLevel.height = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                                   onCanvasModelChange();
                               }}
                               onMouseEnter={() => wall.highlight = ExistingRetainingWall.HIGHLIGHT_END_IN}
                               onMouseLeave={() => wall.highlight = ExistingRetainingWall.HIGHLIGHT_NONE}
                               maxLength={7}
                               placeholder={'Inside End Level'}
                               value={wall.endInnerLevel.height || ''}
                        />
                    </div>
                    <div className='landconnect-input'>
                        <input type='number'
                               tabIndex={tabIndex++}
                               autoComplete="off"
                               onChange={(e) => {
                                   wall.endOuterLevel.height = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                                   onCanvasModelChange();
                               }}
                               onMouseEnter={() => wall.highlight = ExistingRetainingWall.HIGHLIGHT_END_OUT}
                               onMouseLeave={() => wall.highlight = ExistingRetainingWall.HIGHLIGHT_NONE}
                               maxLength={7}
                               placeholder={'Outside End Level'}
                               value={wall.endOuterLevel.height || ''}
                        />
                    </div>
                </div>

                <div className="easement" style={{margin: '0'}}>
                    <div className="blocks" style={{margin: '0'}}>
                        {wall.wallPortions.map((wallPortion, i) =>
                            <WallPortions
                                key={i}
                                wallPortion={wallPortion}
                                onCanvasModelChange={onCanvasModelChange}
                                onWallportionDelete={(wallPortion) => onWallPortionDelete(wallPortion, onCanvasModelChange)}
                            />
                        )}
                    </div>
                </div>

                <div className='landconnect-input input-group' style={{marginTop: '0', marginBottom: '15px'}}>
                    <div className="btn-group">
                        <button type="button" className='button default'
                                style={{paddingLeft: '1em', marginTop: '0'}}
                                onClick={() => {
                                    wall.addWallPortion();
                                }}>
                            <i className="landconnect-icon plus" style={{marginRight: '10px'}}/> Wall Section
                        </button>
                    </div>
                </div>
            </div>

            <button type="button" className='button transparent delete-btn'
                    onClick={() => {
                        onWallDelete(wall);
                        onCanvasModelChange();
                    }}>
                <i className='landconnect-icon times'/>
            </button>
        </div>
    );
};

export default RetainingWall;