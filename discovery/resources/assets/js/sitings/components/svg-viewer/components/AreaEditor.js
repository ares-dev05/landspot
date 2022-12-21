// import PropTypes from 'prop-types';
import React, {useState} from 'react';

export const ViewerContext = React.createContext();

export const FacadeItems = Object.freeze({
    name: 'Facade',
    floor: 'Ground Floor',
    garage: 'Garage',
    porch: 'Porch',
    alfresco: 'Alfresco'
});

export const OptionItems = Object.freeze({
    name: 'Name',
    option: 'Option'
});

export const AreaEditor = () => (
    <ViewerContext.Consumer>
        {
            ({options, facades, onFacadeAttributeChange, onOptionAttributeChange}) =>
                <div className='area-editor'>
                    <div className='tab-list'>
                        <label>FACADES</label>
                        <ul className='editable-list'>
                            {
                                facades.map((f, index) => {
                                        return f.visible
                                            ? <FacadeItem key={index}
                                                          tabIndex={index}
                                                          {...f}
                                                          onFacadeAttributeChange={
                                                              (e, item) => onFacadeAttributeChange(e, index, item)
                                                          }
                                            />
                                            : null
                                    }
                                )
                            }
                        </ul>
                        <label>OPTIONS</label>
                        <ul className='editable-list'>
                            {
                                options.map((o, index) => {
                                        return o.visible
                                            ? <OptionItem key={index}
                                                          tabIndex={1000 + index}
                                                          {...o}
                                                          onOptionAttributeChange={
                                                              (e, item) => onOptionAttributeChange(e, index, item)
                                                          }
                                            />
                                            : null
                                    }
                                )
                            }
                            {
                                !options.some(o => o.visible) && <li>No selected options</li>
                            }
                        </ul>
                    </div>
                </div>
        }
    </ViewerContext.Consumer>
);

const FacadeItem = ({tabIndex, onFacadeAttributeChange, ...args}) => {
    const [active, setActive] = useState(null);
    const tabIndexStart = Object.keys(FacadeItems).length + 1;
    return (
        <li tabIndex={tabIndex * tabIndexStart}
            onFocus={() => setActive('active')}
            onBlur={() => setActive(null)}
            className={active}>
            {
                Object.keys(FacadeItems).map((key, index) =>
                    <div className='landconnect-input facade'
                         data-item-type={FacadeItems[key] + ':'}
                         key={index}>
                        <input tabIndex={tabIndex * tabIndexStart + index + 1}
                               type='text'
                               value={args[key] || ''}
                               onChange={e => onFacadeAttributeChange(e, key)}
                               onFocus={() => setActive('active')}
                               onBlur={() => setActive(null)}
                        />
                    </div>
                )
            }
        </li>
    )
};

const OptionItem = ({tabIndex, onOptionAttributeChange, ...args}) => {
    const [active, setActive] = useState(null);
    const tabIndexStart = 1000 + Object.keys(OptionItems).length + 1;
    return (
        <li tabIndex={tabIndex * tabIndexStart}
            onFocus={() => setActive('active')}
            onBlur={() => setActive(null)}
            className={active}>
            {/*<div className='landconnect-input option'>
                <label>OPTION NAME</label>
                <input tabIndex={tabIndex * tabIndexStart + index + 1}
                       type='text'
                       value={name}
                       onChange={onOptionAttributeChange}
                       onFocus={() => setActive('active')}
                       onBlur={() => setActive(null)}
                />
            </div>*/}
            {
                Object.keys(OptionItems).map((key, index) =>
                    <div className='landconnect-input facade'
                         data-item-type={OptionItems[key] + ':'}
                         key={index}>
                        <input tabIndex={tabIndex * tabIndexStart + index + 1}
                               type='text'
                               value={args[key] || ''}
                               onChange={e => onOptionAttributeChange(e, key)}
                               onFocus={() => setActive('active')}
                               onBlur={() => setActive(null)}
                        />
                    </div>
                )
            }
        </li>
    )
};

// AreaEditor.contextType = ViewerContext;

export default AreaEditor;