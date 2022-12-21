import React from 'react';
import {NavLink} from 'react-router-dom';
import PropTypes from 'prop-types';
import {companyBasePath} from '../../discovery/CompaniesCatalogue';
import classnames from 'classnames';
import {Company} from './Company';
import {clickHandler} from '~/helpers';


const CompanyTabs = ({tab, setTab, slug}) => (
    <nav className="company-nav" role="navigation">
        <NavLink exact={true}
                 to={{
                     pathname: `${Company.componentUrl.replace(':companyId', slug)}`,
                 }}>Dashboard</NavLink>

        <NavLink exact={true}
                 to={{
                     pathname: `${companyBasePath}/${slug}`,
                     state: {showTabs: true}
                 }}>Floorplan</NavLink>

        <a className={classnames(tab === 'displays' && 'active')}
           href="#"
           onClick={(e) => clickHandler(e, setTab('displays'))}>
            Displays
        </a>
    </nav>
);

CompanyTabs.propTypes = {
    tab: PropTypes.string.isRequired,
    setTab: PropTypes.func.isRequired,
    slug: PropTypes.string.isRequired,
};

export default CompanyTabs;