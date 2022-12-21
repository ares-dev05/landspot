import React from 'react';
import classnames from 'classnames';
import SelectedIcon from '../assets/icons/SelectedIcon';


const SelectLot = ({ state, setState }) => {
  const handleLot = ({ target }) => {
    if (target.id) {
      setState(target.id);
    }
  };

  return (
    <div className="form-actions">
      <div className="select-lot">
        <div className="form-action-title">Select Approximate Lot Size </div>
        <div className="available-lots">
          <div
            onClick={handleLot}
            id="small"
            className={classnames('lot small', { active: state === 'small' })}
          >
            <SelectedIcon className="selected" />
            350m
            <sup>2</sup>
          </div>
          <div
            onClick={handleLot}
            id="medium"
            className={classnames('lot medium', { active: state === 'medium' })}
          >
            <SelectedIcon className="selected" />
            448m
            <sup>2</sup>
          </div>
          <div
            onClick={handleLot}
            id="large"
            className={classnames('lot large', { active: state === 'large' })}
          >
            <SelectedIcon className="selected" />
            512m
            <sup>2</sup>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectLot;
