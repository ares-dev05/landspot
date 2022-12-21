import React, {useState} from 'react';
import {LeftPanel, RightPanel} from '~/helpers/Panels';
import classnames from 'classnames';
import {connect} from 'react-redux';
import * as actions from '../store/kaspaEngine/actions';
import ContentSectionComponent from '../layouts/ContentSectionComponent';
import {NiceCheckbox} from '~/helpers';
import Input from '~/helpers/Input';
import {NiceRadio} from '~/helpers/NiceRadio';

//region Mocking Data

const tabList = ['Victoria', 'North', 'Zone1', 'Zone2'];
const navList = ['Piers', 'Site Works', 'Earth Works', 'Slab', 'Package Costs', 'Retaining Walls', 'OH&S', 'Promotions', 'Other'];
const piersParameters = {
    'APPLY PIERS': {
        'When fill is greater than': 0,
        'When site fall is greater than': 0,
        'When a floorplan is parrallel to an easement and closer than': 0,
        'If there is no compaction report, apply piers to the entire dwelling': [
            {label: 'Yes', value: true},
            {label: 'No', value: false},
            {label: 'Do not package', value: false},
        ]
    },
    'PIER DETAILS': {
        'Our standard pier radius is': 0,
        'Pier depth is calculated by': {type: 'Fill', value: 0},
    },
    'PIER DISTRIBUTION': {
        'Piers should be distrbuted every': 0,
    },
    'DISTANCE FROM EASEMENT': {
        'What is the minimum distance the house can be placed to easement without piers': 0,
    },
};

const piersCosting = {
    'Pier Labour (m2)': 0,
    'Soil Removal (% per pier)': 0,
    'Pier Material (m2)': 0
};

const earthworksParameters = {
    'CUT AND FILL': {
        'What is your cut and fill ratio after scrape?': {cut: 0, fill: 0},
        'What is your standard vegetation scrape?': 0,
    },
};

const earthworksCosting = {
    'Recycled water connection': 0,
    'AG Drains and Silt Pit': 0,
    'Deep sewer connection': 0,
    'Rock Removal': 0,
    'Wind Rating - N1 (m2)': {label: 'default', value: false, cost: 0},
    'Wind Rating - N2 (m2)': {label: 'default', value: true, cost: 0},
    'Wind Rating - N3 (m2)': {label: 'default', value: false, cost: 0},
    'Wind Rating - N4 (m2)': {label: 'default', value: false, cost: 0},
};

const cutAndFillCosts = {
    'X': {from: 0, to: 300, cost: 0},
    'Y': {from: 301, to: 600, cost: 0},
    'Z': {from: 601, to: 900, cost: 0},
};

const slabParameters = {
    thead: ['M CLASS', 'MD CLASS', 'H1 CLASS', 'H2 CLASS', 'P CLASS'],
    tbody: {
        tr: {
            'M CLASS': true,
            'MD CLASS': true,
            'H1 CLASS': true,
            'H2 CLASS': true,
            'P CLASS': true,
        }
    }
};

const slabCostings = {
    thead: ['M TYPE', 'MD TYPE', 'H1 TYPE', 'H2 TYPE', 'P TYPE'],
    tbody: {
        'LABOUR RATE (M2)': {
            first: 'LABOUR RATE (M2)',
            'M TYPE': 0,
            'MD TYPE': 0,
            'H1 TYPE': 0,
            'H2 TYPE': 0,
            'P TYPE': 0,
        },
        'MATERIAL RATE (M2)': {
            first: 'MATERIAL RATE (M2)',
            'M TYPE': 0,
            'MD TYPE': 0,
            'H1 TYPE': 0,
            'H2 TYPE': 0,
            'P TYPE': 0,
        },
        'ADDITIONAL STEEL': {
            first: 'ADDITIONAL STEEL',
            'M TYPE': 0,
            'MD TYPE': 0,
            'H1 TYPE': 0,
            'H2 TYPE': 0,
            'P TYPE': 0,
        },
        'SLAB PUMP': {
            first: 'SLAB PUMP',
            'M TYPE': 0,
            'MD TYPE': 0,
            'H1 TYPE': 0,
            'H2 TYPE': 0,
            'P TYPE': 0,
        },
        'CONTINGENCY': {
            first: 'CONTINGENCY',
            'M TYPE': 0,
            'MD TYPE': 0,
            'H1 TYPE': 0,
            'H2 TYPE': 0,
            'P TYPE': 0,
        },
    }
};

const packageCosting = {
    'Corner Lot Treatment': 0,
    '450mm Eaves (linear M rate)': 0,
    '600mm Eaves (linear M rate)': 0,
    'BAL 19 (m2 rate)': 0,
    'BAL 12.5 (m2 rate)': 0,
    'Sectional Panel Lift Door': 0,
    'NBN connection': 0,
    'Recycle Water': 0,
    'ceilHeight1': {title: 'Ceiling height (m2 rate)', cost: 0, height: 0},
    'ceilHeight2': {title: 'Ceiling height (m2 rate)', cost: 0, height: 0},
    'Colorbond Roof (m2 rate)': 0,
    'S-Flash Guttering': 0,
    'Coloured Concrete Allowance': 0,
    'Brickwork above garage': 0,
    'Watertank ': 0,
    'Pressure Sewer Connection': 0,
    'Solar Allowance': 0
};

const retainingWallParameters = {
    'RETAINING WALL DETAILS': {
        'Apply walls when cut/fill is over': 0,
        'What is your retaining wall beam height': 0,
        'When cut is less than': {firstValue: 0, secondValue: {title: 'my retaining beam length is', value: 0}},
        'When cut is greater than than': {firstValue: 0, secondValue: {title: 'my retaining beam length is', value: 0}},
    },
};

const retainingWallCosting = {
    'Standard beam cost (per beam)': 0,
    firstValue: {value: 0, cost: 0},
    secondValue: {value: 0, cost: 0},
    'Labour Cost (m2)': 0,
};

const ohsParameters = {
    'TEMPORARY FENCING': {
        'Caclulate on lot perimeter': {checked: true, cost: 0},
        'Minimum house lot width and depth': {checked: true, cost: 0},
        'Fixed Price': {checked: true, cost: 0}
    },
};

const ohsCosting = {
    'Termite Protection for Single Storey (m2)': 0,
    'Termite Protection for Double Storey (m2)': 0,
};

const otherCostings = {
    cost1: {name: 'Custom Cost', cost: 0},
    cost2: {name: 'Custom Cost', cost: 0},
    cost3: {name: 'Custom Cost', cost: 0},
};

//endregion

const SiteCostsComponent = () => {
    const [selectedNavItem, setNavItem] = useState({
        tab: 'Victoria',
        nav: 'Piers'
    });
    const [isCustomize, setIsCustomize] = useState(false);
    const [data, setData] = useState({
        piersParameters,
        piersCosting,
        earthworksParameters,
        earthworksCosting,
        cutAndFillCosts,
        slabParameters,
        slabCostings,
        packageCosting,
        retainingWallParameters,
        retainingWallCosting,
        ohsParameters,
        ohsCosting,
        otherCostings
    });

    const selectNavItem = (item = '', key = 'tab') => {
        setNavItem({...selectedNavItem, [key]: item});
    };

    const setDataValue = (value, title, key, nestedKey) => {
        setData({
            ...data,
            [title]: {
                ...data[title],
                [key]: nestedKey
                    ? {
                        ...data[title][key],
                        [nestedKey]: value
                    }
                    : value
            }
        });
    };

    const setRadioEarthWorksCostings = (value, title) => {
        const earthworksCosting = Object.entries(data.earthworksCosting).reduce((acc, [text, item]) => {
            if (typeof item !== 'object') acc[text] = item;
            else acc[text] = title === text ? {...item, value} : {...item, value: !value};
            return acc;
        }, {});

        setData({
            ...data,
            earthworksCosting
        });
    };

    const setRadioPiersParameters = (value, title, key, index) => {
        const piersParameters = Object.entries(data.piersParameters).reduce((acc, [text, item]) => {
            if (text !== title) acc[text] = item;
            else acc[text] = item[key]
                ? {
                    ...item,
                    [key]: item[key].map((nestedItem, i) => i === index ? {...nestedItem, value} : {
                        ...nestedItem,
                        value: !value
                    })
                }
                : item;
            return acc;
        }, {});

        setData({
            ...data,
            piersParameters
        });
    };

    const setTableData = (value, title, tr, key) => {
        const newRow = data[title].tbody;
        newRow[tr][key] = value;
        setDataValue(newRow, title, 'tbody');
    };

    return (
        <React.Fragment>
            <LeftPanel>
                <div className="header-wrapper">
                    <header>Site Costs</header>
                </div>
                <div className="engine-tabs">
                    <div className="tab-list">
                        {tabList.map(item => (
                            <div key={item}
                                 onClick={() => selectNavItem(item, 'tab')}
                                 className={classnames('tab', item === selectedNavItem.tab ? 'active' : '')}>
                                <span>{item}</span>
                                {
                                    item === selectedNavItem.tab
                                    && (<i className="fal fa-angle-right fa-2x"/>)
                                }
                            </div>
                        ))}
                    </div>
                </div>
            </LeftPanel>
            <RightPanel>
                <div className='site-costs-content-wrapper'>
                    {selectedNavItem.tab === 'Victoria' && (
                        <React.Fragment>
                            <div className='head-button'>
                                <button className={`button ${isCustomize ? 'primary' : 'default'}`}
                                        onClick={() => setIsCustomize(!isCustomize)}
                                >
                                    Customize
                                </button>
                            </div>
                            <nav role="navigation" className="navigation">
                                {navList.map(item =>
                                    <a
                                        key={item}
                                        onClick={() => selectNavItem(item, 'nav')}
                                        className={classnames(item === selectedNavItem.nav ? 'active' : '')}
                                        href='#'>
                                        {item}
                                    </a>
                                )}
                            </nav>
                            <ContentSectionComponent
                                title='Piers - Parameters'
                                editInfo='Last edited X days ago by X '
                            >
                                {Object.entries(data.piersParameters).map(([subtitle, body]) =>
                                    <React.Fragment key={subtitle}>
                                        <div className='sub-title'>
                                            {subtitle}
                                        </div>
                                        {Object.entries(body).map(([text, value]) =>
                                            <div key={text} className='sub-content-section'>
                                                <div className='section-left'>
                                                    <div className='section-left-value'>{text}</div>
                                                </div>
                                                <div className='section-right'>
                                                    {typeof value !== 'object'
                                                        ? (
                                                            <div className='section-right-value'>
                                                                {isCustomize
                                                                    ? <Input
                                                                        className={typeof value === 'number' ? 'input-length' : 'input-cost'}
                                                                        type={typeof value === 'number' ? 'number' : 'text'}
                                                                        value={value}
                                                                        maxLength="25"
                                                                        placeholder="0"
                                                                        onChange={e => setDataValue(
                                                                            typeof value === 'number' ? parseInt(e.currentTarget.value) : e.currentTarget.value,
                                                                            'piersParameters',
                                                                            subtitle,
                                                                            text
                                                                        )}
                                                                    />
                                                                    : <React.Fragment>
                                                                        {typeof value === 'number'
                                                                            ? `${value} mm`
                                                                            : value
                                                                        }
                                                                    </React.Fragment>
                                                                }
                                                            </div>
                                                        )
                                                        : <div className='section-right-flex'>
                                                            {subtitle === 'APPLY PIERS' &&
                                                            <React.Fragment>
                                                                {isCustomize
                                                                    ? <React.Fragment>{value.map((item, index) =>
                                                                        <NiceRadio
                                                                            key={item.label}
                                                                            name='range-radio-piers'
                                                                            value={item.label}
                                                                            checked={item.value}
                                                                            label={item.label}
                                                                            onChange={checked => setRadioPiersParameters(
                                                                                !!checked,
                                                                                subtitle,
                                                                                text,
                                                                                index
                                                                            )}
                                                                        />
                                                                    )}
                                                                    </React.Fragment>
                                                                    : <div className='section-right-value'>
                                                                        {value.find(item => item.value).label}
                                                                    </div>
                                                                }
                                                            </React.Fragment>
                                                            }
                                                            {subtitle === 'PIER DETAILS' &&
                                                            <React.Fragment>
                                                                <div className='section-right-value'>
                                                                    {isCustomize
                                                                        ? <Input
                                                                            type="text"
                                                                            value={value.type}
                                                                            maxLength="25"
                                                                            placeholder="Fill"
                                                                            onChange={e => setDataValue(
                                                                                {...value, type: e.currentTarget.value},
                                                                                'piersParameters',
                                                                                subtitle,
                                                                                text
                                                                            )}
                                                                        />
                                                                        : value.type
                                                                    }
                                                                </div>
                                                                <div className='section-right-value section-right-plus'>
                                                                    +
                                                                </div>
                                                                <div className='section-right-value'>
                                                                    {isCustomize
                                                                        ? <Input
                                                                            className='input-length'
                                                                            type="number"
                                                                            value={value.value}
                                                                            maxLength="25"
                                                                            placeholder="0"
                                                                            onChange={e => setDataValue(
                                                                                {
                                                                                    ...value,
                                                                                    value: parseInt(e.currentTarget.value)
                                                                                },
                                                                                'piersParameters',
                                                                                subtitle,
                                                                                text
                                                                            )}
                                                                        />
                                                                        : value.value + ' mm'
                                                                    }
                                                                </div>
                                                            </React.Fragment>
                                                            }
                                                        </div>
                                                    }

                                                </div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                )}
                            </ContentSectionComponent>
                            <ContentSectionComponent
                                title='Piers - Costing'
                            >
                                {Object.entries(data.piersCosting).map(([text, value]) =>
                                    <div key={text} className='sub-content-section'>
                                        <div className='section-left'>
                                            <div className='section-left-value'>{text}</div>
                                        </div>
                                        <div className='section-right'>
                                            {isCustomize
                                                ? <Input
                                                    className='input-cost'
                                                    type="number"
                                                    value={value}
                                                    maxLength="25"
                                                    placeholder="0"
                                                    onChange={e => setDataValue(e.currentTarget.value, 'piersCosting', text)}
                                                />
                                                : <div className='section-right-value'>$ {value}</div>
                                            }
                                        </div>
                                    </div>
                                )}
                            </ContentSectionComponent>
                            {isCustomize &&
                            <React.Fragment>
                                <ContentSectionComponent
                                    title='Earthworks - Parameters'
                                    editInfo='Last edited X days ago by X '
                                >
                                    {Object.entries(data.earthworksParameters).map(([subtitle, body]) =>
                                        <React.Fragment key={subtitle}>
                                            <div className='sub-title'>
                                                {subtitle}
                                            </div>
                                            {Object.entries(body).map(([text, value]) =>
                                                <div key={text} className='sub-content-section'>
                                                    <div className='section-left'>
                                                        <div className='section-left-value'>{text}</div>
                                                    </div>
                                                    <div className='section-right'>
                                                        {typeof value !== 'object'
                                                            ? (
                                                                <div className='section-right-value'>
                                                                    <Input
                                                                        className='input-length'
                                                                        type='number'
                                                                        value={value}
                                                                        maxLength="25"
                                                                        placeholder="0"
                                                                        onChange={e => setDataValue(
                                                                            parseInt(e.currentTarget.value),
                                                                            'earthworksParameters',
                                                                            subtitle,
                                                                            text
                                                                        )}
                                                                    />
                                                                </div>
                                                            )
                                                            : <div className='section-right-flex'>
                                                                <div className='section-right-value'>
                                                                    <Input
                                                                        className='input-percent'
                                                                        type="number"
                                                                        value={value.cut}
                                                                        maxLength="25"
                                                                        placeholder="% cut"
                                                                        onChange={e => setDataValue(
                                                                            {
                                                                                ...value,
                                                                                cut: parseInt(e.currentTarget.value)
                                                                            },
                                                                            'earthworksParameters',
                                                                            subtitle,
                                                                            text
                                                                        )}
                                                                    />
                                                                </div>
                                                                <div className='section-right-value'>
                                                                    <Input
                                                                        className='input-percent'
                                                                        type="number"
                                                                        value={value.fill}
                                                                        maxLength="25"
                                                                        placeholder="% fill"
                                                                        onChange={e => setDataValue(
                                                                            {
                                                                                ...value,
                                                                                fill: parseInt(e.currentTarget.value)
                                                                            },
                                                                            'earthworksParameters',
                                                                            subtitle,
                                                                            text
                                                                        )}
                                                                    />
                                                                </div>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                        </React.Fragment>
                                    )}
                                </ContentSectionComponent>
                                <ContentSectionComponent
                                    title='Earthworks - Costing'
                                    editInfo='Last edited X days ago by X '
                                >
                                    {Object.entries(data.earthworksCosting).map(([text, value], index) =>
                                        <div key={text} className='sub-content-section'>
                                            <div className='section-left'>
                                                <div className='section-left-value'>{text}</div>
                                                {typeof value === 'object' &&
                                                <NiceRadio
                                                    radioClass='nice-radio'
                                                    name={`range-radio${value.label}`}
                                                    value={index}
                                                    checked={value.value}
                                                    label={value.label}
                                                    onChange={checked => setRadioEarthWorksCostings(
                                                        !!checked,
                                                        text
                                                    )}
                                                />
                                                }
                                            </div>
                                            <div className='section-right'>
                                                <div className='section-right-value'>
                                                    <Input
                                                        className='input-cost'
                                                        type='number'
                                                        value={typeof value !== 'object' ? value : value.cost}
                                                        maxLength="25"
                                                        placeholder="0"
                                                        onChange={e => setDataValue(
                                                            typeof value !== 'object'
                                                                ? parseInt(e.currentTarget.value)
                                                                : {...value, cost: parseInt(e.currentTarget.value)},
                                                            'earthworksCosting',
                                                            text
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </ContentSectionComponent>
                                <ContentSectionComponent
                                    title='Cut and Fill - Costs'
                                >
                                    {Object.entries(data.cutAndFillCosts).map(([text, value]) =>
                                        <div key={text} className='sub-content-section'>
                                            <div className='section-left'>
                                                <div className='section-left-value section-right-costs'>
                                                    {value.from}
                                                </div>
                                                <div className='section-left-value section-right-costs'>TO</div>
                                                <div className='section-left-value section-right-costs'>{value.to}</div>
                                            </div>
                                            <div className='section-right'>
                                                <div className='section-right-value'>
                                                    <Input
                                                        className='input-cost'
                                                        type='number'
                                                        value={value.cost}
                                                        maxLength="25"
                                                        placeholder="0"
                                                        onChange={e => setDataValue(
                                                            {...value, cost: parseInt(e.currentTarget.value)},
                                                            'cutAndFillCosts',
                                                            text
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </ContentSectionComponent>
                                <ContentSectionComponent
                                    title='Slab - Parameters'
                                >
                                    <table>
                                        <thead>
                                        <tr>
                                            {data.slabParameters.thead.map(th =>
                                                <th key={th}>{th}</th>
                                            )}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {Object.entries(data.slabParameters.tbody).map(([trName, trData]) =>
                                            <tr key={trName}>
                                                {Object.entries(trData).map(([key, value]) =>
                                                    <td key={key}>
                                                        <NiceCheckbox
                                                            checkboxClass='slab-checkbox'
                                                            checked={!!value}
                                                            name={key}
                                                            onChange={e => setTableData(
                                                                e.currentTarget.checked,
                                                                'slabParameters',
                                                                trName,
                                                                key
                                                            )}
                                                        />
                                                    </td>)}
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </ContentSectionComponent>
                                <ContentSectionComponent
                                    title='Slab - Costings'
                                >
                                    <table>
                                        <thead>
                                        <tr>
                                            <th/>
                                            {data.slabCostings.thead.map(th =>
                                                <th key={th}>{th}</th>
                                            )}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {Object.entries(data.slabCostings.tbody).map(([trName, trData]) =>
                                            <tr key={trName}>
                                                {Object.entries(trData).map(([key, value]) =>
                                                    <td key={key}>
                                                        {typeof value !== 'number'
                                                            ? <span>{value}</span>
                                                            : <Input
                                                                className='input-cost'
                                                                type='number'
                                                                value={value}
                                                                maxLength="25"
                                                                placeholder="0"
                                                                onChange={e => setTableData(
                                                                    parseInt(e.currentTarget.value),
                                                                    'slabCostings',
                                                                    trName,
                                                                    key
                                                                )}
                                                            />
                                                        }
                                                    </td>)}
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </ContentSectionComponent>
                                <ContentSectionComponent
                                    title='Package - Costing'
                                >
                                    {Object.entries(data.packageCosting).map(([text, value]) =>
                                        <div key={text} className='sub-content-section'>
                                            <div className='section-left'>
                                                {typeof value !== 'object'
                                                    ? <div className='section-left-value'>{text}</div>
                                                    : <React.Fragment>
                                                        <Input
                                                            className='input-length'
                                                            type="number"
                                                            value={value.height}
                                                            maxLength="25"
                                                            placeholder="0"
                                                            onChange={e => setDataValue(
                                                                {...value, height: e.currentTarget.value},
                                                                'packageCosting',
                                                                text
                                                            )}
                                                        />
                                                        <div className='section-left-value'>{value.title}</div>
                                                    </React.Fragment>
                                                }
                                            </div>
                                            <div className='section-right'>
                                                <Input
                                                    className='input-cost'
                                                    type="number"
                                                    value={typeof value !== 'object' ? value : value.cost}
                                                    maxLength="25"
                                                    placeholder="0"
                                                    onChange={e => setDataValue(
                                                        typeof value !== 'object'
                                                            ? parseInt(e.currentTarget.value)
                                                            : {...value, cost: parseInt(e.currentTarget.value)},
                                                        'packageCosting',
                                                        text
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </ContentSectionComponent>
                                <ContentSectionComponent
                                    title='Retaining Wall - Parameters'
                                    editInfo='Last edited X days ago by X '
                                >
                                    {Object.entries(data.retainingWallParameters).map(([subtitle, body]) =>
                                        <React.Fragment key={subtitle}>
                                            <div className='sub-title'>
                                                {subtitle}
                                            </div>
                                            {Object.entries(body).map(([text, value]) =>
                                                <div key={text} className='sub-content-section'>
                                                    {typeof value !== 'object'
                                                        ? <React.Fragment>
                                                            <div className='section-left'>
                                                                <div className='section-left-value'>{text}</div>
                                                            </div>
                                                            <div className='section-right'>
                                                                <Input
                                                                    className='input-length'
                                                                    type="number"
                                                                    value={value}
                                                                    maxLength="25"
                                                                    placeholder="0"
                                                                    onChange={e => setDataValue(
                                                                        parseInt(e.currentTarget.value),
                                                                        'retainingWallParameters',
                                                                        subtitle,
                                                                        text
                                                                    )}
                                                                />
                                                            </div>
                                                        </React.Fragment>

                                                        : <React.Fragment>
                                                            <div className='section-left'>
                                                                <div className='section-left-retaining-wall'>
                                                                    <div className='retaining-wall-left'>
                                                                        <div className='section-left-value'>{text}</div>
                                                                        <Input
                                                                            className='input-length'
                                                                            type="number"
                                                                            value={value.firstValue}
                                                                            maxLength="25"
                                                                            placeholder="0"
                                                                            onChange={e => setDataValue(
                                                                                {
                                                                                    ...value,
                                                                                    firstValue: parseInt(e.currentTarget.value)
                                                                                },
                                                                                'retainingWallParameters',
                                                                                subtitle,
                                                                                text
                                                                            )}
                                                                        />
                                                                    </div>
                                                                    <div
                                                                        className='section-left-value retaining-wall-right'>{value.secondValue.title}</div>
                                                                </div>
                                                            </div>
                                                            <div className='section-right'>
                                                                <Input
                                                                    className='input-length'
                                                                    type="number"
                                                                    value={value.secondValue.value}
                                                                    maxLength="25"
                                                                    placeholder="0"
                                                                    onChange={e => setDataValue(
                                                                        {
                                                                            ...value,
                                                                            secondValue: {
                                                                                ...value.secondValue,
                                                                                value: parseInt(e.currentTarget.value)
                                                                            }
                                                                        },
                                                                        'retainingWallParameters',
                                                                        subtitle,
                                                                        text
                                                                    )}
                                                                />
                                                            </div>
                                                        </React.Fragment>

                                                    }
                                                </div>
                                            )}
                                        </React.Fragment>
                                    )}
                                </ContentSectionComponent>
                                <ContentSectionComponent
                                    title='Retaining Wall - Costing'
                                >
                                    {Object.entries(data.retainingWallCosting).map(([text, value]) =>
                                        <div key={text} className='sub-content-section'>
                                            <div className='section-left'>
                                                {typeof value !== 'object'
                                                    ? <div className='section-left-value'>{text}</div>
                                                    : <Input
                                                        className='input-length'
                                                        type="number"
                                                        value={value.value}
                                                        maxLength="25"
                                                        placeholder="0"
                                                        onChange={e => setDataValue(
                                                            {...value, value: parseInt(e.currentTarget.value)},
                                                            'retainingWallCosting',
                                                            text
                                                        )}
                                                    />
                                                }
                                            </div>
                                            <div className='section-right'>
                                                <Input
                                                    className='input-cost'
                                                    type="number"
                                                    value={typeof value !== 'object' ? value : value.cost}
                                                    maxLength="25"
                                                    placeholder="0"
                                                    onChange={e => setDataValue(
                                                        typeof value !== 'object'
                                                            ? parseInt(e.currentTarget.value)
                                                            : {...value, cost: parseInt(e.currentTarget.value)},
                                                        'retainingWallCosting',
                                                        text
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </ContentSectionComponent>
                                <ContentSectionComponent
                                    title='OH&S - Parameters'
                                    editInfo='Last edited X days ago by X '
                                >
                                    {Object.entries(data.ohsParameters).map(([subtitle, body]) =>
                                        <React.Fragment key={subtitle}>
                                            <div className='sub-title'>
                                                {subtitle}
                                            </div>
                                            {Object.entries(body).map(([text, value]) =>
                                                <div key={text} className='sub-content-section'>
                                                    <div className='section-left'>
                                                        <div className='section-left-value'>{text}</div>
                                                    </div>
                                                    <div className='section-right'>
                                                        <NiceCheckbox
                                                            checkboxClass='slab-checkbox'
                                                            checked={!!value.checked}
                                                            name={text}
                                                            onChange={e => setDataValue(
                                                                {...value, checked: !!e.currentTarget.checked},
                                                                'ohsParameters',
                                                                subtitle,
                                                                text,
                                                            )}
                                                        />
                                                        <Input
                                                            className='input-cost'
                                                            type="number"
                                                            value={value.cost}
                                                            maxLength="25"
                                                            placeholder="0"
                                                            onChange={e => setDataValue(
                                                                {...value, cost: parseInt(e.currentTarget.value)},
                                                                'ohsParameters',
                                                                subtitle,
                                                                text
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </React.Fragment>
                                    )}
                                </ContentSectionComponent>
                                <ContentSectionComponent
                                    title='OH&S - Costing'
                                >
                                    {Object.entries(data.ohsCosting).map(([text, value]) =>
                                        <div key={text} className='sub-content-section'>
                                            <div className='section-left'>
                                                <div className='section-left-value'>{text}</div>
                                            </div>
                                            <div className='section-right'>
                                                <Input
                                                    className='input-cost'
                                                    type="number"
                                                    value={value}
                                                    maxLength="25"
                                                    placeholder="0"
                                                    onChange={e => setDataValue(
                                                        parseInt(e.currentTarget.value),
                                                        'ohsCosting',
                                                        text
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </ContentSectionComponent>
                                <ContentSectionComponent
                                    title='Other - Costing'
                                >
                                    {Object.entries(data.otherCostings).map(([text, value]) =>
                                        <div key={text} className='sub-content-section'>
                                            <div className='section-left'>
                                                <div className='section-left-value'>{value.name}</div>
                                            </div>
                                            <div className='section-right'>
                                                <Input
                                                    className='input-cost'
                                                    type="number"
                                                    value={value.cost}
                                                    maxLength="25"
                                                    placeholder="0"
                                                    onChange={e => setDataValue(
                                                        {...value, cost: parseInt(e.currentTarget.value)},
                                                        'otherCostings',
                                                        text
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </ContentSectionComponent>
                            </React.Fragment>
                            }

                        </React.Fragment>
                    )}
                </div>
            </RightPanel>
        </React.Fragment>
    );
};

SiteCostsComponent.componentUrl = '/kaspa-engine/site-costs';

SiteCostsComponent.propTypes = {};

export default connect((state => ({
    ...state.kaspaEngine
})), actions)(SiteCostsComponent);


