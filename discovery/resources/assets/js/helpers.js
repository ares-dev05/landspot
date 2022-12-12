import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import moment from 'moment';
import {NavLink} from 'react-router-dom';

export function getImageForMedia(mediumURL, largeURL, asURL) {
    const isRetina = () => {
        return ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx), only screen and (min-resolution: 75.6dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min--moz-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2)').matches)) || (window.devicePixelRatio && window.devicePixelRatio >= 2)) && /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
    };

    if (isRetina()) {
        return asURL ? largeURL : `url('${largeURL}')`;
    } else {
        return asURL ? mediumURL : `url('${mediumURL}')`;
    }
}

export function HouseOptions({beds, cars, bathrooms}) {
    const item = (icon, text) => (
        <li>
            <i className={`landspot-icon ${icon}`} aria-hidden="true"/>
            <span style={{marginLeft: '7px'}}>{text}</span>
        </li>
    );
    return (
        <React.Fragment>
            {beds > 0 && item('bedroom', beds)}
            {bathrooms > 0 && item('bathroom', bathrooms)}
            {cars > 0 && item('car-park', cars)}
        </React.Fragment>
    );
}

// export function renderThumb() {
//     return <div style={{
//         position: 'relative',
//         display: 'block',
//         width: '100%',
//         cursor: 'pointer',
//         borderRadius: 'inherit',
//         backgroundColor: '#1bea94',
//     }}/>
// }

export function NiceCheckbox({checked, checkboxClass, label, name, onChange, defaultValue, disabled}) {
    return (
        <div className={checkboxClass}>
            <input className="nice-checkbox"
                   id={name}
                   name={name}
                   type="checkbox"
                   checked={checked}
                   disabled={disabled}
                   defaultValue={defaultValue}
                   onChange={onChange ? onChange : () => {
                   }}/>
            <label htmlFor={name}>
                <i className="fa" role="checkbox"/>
                <span>{label}</span>
            </label>
        </div>
    );
}

/**
 *
 * @param value
 * @param onChange
 * @param single option|array defaultOption
 * @param renderOptions
 * @param selectClass
 * @param name
 * @returns {*}
 * @constructor
 */
export function NiceSelect({value, onChange, defaultOption, disabled, renderOptions, selectClass, name}) {
    const defaultOptions = Array.isArray(defaultOption) ? defaultOption : [defaultOption];
    return (
        <div className={classnames('select-wrapper', selectClass)}>
            <select value={value}
                    name={name}
                    id={name}
                    disabled={disabled}
                    className="select-filter"
                    onChange={onChange}>
                {
                    defaultOptions.length > 0 && defaultOptions.map(opt => <option key={opt.value}
                                                                                   value={opt.value}>{opt.title}</option>)
                }
                {renderOptions()}
            </select>
        </div>
    );
}

export function clickHandler(e, func, args) {
    e.preventDefault();
    e.stopPropagation();
    if (func) return func.apply(this, args);
}

export const alertOptions = {
    offset: '30px',
    position: 'top right',
    timeout: 5000,
    transition: 'scale',
    zIndex: 99999
};

export const AlertTemplate = ({message, options, style, close}) => {
    const icons = {
        info: 'fa-info-circle',
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
    };

    return (
        <div className='alert-container' style={style}>
            <i className={classnames('fa', icons[options.type])}
               aria-hidden="true"/>

            <div className="alert-popup">{message}</div>

            <button onClick={close}>
                <i className="fa fa-times-circle" aria-hidden="true"/>
            </button>
        </div>
    );
};

export function LoadingSpinner({isStatic, className}) {
    const classes = ['spinner'];
    if (isStatic) classes.push('static');
    if (className) classes.push(className);
    return <div className={classnames(classes)}></div>;
}

export function CloseDiscoveryLink() {
    return <a className="close-discovery fa fa-times-circle" href="#"
              onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  window.parent.postMessage('closeDiscovery', '*');
              }}/>;
}

export function validateEmail(email) {
    const rx = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return email && rx.test(email);
}

export function validateEmailStrict(email) {
    const rx = /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i;
    return email && rx.test(email);
}

export function ToggleButton({onClick, toggledOnText, toggledOffText, state, textPosition, disabled, title}) {
    const text = state ? toggledOnText : toggledOffText;
    return textPosition !== 'right' ?
        <button type="button"
                title={title || ''}
                disabled={disabled}
                className="button transparent"
                onClick={
                    e => clickHandler(e, onClick)
                }>{text}<i className={state ? 'fa fa-toggle-on end-icon' : 'fa fa-toggle-off end-icon'}/>
        </button> :
        <button type="button"
                title={title || ''}
                disabled={disabled}
                className="button transparent"
                onClick={
                    e => clickHandler(e, onClick)
                }><i className={state ? 'fa fa-toggle-on beg-icon' : 'fa fa-toggle-off beg-icon'}/>{text}
        </button>;
}

export function ToggleSwitch({onClick, text, label, state, disabled, labelPosition}) {
    const labelText = state ? text.on : text.off;
    return (
        <button type="button"
                disabled={disabled}
                className={classnames('toggle-switch', labelPosition)}
                onClick={e => clickHandler(e, onClick)}>
            {
                labelPosition === 'left' && labelText
            }
            <i className={state ? 'on' : 'off'} data-label={state ? label.on : label.off}/>
            {
                labelPosition === 'right' && labelText
            }
        </button>
    );
}

ToggleSwitch.propTypes = {
    onClick: PropTypes.func.isRequired,
    text: PropTypes.object.isRequired,
    label: PropTypes.object.isRequired,
    labelPosition: PropTypes.oneOf(['left', 'right']),
};

export function ThumbItem({
                              attrList, bgImage, bgSize, className, customContent, title, onClick, isFloat
                          }) {
    const floatClass = isFloat === false ? null : 'col-md-4';
    let srcElement;
    return (
        <div ref={e => srcElement = e}
             className={classnames([floatClass, 'landspot-thumb-item', className])}
             onClick={e => clickHandler(e, onClick, [srcElement])}>
            <div className="catalog-img"
                 style={{
                     background: 'center center rgb(244, 243, 243)',
                     backgroundSize: bgSize ? bgSize : 'cover',
                     backgroundImage: bgImage,
                 }}>
                {customContent}
                {
                    title !== false &&
                    <div className="title">{title}
                        {
                            attrList && <ul className="item-options">{attrList()}</ul>
                        }
                    </div>
                }
            </div>
        </div>
    );
}

export function formatCurrency(number) {
    if (isNaN(number) || number === null) return 'N/A';
    const opts = {
        localeMatcher: 'best fit',
        style: 'currency',
        currency: 'USD',
        useGrouping: true,
        minimumFractionDigits: 0
    };

    const nf = new Intl.NumberFormat(['en-US'], opts);
    return nf.format(number);
}

export function formatNumber(v) {
    v = parseInt(v, 10);
    if (isNaN(v)) {
        return '';
    }
    const scales = ['', 'K', 'M', 'G', 'T', 'PB', 'E', 'Z', 'Y'];
    const magnitude = Math.floor(Math.log(v) / Math.log(1000));

    return v >= 1000 ? Math.round(v / Math.pow(1000, magnitude)) + scales[magnitude] : v;
}

export const PathNavLink = ({urlArgs = {}, to, children, ...props}) => {
    delete props.matches;
    const newTo = Object.keys(urlArgs).reduce((acc, key) => acc.replace(':' + key, urlArgs[key]), to);
    return <NavLink exact to={newTo} {...props}>{children}</NavLink>
};

PathNavLink.propTypes = {
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired
};

/*
function isHighDensity() {
    return ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 124dpi), only screen and (min-resolution: 1.3dppx), only screen and (min-resolution: 48.8dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (min-device-pixel-ratio: 1.3)').matches)) || (window.devicePixelRatio && window.devicePixelRatio > 1.3))
}
*/

export function dateFormat(unixtime) {
    const msgDate = new Date();
    msgDate.setTime(unixtime * 1000);
    const isSame = msgDate.getFullYear() === new Date().getFullYear();
    const momentDate = moment.unix(unixtime);
    const format = {
        sameDay: 'h:mm A',
        lastDay: '[Yesterday], h:mm A',
        lastWeek: 'MMM D, h:mm A',
        sameElse: 'MMM D, h:mm A'
    };
    return isSame ? momentDate.calendar(null, format) : momentDate.format('MMM D, YYYY h:mm A');
}

export function getCSRFToken() {
    const meta = document.head.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
}

export const NoMatch = (offset) => (
    <div style={offset && {padding: '100px'}}>
        <h3>Error 404</h3>
        <p>Hmmm, that page ({window.location.pathname}) does not exist...</p>
    </div>
);

export function errorExtractor(action) {
    const {data} = action.payload.error.response;
    let errors = data.errors || [data.message];
    errors = Array.isArray(errors) ? errors : Object.values(errors).flat();
    return errors;
}

// the Haversine formula
export function getDistance(p1, p2) {
    function rad(x) {
        return x * Math.PI / 180;
    }

    const R = 6378137; // Earth’s mean radius in meter
    const dLat = rad(p2.lat - p1.lat);
    const dLong = rad(p2.lng - p1.lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const meters = R * c;
    const km = meters / 1000;
    return km.toFixed(1) + ' km'; // returns the distance in meter
}

export const changeTitleAfterPipe = (title) => {
    if (document.title !== title) {
        const newTitle = document.title.replace(/\|(.*)$/, `| ${title}`);
        document.title = newTitle;
        document.head.querySelector('meta[property="og:title"]').content = newTitle;
    }
};