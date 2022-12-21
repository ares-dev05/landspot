import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import Media from 'react-media';
import {isEmpty} from 'lodash';

const SHOW_MORE_COUNT = 9;

const LandEstatesFilter = ({
                               state,
                               suburbs = [],
                               selectedSuburb, setSelectedSuburb,
                               setEstateSearch,
                               children
                           }) => {
    const [showMore, setShowMore] = useState(false);
    const [suburbList] = useState(Object.keys(suburbs));

    const shownSuburbs = showMore ? suburbList : suburbList.slice(0, SHOW_MORE_COUNT);

    const SuburbsList = () => (
        <div className="suburb-list">
            {shownSuburbs.map((suburbSlug, suburbIndex) => (
                <label key={suburbIndex}>
                    <input type="checkbox"
                           value={suburbSlug}
                           checked={selectedSuburb === suburbSlug}
                           onChange={e => setSelectedSuburb(e.target.checked ? e.target.value : '')}
                    />
                    <span>
                        {suburbs[suburbSlug]}
                    </span>
                </label>
            ))}

            {suburbList.length > SHOW_MORE_COUNT &&
            <a href="#" className="show-more" onClick={() => setShowMore(!showMore)}>
                {showMore ? 'SHOW LESS' : 'SHOW MORE'}
            </a>
            }
        </div>
    );

    return (
        <Fragment>
            <h1 className="header">
                Land For Sale
                {state &&
                <span style={{textTransform: 'capitalize'}}>
                        {`In ${!selectedSuburb ? (!isEmpty(state) ? state.name : '') : suburbs[selectedSuburb]}`}
                    </span>
                }
            </h1>
            <Media query="(max-width: 760px)">
                {children}
            </Media>
            <div className="filter">
                <div className="landspot-input">
                    <input type="text"
                           placeholder="Search Land Estates"
                           onChange={e => setEstateSearch(e.target.value)}
                    />
                </div>

                <div className="suburbs-search">
                    Search Suburb:
                    <SuburbsList/>
                </div>
            </div>
        </Fragment>
    );
};

export default LandEstatesFilter;

LandEstatesFilter.propTypes = {
    state: PropTypes.object.isRequired,
    suburbs: PropTypes.object.isRequired,
    setEstateSearch: PropTypes.func.isRequired,
    selectedSuburb: PropTypes.string,
    setSelectedSuburb: PropTypes.func.isRequired
};