import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import moment from 'moment/moment';

export function renderThumb() {
    return <div style={{
        position: 'relative',
        display: 'block',
        width: '100%',
        cursor: 'pointer',
        borderRadius: 'inherit',
        backgroundColor: '#1bea94',
    }}/>;
}

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
                <i className="fa" role="checkbox" aria-checked={checked}/>
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
    const classNames = require('classnames');
    const defaultOptions = Array.isArray(defaultOption) ? defaultOption : [defaultOption];
    return (
        <div className={classNames("select-wrapper", selectClass)}>
            <select value={value}
                    name={name}
                    id={name}
                    disabled={disabled}
                    className="select-filter"
                    onChange={onChange}>
                {
                    defaultOptions.length > 0 && defaultOptions.map(opt => <option key={opt.value}
                                                                                   disabled={opt.disabled}
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
    if (func) {
        return func.apply(this, args);
    }
}


export function LoadingSpinner({isStatic, className}) {
    const classes = ['spinner'];
    if (isStatic) classes.push('static');
    if (className) classes.push(className);
    return <div className={classnames(classes)}></div>;
}

export const ToggleButton = ({
                                 onClick,
                                 toggledOnText,
                                 toggledOffText,
                                 state,
                                 textPosition,
                                 title,
                                 disabled,
                                 buttonClass
                             }) => {
    const text = state ? toggledOnText : toggledOffText;
    return textPosition !== 'right'
        ?
        <button type='button'
                title={title}
                disabled={disabled}
                className={classnames('transparent', buttonClass)}
                onClick={e => clickHandler(e, onClick, [!state])}>
            {text}
            <i className={state ? 'fa fa-toggle-on end-icon' : 'fa fa-toggle-off end-icon'}/>
        </button>
        :
        <button type='button'
                title={title}
                disabled={disabled}
                className={classnames('transparent', buttonClass)}
                onClick={e => clickHandler(e, onClick, [!state])}>
            <i className={state ? 'fa fa-toggle-on beg-icon' : 'fa fa-toggle-off beg-icon'}/>
            {text}
        </button>;
};

ToggleButton.propTypes = {
    disabled: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    state: PropTypes.bool.isRequired,
    title: PropTypes.string,
    textPosition: PropTypes.string,
    toggledOffText: PropTypes.string.isRequired,
    toggledOnText: PropTypes.string.isRequired,
};

export function ThumbItem({
                              attrList, bgImage, bgSize, className, customContent, title, onClick, isFloat
                          }) {
    const classnames = require('classnames');
    const floatClass = isFloat === false ? null : 'col-md-4 col-sm-4 col-xs-6';
    let srcElement;
    return (
        <div ref={e => srcElement = e}
             className={classnames([floatClass, 'kaspa-thumb-item', className])}
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

export {PopupModal} from './components/popup-dialog/PopupModal';

export function formatCurrency(number) {
    if (isNaN(number) || number === null) {
        return 'N/A';
    }
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

export const alertOptions = {
    offset: '30px',
    position: 'top right',
    timeout: 5000,
    transition: 'scale',
    // containerStyle: {
    zIndex: 9999,
    top: '114px',
    // }
};

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

export function bytesToSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0 || !isFinite(bytes)) {
        return 'n/a';
    }
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    if (i === 0) {
        return `${bytes} ${sizes[i]}`;
    }
    return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`;
}

export function randomString(length) {
    return Math.random().toString(36).substr(2, length || 8);
}

export function fileNameToTitle(s) {
    return s.replace(/\.\w+$/g, '')
        .replace(/(?:\W|_)+/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .substr(0, 255);
}

export const NoMatch = () => (
    <div>
        <h3>Error 404</h3>
        <p>Hmmm, that page ({window.location.pathname}) does not exist...</p>
    </div>
);

export function formatNumber(v) {
    v = parseInt(v, 10);
    if (isNaN(v)) {
        return '';
    }
    const scales = ['', 'K', 'M', 'G', 'T', 'PB', 'E', 'Z', 'Y'];
    const magnitude = Math.floor(Math.log(v) / Math.log(1000));

    return v >= 1000 ? Math.round(v / Math.pow(1000, magnitude)) + scales[magnitude] : v;
}

export function validateEmail(email) {
    const rx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return email && rx.test(email);
}

export function ProgressBar({
                                percent = 0,
                                overlay,
                                className,
                                textComplete = 'Uploaded',
                                textAnimate = 'Converting'
                            }) {
    const [isUploaded, setIsUploaded] = React.useState(false);
    const [isAnimated, setIsAnimated] = React.useState(false);
    const [progress, setProgress] = React.useState(percent);

    const classes = ['progress'];
    classes.push(overlay ? 'overlay' : 'static');
    if (className) classes.push(className);

    const label = () => {
        if (!isUploaded) return `${percent}%`;
        if (isUploaded && !isAnimated) return textComplete;
        if (isAnimated) return textAnimate;
    };

    React.useEffect(() => {
        if(progress !== 100) setProgress(percent);
    }, [percent]);

    React.useEffect(() => {
        if (percent === 100) {
            const timer = setTimeout(() => {
                if (!isUploaded) setIsUploaded(true);
                if (isUploaded && !isAnimated) setIsAnimated(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [percent === 100, isUploaded]);

    return <div className={classnames(classes)}>
        <div className="progress-back">
            <div className={`progress-bar ${isAnimated && 'animate'}`} role="progressbar" aria-valuenow={progress}
                 aria-valuemin="0" aria-valuemax="100" style={{width: `${progress}%`}}>
                {label()}
            </div>
        </div>
    </div>;
}