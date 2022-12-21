import React, {useState} from 'react';
import {LeftPanel, RightPanel} from '~/helpers/Panels';
import Input from '~/helpers/Input';
import classnames from 'classnames';
import {connect} from 'react-redux';
import * as actions from '../store/kaspaEngine/actions';

import ContentSectionComponent from '../layouts/ContentSectionComponent';

const tabList = ['Builder1', 'Victoria', 'Queensland'];
const navList = [
    'Settings',
    'Estate Assign',
    'SlabTypes',
    'Fall Brackets'
];

const PackageSettingsComponent = () => {
    const [selectedNavItem, setNavItem] = useState({
        tab: 'Builder1',
        nav: 'Settings'
    });
    const [inputValue, setInputValue] = useState({
        region: '',
        subRegion: '',
        slab: '',
        bracketX1: 0,
        bracketX2: 0,
        bracketY1: 0,
        bracketY2: 0,
        bracketZ1: 0,
        bracketZ2: 0,
        eaveX: 0,
        eaveY: 0,
        eaveZ: 0,
        ceilX: 0,
        ceilY: 0,
        ceilZ: 0,
    });
    const [isCustomize, setIsCustomize] = useState(false);

    const handleInput = (e = '', input = 'region') => {
        setInputValue({...inputValue, [input]: e.currentTarget.value});
    };

    const selectNavItem = (item = '', key = 'tab') => {
        setNavItem({...selectedNavItem, [key]: item});
    };

    return (
        <React.Fragment>
            <LeftPanel>
                <div className="header-wrapper">
                    <header>Package Settings</header>
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
                <div className='package-content-wrapper'>
                    {selectedNavItem.tab === 'Builder1' && (
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
                                title='Region Settings'
                            >
                                <div className='sub-content-section'>
                                    <div className='section-left'>
                                        <div className='section-left-title'>
                                            Regions
                                        </div>
                                        <div className='section-left-values'>
                                            {['Metro North', 'Metro West'].map(item => <span key={item}>{item}</span>)}
                                        </div>
                                    </div>
                                    <div className='section-right'>
                                        <Input
                                            type="text"
                                            value={inputValue.region}
                                            maxLength="10"
                                            placeholder="region"
                                            onChange={e => handleInput(e, 'region')}
                                        />
                                        <button
                                            className="button default"
                                            onClick={() => console.log('ADD REGION')}
                                        >
                                            Add Region
                                        </button>
                                    </div>
                                </div>
                            </ContentSectionComponent>
                            <ContentSectionComponent
                            >
                                <div className='sub-content-section'>
                                    <div className='section-left'>
                                        <div className='section-left-title'>
                                            Regions
                                        </div>
                                        <div className='section-left-select'>
                                            <div className='select-label'>
                                                Selection Region
                                            </div>
                                            <div className='nice-dropdown'>
                                                <button type="button" aria-haspopup="true"
                                                        disabled={false}
                                                        aria-expanded={true}
                                                        id='id'
                                                        ref={node => node}
                                                        onClick={() => console.log('SELECT CLICK')}>
                                                    {'defaultItem' + '\u00A0'}
                                                </button>
                                                <div className='list'>
                                                    <a href="/"
                                                       title='defaultItem'
                                                       className={`item ${false && 'selected'}`}
                                                       onClick={e => console.log('LIST ITEM', e)}>
                                                        defaultItem
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='section-left-values'>
                                            {['Zone1'].map(item => <span key={item}>{item}</span>)}
                                        </div>
                                    </div>
                                    <div className='section-right'>
                                        <Input
                                            type="text"
                                            value={inputValue.subRegion}
                                            maxLength="10"
                                            placeholder="sub region"
                                            onChange={e => handleInput(e, 'subRegion')}
                                        />
                                        <button
                                            className="button default"
                                            onClick={() => console.log('ADD SUB REGION')}
                                        >
                                            Add Sub Region
                                        </button>
                                    </div>
                                </div>
                            </ContentSectionComponent>
                            <ContentSectionComponent
                                title='Slab Types'
                            >
                                <div className='sub-content-section'>
                                    <div className='section-left'>
                                        <div className='section-left-values'>
                                            {['H1 Class', 'H2 Class'].map(item => <span key={item}>{item}</span>)}
                                        </div>
                                    </div>
                                    <div className='section-right'>
                                        <Input
                                            type="text"
                                            value={inputValue.slab}
                                            maxLength="10"
                                            placeholder="slab type"
                                            onChange={e => handleInput(e, 'slab')}
                                        />
                                        <button
                                            className="button default"
                                            onClick={() => console.log('ADD SLAB TYPE')}
                                        >
                                            Add Slab Type
                                        </button>
                                    </div>
                                </div>
                            </ContentSectionComponent>
                            <ContentSectionComponent
                                title='Fall Brackets'
                            >
                                <div className='sub-content-section'>
                                    <div className='section-left'>
                                        <div className='section-left-brackets'>
                                            <Input
                                                type="number"
                                                value={inputValue.bracketX1}
                                                maxLength="25"
                                                placeholder="bracketX1"
                                                onChange={e => handleInput(e, 'bracketX1')}
                                            />
                                            <div>To</div>
                                            <Input
                                                type="number"
                                                value={inputValue.bracketX2}
                                                maxLength="25"
                                                placeholder="bracketX2"
                                                onChange={e => handleInput(e, 'bracketX2')}
                                            />
                                        </div>
                                        <div className='section-left-brackets'>
                                            <Input
                                                type="number"
                                                value={inputValue.bracketY1}
                                                maxLength="25"
                                                placeholder="bracketY1"
                                                onChange={e => handleInput(e, 'bracketY1')}
                                            />
                                            <div>To</div>
                                            <Input
                                                type="number"
                                                value={inputValue.bracketY2}
                                                maxLength="25"
                                                placeholder="bracketY2"
                                                onChange={e => handleInput(e, 'bracketY2')}
                                            />
                                        </div>
                                        <div className='section-left-brackets'>
                                            <Input
                                                type="number"
                                                value={inputValue.bracketZ1}
                                                maxLength="25"
                                                placeholder="bracketZ1"
                                                onChange={e => handleInput(e, 'bracketZ1')}
                                            />
                                            <div>To</div>
                                            <Input
                                                type="number"
                                                value={inputValue.bracketZ2}
                                                maxLength="25"
                                                placeholder="bracketZ2"
                                                onChange={e => handleInput(e, 'bracketZ2')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </ContentSectionComponent>
                            <ContentSectionComponent
                                title='Eave Types'
                            >
                                <div className='sub-content-section'>
                                    <div className='section-left'>
                                        <div className="section-left-types">
                                            <Input
                                                className='input-length'
                                                type="number"
                                                value={inputValue.eaveX}
                                                maxLength="25"
                                                placeholder="eaveX"
                                                onChange={e => handleInput(e, 'eaveX')}
                                            />
                                            <Input
                                                className='input-length'
                                                type="number"
                                                value={inputValue.eaveY}
                                                maxLength="25"
                                                placeholder="eaveY"
                                                onChange={e => handleInput(e, 'eaveY')}
                                            />
                                            <Input
                                                className='input-length'
                                                type="number"
                                                value={inputValue.eaveZ}
                                                maxLength="25"
                                                placeholder="eaveZ"
                                                onChange={e => handleInput(e, 'eaveZ')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </ContentSectionComponent>
                            <ContentSectionComponent
                                title='Standard Ceiling Heights'
                            >
                                <div className='sub-content-section'>
                                    <div className='section-left'>
                                        <div className="section-left-types">
                                            <Input
                                                className='input-length'
                                                type="number"
                                                value={inputValue.ceilX}
                                                maxLength="25"
                                                placeholder="ceilX"
                                                onChange={e => handleInput(e, 'ceilX')}
                                            />
                                            <Input
                                                className='input-length'
                                                type="number"
                                                value={inputValue.ceilY}
                                                maxLength="25"
                                                placeholder="ceilY"
                                                onChange={e => handleInput(e, 'ceilY')}
                                            />
                                            <Input
                                                className='input-length'
                                                type="number"
                                                value={inputValue.ceilZ}
                                                maxLength="25"
                                                placeholder="ceilZ"
                                                onChange={e => handleInput(e, 'ceilZ')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </ContentSectionComponent>
                        </React.Fragment>
                    )}

                </div>
            </RightPanel>
        </React.Fragment>
    );
};

PackageSettingsComponent.componentUrl = '/kaspa-engine/package-settings';

PackageSettingsComponent.propTypes = {};

export default connect((state => ({
    ...state.kaspaEngine
})), actions)(PackageSettingsComponent);
