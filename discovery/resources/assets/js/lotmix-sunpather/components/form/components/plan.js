import React, { useState } from 'react';
import classnames from 'classnames';
import planIcon from '../assets/backgroun.png';

const Plan = ({ dot, setDot }) => {
  const [toggle, setToggle] = useState(false);

  const handleToggle = () => {
    setToggle(!toggle);
  };
  const handleDot = ({ target }) => {
    if (target.id) {
      setDot(target.id);
    }
  };

  return (
    <div className={classnames('plan', { open: toggle === true })}>
      <div className="plans-title" onClick={handleToggle}>
        Change view location:
      </div>
      <div className="plan-container">
        <div className="plan-text">
          Click on the red dot — that is where you are on the model.
        </div>
        <div className="plan-wrapper">
          <img className="plan-icon" src={planIcon} alt="planIcon" />
          <div
            id="dot1"
            className={classnames('dot', { active: dot === 'dot1' })}
            onClick={handleDot}
          />
          <div
            id="dot2"
            className={classnames('dot', { active: dot === 'dot2' })}
            onClick={handleDot}
          />
          <div
            id="dot3"
            className={classnames('dot', { active: dot === 'dot3' })}
            onClick={handleDot}
          />
          <div
            id="dot4"
            className={classnames('dot', { active: dot === 'dot4' })}
            onClick={handleDot}
          />
          <div
            id="dot5"
            className={classnames('dot', { active: dot === 'dot5' })}
            onClick={handleDot}
          />
          <div
            id="dot6"
            className={classnames('dot', { active: dot === 'dot6' })}
            onClick={handleDot}
          />
        </div>
      </div>
    </div>
  );
};

export default Plan;
