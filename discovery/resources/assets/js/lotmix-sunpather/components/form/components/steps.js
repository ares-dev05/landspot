import React from 'react';
import classnames from 'classnames';
import NorthIcon from '../assets/icons/NorthIcon';
import SizeIcon from '../assets/icons/SizeIcon';
import StateIcon from '../assets/icons/StateIcon';
import FloorplanIcon from '../assets/icons/FloorplanIcon';

const Steps = ({ step }) => {
  return (
    <div className="steps">
      <div className="step">
        <div className={classnames('icon-container', { active: step === 0 })}>
          <StateIcon />
        </div>
        <div className={classnames('step-number', { active: step === 0 })}>
          STEP 1
        </div>
        <div className={classnames('step-action', { active: step === 0 })}>
          Select State
        </div>
      </div>
      <div className="step-line" />
      <div className="step">
        <div className={classnames('icon-container', { active: step === 1 })}>
          <NorthIcon />
        </div>
        <div className={classnames('step-number', { active: step === 1 })}>
          STEP 2
        </div>
        <div className={classnames('step-action', { active: step === 1 })}>
          Set North
        </div>
      </div>
      <div className="step-line" />
      <div className="step">
        <div className={classnames('icon-container', { active: step === 2 })}>
          <SizeIcon />
        </div>
        <div className={classnames('step-number', { active: step === 2 })}>
          STEP 3
        </div>
        <div className={classnames('step-action', { active: step === 2 })}>
          Select Lot size
        </div>
      </div>
      <div className="step-line" />
      <div className="step">
        <div className={classnames('icon-container', { active: step === 3 })}>
          <FloorplanIcon />
        </div>
        <div className={classnames('step-number', { active: step === 3 })}>
          STEP 4
        </div>
        <div className={classnames('step-action', { active: step === 3 })}>
          Select Floorplan
        </div>
      </div>
    </div>
  );
};

export default Steps;
