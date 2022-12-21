import React from 'react';
import classnames from 'classnames';

const Footer = React.memo(
  ({ step, prevStep, nextStep, isPlay, setPlay, showTooltip }) => {
    const backBtnClick = () => {
      if (step === 4) {
        setPlay(false);
      }
      prevStep();
    };

    return (
      <div
        className={classnames('footer', { 'solo-btn': step === 0 || step > 4 })}
      >
        {step > 0 && step < 5 && (
          <button className="footer-btn" onClick={backBtnClick}>
            Back
          </button>
        )}
        {step < 4 ? (
          <button className="footer-btn" onClick={nextStep}>
            Next
            <div
              className={classnames('tooltip', {
                'show-tooltip': showTooltip(),
              })}
            >
              Click to move forward
            </div>
          </button>
        ) : (
          <button
            onClick={() => setPlay(state => !state)}
            className="footer-btn"
          >
            {!isPlay ? 'Play' : 'Stop'}
            <div
              className={classnames('tooltip last-tooltip', {
                'show-tooltip': !isPlay,
              })}
            >
              To animate sunpath click here
            </div>
          </button>
        )}
      </div>
    );
  },
);

export default Footer;
