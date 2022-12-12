import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {clickHandler} from '~/helpers';

const MenuList = ({
                      title,
                      items,
                      placement = 'bottom',
                      clickable = false,
                      className = ''
                  }) => {
    return (
        <div className={`menu-list ${className} ${clickable ? 'show' : 'hover'}`}>
            {
                title &&
                <div className="menu-title">
                    <i className='landspot-icon list'/>
                    {title}
                    <i className='landspot-icon angle-down end-icon'/>
                </div>
            }
            <ul className={classnames('dropdown', placement)}>
                {
                    items.map(
                        ({text, handler, hidden, html}, i) =>
                            !hidden && <React.Fragment key={i}>
                                {
                                    !html
                                        ? <li onClick={e => clickHandler(e, handler)}
                                              dangerouslySetInnerHTML={{__html: text}}
                                        />
                                        : html
                                }
                            </React.Fragment>
                    )
                }
            </ul>
        </div>
    );
};

MenuList.propTypes = {
    items: PropTypes.array.isRequired,
    placement: PropTypes.oneOf(['bottom', 'right']),
    title: PropTypes.string,
};

export default MenuList;