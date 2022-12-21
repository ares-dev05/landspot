import React from 'react';
import {clickHandler} from '~sitings~/helpers';
import classnames from 'classnames';

export const Cards = ({className, ...props}) => (
    <div className={classnames('cards', className)}>
        <div className="cards-list">
            {
                props.children
            }
        </div>
    </div>
);

const CardImageItem = ({
                           attrList, bgImage, bgSize, className, customContent, title, onClick, href, toBlank
                       }) => {
    return (
        <a className={classnames('card', className)}
           href={href || '#'}
           target={toBlank ? '_blank' : null}
           onClick={href ? null : e => clickHandler(e, onClick)}
        >
            <div className="content">
                <div className="image"
                     style={{
                         backgroundSize: bgSize ? bgSize : 'cover',
                         backgroundImage: bgImage,
                     }}>
                </div>
                {customContent}
                {
                    (attrList || title) &&
                    <div className="title">
                        {
                            title && <div className="name">{title}</div>
                        }
                        {
                            attrList && <ul className="item-options">
                                {attrList}
                            </ul>
                        }
                    </div>
                }
            </div>
        </a>
    );
};

export default CardImageItem;
