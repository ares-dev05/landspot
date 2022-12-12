import React from 'react';
import {clickHandler} from '~/helpers';
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
                           toBlank, onClick, className, href, asBlock = false, ...props
                       }) => {
    return (
        asBlock
            ? <div className={classnames('card', className)}
                   onClick={href ? null : e => clickHandler(e, onClick)}>
                <CardContent {...props}/>
            </div>
            : <a className={classnames('card', className)}
                 href={href || '#'}
                 target={toBlank ? '_blank' : null}
                 onClick={href ? null : e => clickHandler(e, onClick)}
            >
                <CardContent {...props}/>
            </a>
    );
};

const CardContent = ({attrList, bgImage, bgSize, customContent, title, bgDefaultImage, secondaryBg, footerButton}) => (
    <div className="content">
        {
            secondaryBg ?
                <div className={'image' + (bgDefaultImage && !bgImage ? ' image-card-default' : '')}>
                    <div className={'image-in'}
                         style={{
                             zIndex: 1,
                             backgroundSize: bgSize ? bgSize : 'cover',
                             backgroundImage: bgImage,
                         }}>
                    </div>
                    <div className={'image-in'}
                         style={{
                             zIndex: 0,
                             background: secondaryBg,
                             backgroundSize: 'cover'
                         }}>
                    </div>
                </div>
                :
                <div className={'image' + (bgDefaultImage && !bgImage ? ' image-card-default' : '')}
                     style={{
                         backgroundSize: bgSize ? bgSize : 'cover',
                         backgroundImage: bgImage,
                     }}>
                </div>
        }

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
        {footerButton &&
        <div className="footer-button">
            {footerButton}
        </div>}
    </div>
);

export default CardImageItem;
