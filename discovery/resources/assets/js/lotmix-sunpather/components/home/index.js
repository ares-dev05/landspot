import React from 'react';
import { Link } from 'react-router-dom';
import OrbitIcon from './assets/icons/OrbitIcon';

const Home = () => {
  return (
    <div className="homepage">
      <div className="container">
        <div className="title">Welcome to Sunpather</div>
        <div className="secondary-text">
          Sunpather will help you visual the sun path over a particular lot of
          land.
        </div>
        <div className="interior-bg">
          <OrbitIcon className="orbit" />
        </div>
        <div className="light-text">
          Simlpy follow the steps below to test. This tool provides an
          indicative result only and with sample plans. It should be used as an
          approximate guide only.
        </div>
        <Link to="/sunpather/form/">
          <div className="green-btn">Get started</div>
        </Link>
      </div>
    </div>
  );
};

export default Home;
