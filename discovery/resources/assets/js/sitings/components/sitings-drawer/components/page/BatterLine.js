import React from 'react';

/**
 * @param pathNo
 * @param batter {SegmentationPath}
 * @param onPathDelete
 * @returns {*}
 * @constructor
 */
const BatterLine = ({pathNo, batter, onPathDelete}) => {
    return (
        <div className="edge">
            <div className="edge-shape">
                <span>{pathNo}</span>

                <React.Fragment>
                    {batter.points.map(
                        (point,index) =>
                            <button key={index} type="button" className="button edge-type small" disabled={true}>
                                <span>{Number(point.height).toFixed(1)}m</span>
                            </button>
                    )}
                </React.Fragment>

                {!batter.closed &&
                    <button type="button" className='button edge-type small'
                            onClick={() => batter.closed = true} disabled={!batter.points || batter.points.length < 2}>
                        SET
                    </button>
                }

                <button type="button" className='button transparent batter-delete-btn'
                        onClick={() => onPathDelete(batter)}>
                    <i className='landconnect-icon times'/>
                </button>
            </div>
        </div>
    );
};

export default BatterLine;