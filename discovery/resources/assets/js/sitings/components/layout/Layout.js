import React from 'react';
// import Navigation from './Navigation';

const Layout = (props) => (
    <React.Fragment>
        {/*<Navigation/>*/}
        {props.children}
    </React.Fragment>
);

export default Layout;