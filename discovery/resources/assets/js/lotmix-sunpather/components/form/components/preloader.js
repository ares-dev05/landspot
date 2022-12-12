import React, { useState, useEffect } from 'react';
import classnames from 'classnames';

const Preloader = ({ isUploaded }) => {
  const [percent, setPercent] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setPercent(p => {
        if (p < 99) return p + 1;
        else return p;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={classnames('loading-container', { uploaded: isUploaded })}>
      <div className="loading">
        <div className="percent">
          {isUploaded ? 100 : <React.Fragment>{percent}</React.Fragment>}
          <span>%</span>
        </div>
        <div className="loading-bar">
          <div
            style={{ transform: `scaleX(${isUploaded ? 1 : percent * 0.01})` }}
            className="progress-bar"
          />
        </div>
        <div className="loading-text">Loading...</div>
      </div>
    </div>
  );
};

export default Preloader;
