import React from 'react';
import Subscription from "./Subscription";

const Layout = (props) => (
    <React.Fragment>
        {props.children}

        <Subscription/>
    </React.Fragment>
);

export default Layout;