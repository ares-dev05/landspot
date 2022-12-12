import React, { useEffect } from 'react';
import ArrowIcon from '../assets/icons/ArrowIcon';

const directions = [
  'North',
  'North-East',
  'East',
  'South-East',
  'South',
  'South-West',
  'West',
  'North-West',
];

const SetNorth = ({ state, setState }) => {
  const [angle, setAngle] = React.useState(0);

  useEffect(() => {
    const temp = directions.indexOf(state);
    setAngle(temp);
  }, []);

  const handleNorth = () => {
    let temp = directions.indexOf(state);
    temp = temp + 1;
    if (temp > directions.length - 1) {
      temp = 0;
    }
    setState(directions[temp]);
    setAngle(angle + 1);
  };



  return (
    <div className="form-actions">
      <div className="set-north">
        <div className="form-action-title">
          Set North In Relation To Your Lot Of Land
        </div>
        <div className="form-action-text">
          <div className="text-paragraph">
            Click on the arrow to adjust it’s direction.
          </div>
          <div className="text-paragraph">
            Refer to the plan of subdivision of the lot you are looking at.
          </div>
          {/*<div className="text-paragraph">*/}
          {/*Not sure how to find north?*/}
          {/*<a className="link" href="#">*/}
          {/*Click Here*/}
          {/*</a>*/}
          {/*</div>*/}
        </div>
        <div className="set-north-container">
          <div
            id="arrow-btn"
            className="set-north-btn"
            onClick={handleNorth}
            style={{ transform: `rotate(${180 - 45 * angle}deg)` }}
          >
            <div
              id="n"
              className="n"
              style={{ transform: `rotate(-${180 - 45 * angle}deg)` }}
            >
              N
            </div>
            <ArrowIcon className="arrow" />
          </div>
          <div className="plan-conntainer">
            <div className="plan-text">back</div>
            <div className="plan"></div>
            <div className="plan-text">front</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetNorth;
