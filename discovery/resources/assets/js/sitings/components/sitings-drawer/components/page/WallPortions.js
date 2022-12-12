import classnames from 'classnames';
import React, {useEffect, useState} from 'react';
import HighlightableModel from '~/sitings-sdk/src/events/HighlightableModel';

/**
 * @param wallPortion {WallPortion}
 * @param onPointDelete
 * @param onCanvasModelChange
 * @returns {*}
 * @constructor
 */
const WallPortions = ({wallPortion, onWallportionDelete, onCanvasModelChange}) => {
    const [state, setState] = useState({
        innerHighlight: wallPortion.innerLevel.highlight,
        outerHighlight: wallPortion.outerLevel.highlight,
    });

    useEffect(() => {
        const innerHighlightChange = () => setState({...state, innerHighlight: wallPortion.innerLevel.highlight});
        const outerHighlightChange = () => setState({...state, outerHighlight: wallPortion.outerLevel.highlight});

        setState({
            innerHighlight: wallPortion.innerLevel.highlight,
            outerHighlight: wallPortion.outerLevel.highlight,
        });

        const inner = wallPortion.innerLevel;
        const outer = wallPortion.outerLevel;

        inner.addEventListener(HighlightableModel.HIGHLIGHT_CHANGE, innerHighlightChange);
        outer.addEventListener(HighlightableModel.HIGHLIGHT_CHANGE, outerHighlightChange);

        return () => {
            inner.removeEventListener(HighlightableModel.HIGHLIGHT_CHANGE, innerHighlightChange);
            outer.removeEventListener(HighlightableModel.HIGHLIGHT_CHANGE, outerHighlightChange);
        };
    }, []);

    return (
        <div className="block street-names">

            <div className='easement-dimension street-names-input'
                 onMouseEnter={() => wallPortion.innerLevel.highlight=true}
                 onMouseLeave={() => wallPortion.innerLevel.highlight=false}>
                <div className='landconnect-input'>
                    <input type='number'
                           autoComplete="off"
                           onChange={(e) => {
                               wallPortion.innerLevel.height = Number(e.currentTarget.value);
                               onCanvasModelChange();
                           }}
                           className={classnames(wallPortion.innerLevel.highlight && !wallPortion.outerLevel.highlight ? 'highlight' : '')}
                           placeholder='Inner Level'
                           value={wallPortion.innerLevel.height || ''}
                    />
                </div>
            </div>

            <div className='easement-dimension street-names-input'
                 onMouseEnter={() => wallPortion.outerLevel.highlight=wallPortion.innerLevel.highlight=true}
                 onMouseLeave={() => wallPortion.outerLevel.highlight=wallPortion.innerLevel.highlight=false}
                 style={{marginLeft: '10px'}}>
                <div className='landconnect-input'>
                    <input type='number'
                           autoComplete="off"
                           onChange={(e) => {
                               wallPortion.outerLevel.height = Number(e.currentTarget.value);
                               onCanvasModelChange();
                           }}
                           className={classnames(wallPortion.outerLevel.highlight ? 'highlight' : '')}
                           placeholder='Outer Level'
                           value={wallPortion.outerLevel.height || ''}
                    />
                </div>
            </div>

            <button type="button" className='button transparent delete-btn'
                    onClick={() => onWallportionDelete(wallPortion)}>
                <i className='landconnect-icon times'/>
            </button>
        </div>
    );
};

export default WallPortions;