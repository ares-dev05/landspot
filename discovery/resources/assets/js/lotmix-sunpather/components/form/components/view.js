import React, { useState, useRef, useEffect } from 'react';
import classnames from 'classnames';
import A from 'meeusjs';
import App from '../../../webgl-engine/js/app/app';
import Plan from './plan';
import Preloader from './preloader';
import SummerIcon from '../assets/icons/SummerIcon';
import WinterIcon from '../assets/icons/WinterIcon';
import RainIcon from '../assets/icons/RainIcon';
import FlowerIcon from '../assets/icons/FlowerIcon';
import MirrorIcon from '../assets/icons/MirrorIcon';
import CancelIcon from '../assets/icons/CancelIcon';


const stateCoordinates = {
  victoria: {
    LAT: -37.8136,
    LONG: 144.9631,
    timeZone: 'Melbourne',
  },
  queensland: {
    LAT: -27.170153,
    LONG: 152.962478,
    timeZone: 'Brisbane',
  },
  'new-south-wales': {
    LAT: -33.71218,
    LONG: 150.95753,
    timeZone: 'Sydney',
  },
  'western-australia': {
    LAT: -31.63003,
    LONG: 115.689781,
    timeZone: 'Perth',
  },
  'south-australia': {
    LAT: -34.928497,
    LONG: 138.600739,
    timeZone: 'Adelaide',
  },
  tasmania: {
    LAT: -42.84668,
    LONG: 147.2953,
    timeZone: 'Hobart',
  },
  'northern-australia': {
    LAT: -12.46232,
    LONG: 130.84094,
    timeZone: 'Darwin',
  },
};

const getSunInfo = (coord, month) => {
  const jdo = new A.JulianDay(new Date(2018, month));
  const times = A.Solar.times(jdo, coord);

  let sunriseInfo = new Date(0);
  sunriseInfo.setUTCFullYear(2018);
  if (month !== 0) sunriseInfo.setUTCMonth(month);
  sunriseInfo.setUTCSeconds(times.rise);

  let sunsetInfo = new Date(0);
  sunsetInfo.setUTCFullYear(2018);
  if (month !== 0) sunsetInfo.setUTCMonth(month);
  sunsetInfo.setUTCSeconds(times.set);

  return { sunriseInfo, sunsetInfo };
};

const View = ({ isPlay, state, direction, lot }) => {
  const viewerRef = useRef();
  const WebGl = useRef();
  const [view, setView] = useState('isometric');
  const [season, setSeason] = useState('summer');
  const [toggle, setToggle] = useState(false);
  const [isUploaded, setUploaded] = useState(false);
  const [time, setTime] = useState(false);
  const [interv, setInterv] = useState(false);
  const [mirror, setMirror] = useState(false);
  const [show, setShow] = useState(false);
  const [dot, setDot] = useState('dot1');

  useEffect(() => {
    WebGl.current = new App(viewerRef.current, {
      setUploaded,
      direction,
      lot,
    });
  }, []);

  useEffect(() => {
    const coord = A.EclCoord.fromWgs84(
      stateCoordinates[state].LAT,
      stateCoordinates[state].LONG,
      100,
    );
    let month;
    if (season === 'summer') {
      month = 0;
    } else if (season === 'winter') {
      month = 6;
    } else if (season === 'spring') {
      month = 9;
    } else if (season === 'autumn') {
      month = 3;
    }

    const { sunsetInfo, sunriseInfo } = getSunInfo(coord, month);

    const sunriseData = new Date(
      sunriseInfo.toLocaleString('en-US', {
        timeZone: 'Australia/' + stateCoordinates[state].timeZone,
      }),
    );

    const sunriseHour =
      sunriseData.getHours() < 10
        ? '0' + sunriseData.getHours()
        : sunriseData.getHours();
    const sunriseMinute =
      sunriseData.getMinutes() < 10
        ? '0' + sunriseData.getMinutes()
        : sunriseData.getMinutes();

    const sunrise = sunriseHour + ':' + sunriseMinute;

    const sunsetData = new Date(
      sunsetInfo.toLocaleString('en-US', {
        timeZone: 'Australia/' + stateCoordinates[state].timeZone,
      }),
    );
    const sunsetHour =
      sunsetData.getHours() < 10
        ? '0' + sunsetData.getHours()
        : sunsetData.getHours();
    const sunsetMinute =
      sunsetData.getMinutes() < 10
        ? '0' + sunsetData.getMinutes()
        : sunsetData.getMinutes();

    const sunset = sunsetHour + ':' + sunsetMinute;

    setTime('10:00');

    const startHours = Number(sunrise.split(':')[0]);
    const startMinutes = Number(sunrise.split(':')[1]);
    const sunriseMinutes = startHours * 60 + startMinutes;
    const sunsetMinutes =
      Number(sunset.split(':')[0]) * 60 + Number(sunset.split(':')[1]);
    const difference = sunsetMinutes - sunriseMinutes;

    const currentStep = 600 - sunriseMinutes;

    const coeff = currentStep * (3.18 / difference);
    window.coeff = coeff;

    if (isPlay) {
      if (interv) {
        clearInterval(interv);
      }

      const startHours = Number(sunrise.split(':')[0]);
      const startMinutes = Number(sunrise.split(':')[1]);

      const sunriseMinutes = startHours * 60 + startMinutes;
      const sunsetMinutes =
        Number(sunset.split(':')[0]) * 60 + Number(sunset.split(':')[1]);
      const difference = sunsetMinutes - sunriseMinutes;

      const interval = setInterval(() => {
        setTime(time => {
          let hours = Number(time.split(':')[0]);
          let minutes = Number(time.split(':')[1]) + 1;

          if (minutes > 59) {
            minutes = 0;
            hours++;
          }
          if (hours * 60 + minutes > sunsetMinutes) {
            hours = startHours;
            minutes = startMinutes;
          }

          const currentTime = hours * 60 + minutes;
          const currentStep = currentTime - sunriseMinutes;

          if (currentStep < difference && currentTime > sunriseMinutes) {
            const coeff = currentStep * (3.18 / difference);
            window.coeff = coeff;
          }

          if (hours < 10) hours = '0' + hours;
          if (minutes < 10) minutes = '0' + minutes;

          return hours + ':' + minutes;
        });
      }, 50);
      setInterv(interval);
    } else {
      clearInterval(interv);
    }

    return () => {
      clearInterval(interv);
    };
  }, [season, isPlay]);

  useEffect(() => {
    WebGl.current.changeView(view, dot);
  }, [view, dot]);

  useEffect(() => {
    WebGl.current.resize();
  }, [show]);

  const handleTabs = () => {
    if (view === 'isometric') {
      setView('interior');
    } else {
      setView('isometric');
    }
  };
  const handleSeason = ({ target }) => {
    if (target.id) {
      setSeason(target.id);
    }
  };
  const handleToggle = () => {
    setToggle(!toggle);
  };
  const handleMirror = () => {
    WebGl.current.revertHouse();
    setMirror(!mirror);
  };
  const handleShowModel = () => {
    setShow(true);
  };
  const handleCloseModel = () => {
    setShow(false);
  };

  return (
    <div className={classnames('view', { 'hide-view': !isUploaded })}>
      <div className={classnames('sidebar', { 'hide-sidebar': show === true })}>
        <div className="tabs" onClick={handleTabs}>
          <div
            className={classnames('toggle', {
              'isometric-text': view === 'isometric',
            })}
          >
            Isometric
          </div>
          <div
            className={classnames('toggle', {
              'interior-text': view === 'interior',
            })}
          >
            Interior
          </div>
          <div
            className={classnames('selected-view', {
              'active-interior': view === 'interior',
            })}
          />
        </div>
        <div className={classnames('seasons', { open: toggle === true })}>
          <div className="seasons-title" onClick={handleToggle}>
            Change season:
          </div>
          <div className="seasons-icons-container">
            <div
              className={classnames('seasons-icon-wrapper', {
                'active-season': season === 'summer',
              })}
            >
              <SummerIcon />
              <div className="season-label">summer</div>
              <div
                onClick={handleSeason}
                id="summer"
                className="season-touch"
              />
            </div>
            <div
              className={classnames('seasons-icon-wrapper', {
                'active-season': season === 'winter',
              })}
            >
              <WinterIcon />
              <div className="season-label">winter</div>
              <div
                onClick={handleSeason}
                id="winter"
                className="season-touch"
              />
            </div>
            <div
              className={classnames('seasons-icon-wrapper', {
                'active-season': season === 'autumn',
              })}
            >
              <RainIcon />
              <div className="season-label">autumn</div>
              <div
                onClick={handleSeason}
                id="autumn"
                className="season-touch"
              />
            </div>
            <div
              className={classnames('seasons-icon-wrapper', {
                'active-season': season === 'spring',
              })}
            >
              <FlowerIcon />
              <div className="season-label">spring</div>
              <div
                onClick={handleSeason}
                id="spring"
                className="season-touch"
              />
            </div>
          </div>
        </div>
        {view === 'interior' && <Plan dot={dot} setDot={setDot} />}
        <div className="show-model-btn" onClick={handleShowModel}>
          Show model
        </div>
      </div>
      <div
        ref={viewerRef}
        className={classnames('webGL', {
          'show-webGL': show === true,
        })}
      >
        <div className="close-webGL" onClick={handleCloseModel}>
          <CancelIcon />
        </div>
        <div className="mirror-btn"
             onClick={handleMirror}
        >
          <MirrorIcon
            className={classnames('mirror-icon', {
              'active-mirror': mirror === true,
            })}
          />
        </div>
        <div className="time">
          <div className="time-wrapper">
            <div className="time-item time-container">
              {time[0]}
              <div className="time-shadow"></div>
            </div>
            <div className="time-item time-container">
              {time[1]}
              <div className="time-shadow"></div>
            </div>
            <div className="time-item time-delimiter">{time[2]}</div>
            <div className="time-item time-container">
              {time[3]}
              <div className="time-shadow"></div>
            </div>
            <div className="time-item time-container">
              {time[4]}
              <div className="time-shadow"></div>
            </div>
          </div>
          <div className="season-name">
            {season.charAt(0).toUpperCase() + season.slice(1)}
          </div>
        </div>
      </div>
      <Preloader isUploaded={isUploaded} />
    </div>
  );
};

export default View;
