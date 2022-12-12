import React from 'react';
import classnames from 'classnames';
import floorplanIcon from '../assets/backgroun.png';

const SelectFloorplan = ({ state, setState }) => {
  const handleFloorplan = ({ target }) => {
    if (target.id) {
      setState(target.id);
    }
  };

  return (
    <div className="form-actions">
      <div className="select-floorplan">
        <div className="form-action-title">Select Floorplan</div>
        <div className="available-floorplans">
          <div className="floorplan-lot">
            <div
              className={classnames('floorplan-title', {
                'active-plan': state === '0',
              })}
            >
              4 Bedroom - Single Storey
            </div>
            <div className="icon-wrapper">
              <img
                className="floorplan-icon"
                onClick={handleFloorplan}
                id="0"
                src={floorplanIcon}
                alt="floorplanIcon"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectFloorplan;
