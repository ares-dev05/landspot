import React from 'react';
import classnames from 'classnames';
import moment from 'moment';

export function clickHandler(e, func, args) {
    e.preventDefault();
    e.stopPropagation();
    if(func) return func.apply(this, args);
}

export function LoadingSpinner({isStatic, isOverlay}) {
    const style = getComputedStyle(document.body);
    const mainColor = style.getPropertyValue('--main-color') || '#3D40C6';
    const spinner = `data:image/svg+xml;charset=UTF-8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 109.36 109.83'><defs><style>.cls-1{fill:${mainColor};}</style></defs><title>Asset 5</title><g id='Layer_2' data-name='Layer 2'><g id='Isolation_Mode' data-name='Isolation Mode'><path class='cls-1' d='M108.58,0H.78A.74.74,0,0,0,0,.78V109a.74.74,0,0,0,.78.78h107.8a.74.74,0,0,0,.78-.78V.78A.74.74,0,0,0,108.58,0ZM8.67,8.67h7.64L8.67,16.31Zm0,22,22-22h2.4L8.67,33.06Zm0,14.08L44.74,8.67h4.8L8.67,49.54Zm0,14.08L58.82,8.67H66L8.67,66Zm0,14.08L72.9,8.67h9.6L8.67,82.51ZM8.67,87,87,8.67H99L8.67,99Zm92,13.71H93.05L100.69,93Zm0-22.13L78.57,100.69h-2.4l24.53-24.53Zm0-14.08L64.49,100.69h-4.8l41-41Zm0-14.08L50.41,100.69H43.2L100.69,43.2Zm0-14.08L36.33,100.69h-9.6l74-74Zm0-14.08L22.25,100.69h-12l90.45-90.45Z'/></g></g></svg>`;
    return <div className={classnames('spinner', isStatic && 'static', isOverlay && 'overlay')}>
        {/*<img src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDkuMzYgMTA5LjgzIj48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6IzNENDBDNjt9PC9zdHlsZT48L2RlZnM+PHRpdGxlPkFzc2V0IDU8L3RpdGxlPjxnIGlkPSJMYXllcl8yIiBkYXRhLW5hbWU9IkxheWVyIDIiPjxnIGlkPSJJc29sYXRpb25fTW9kZSIgZGF0YS1uYW1lPSJJc29sYXRpb24gTW9kZSI+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMTA4LjU4LDBILjc4QS43NC43NCwwLDAsMCwwLC43OFYxMDlhLjc0Ljc0LDAsMCwwLC43OC43OGgxMDcuOGEuNzQuNzQsMCwwLDAsLjc4LS43OFYuNzhBLjc0Ljc0LDAsMCwwLDEwOC41OCwwWk04LjY3LDguNjdoNy42NEw4LjY3LDE2LjMxWm0wLDIyLDIyLTIyaDIuNEw4LjY3LDMzLjA2Wm0wLDE0LjA4TDQ0Ljc0LDguNjdoNC44TDguNjcsNDkuNTRabTAsMTQuMDhMNTguODIsOC42N0g2Nkw4LjY3LDY2Wm0wLDE0LjA4TDcyLjksOC42N2g5LjZMOC42Nyw4Mi41MVpNOC42Nyw4Nyw4Nyw4LjY3SDk5TDguNjcsOTlabTkyLDEzLjcxSDkzLjA1TDEwMC42OSw5M1ptMC0yMi4xM0w3OC41NywxMDAuNjloLTIuNGwyNC41My0yNC41M1ptMC0xNC4wOEw2NC40OSwxMDAuNjloLTQuOGw0MS00MVptMC0xNC4wOEw1MC40MSwxMDAuNjlINDMuMkwxMDAuNjksNDMuMlptMC0xNC4wOEwzNi4zMywxMDAuNjloLTkuNmw3NC03NFptMC0xNC4wOEwyMi4yNSwxMDAuNjloLTEybDkwLjQ1LTkwLjQ1WiIvPjwvZz48L2c+PC9zdmc+'/>*/}
        <img src={spinner}/>
    </div>;
}

export function validateEmail(email) {
  const tester = /^[-!#$%&'*+/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-?\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

  if (!email)
    return false;

  if(email.length>254)
    return false;

  let valid = tester.test(email);
  if(!valid)
    return false;

  // Further checking of some things regex can't handle
  let parts = email.split("@");
  if(parts[0].length>64)
    return false;

  let domainParts = parts[1].split(".");
  if(domainParts.some(function(part) { return part.length>63; }))
    return false;

  return true;
}

export function ThumbItem({
                              attrList, bgImage, bgSize, className, customContent, title, onClick, isFloat
                          }) {
    const floatClass = isFloat === false ? null : 'col-md-4';
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

export const AlertTemplate = ({ message, options, style, close }) => {
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
    transition: 'scale'
};

export function isGlobalAdmin(user) {
    if (!user) return false;
    if (user.group) {
        return user.group.some(group => group.name === "Global Admins");
    }
    return false;
}
