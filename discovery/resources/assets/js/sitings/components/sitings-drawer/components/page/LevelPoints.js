import classnames from 'classnames';
import React, {useEffect, useState} from 'react';
import HighlightableModel from '../../../../../sitings-sdk/src/events/HighlightableModel';

/**
 * @param pointNo
 * @param point {LevelPointModel}
 * @param onPointDelete
 * @param onCanvasModelChange
 * @returns {*}
 * @constructor
 */
const LevelPoints = ({pointNo, point, onPointDelete, onCanvasModelChange}) => {
    const [state, setState] = useState({
        highlight: point.highlight
    });

    useEffect(() => {
        const handleHighlightChange = () => {
            setState({highlight: point.highlight});
        };

        setState({highlight: point.highlight});
        point.addEventListener(HighlightableModel.HIGHLIGHT_CHANGE, handleHighlightChange);

        return () => point.removeEventListener(HighlightableModel.HIGHLIGHT_CHANGE, handleHighlightChange);
    }, []);

    return (
        <div className="block street-names"
             onMouseEnter={() => point.highlight=true}
             onMouseLeave={() => point.highlight=false}>
            {pointNo !== null &&
            <div className="easement-number street-names-number">
                {pointNo}
            </div>
            }

            <div className='easement-dimension street-names-input'>
                <div className='landconnect-input'>
                    <input type='number'
                           autoComplete="off"
                           onChange={(e) => {
                               point.height = e.currentTarget.value;
                               onCanvasModelChange();
                           }}
                           className={classnames(point.highlight ? 'highlight' : '')}
                           placeholder='Metres'
                           value={point.height || ''}
                    />
                </div>
            </div>

            <button type="button" className='button transparent delete-btn'
                    onClick={() => onPointDelete(point)}>
                <i className='landconnect-icon times'/>
            </button>
        </div>
    );
};
export default LevelPoints;