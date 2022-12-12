import React, {useState} from 'react';
import {connect} from 'react-redux';
import {get} from 'lodash';
import {ContentPanel} from '~/helpers/Panels';
import PriceSlider from '~/helpers/PriceSlider';
import NiceDropdown from '~/helpers/NiceDropdown';
import Input from '~/helpers/Input';
import AddEstateModalComponent from '../components/AddEstateModalComponent';

import * as actions from '../store/kaspaEngine/actions';

const initState = {
    estate: ['Estate name1', 'Estate name2', 'Estate name3'],
    estateSelected: '',
    region: '',
    priceMin: 0,
    priceMax: 20000,
    areaMin: '',
    areaMax: '',
    dimensionWidth: '',
    dimensionDepth: '',
    facade: '',
    floorplan: ['Floorplan name1', 'Floorplan name2', 'Floorplan name3'],
    floorplanSelected: '',
    range: ['Range name1', 'Range name2', 'Range name3'],
    rangeSelected: ''
};

const table = {
    th: ['REGION.', 'ESTATE', 'STAGES PACKAGED', 'NO LOTS PACKAGED', 'NUMBER OF PACKAGES.', 'PRICE LIST', 'GUIDELINE PROFILE', 'COST PROFILE'],
    data: [
        [
            {value: 'North', view: false},
            {value: 'First St', view: false},
            {value: '1,2,3', view: false},
            {value: '12', view: false},
            {value: '12', view: true},
            {value: '', view: true},
            {value: '', view: true},
            {value: '', view: true},
        ],
        [
            {value: 'North', view: false},
            {value: 'First St', view: false},
            {value: '1,2,3', view: false},
            {value: '12', view: false},
            {value: '12', view: true},
            {value: '', view: true},
            {value: '', view: true},
            {value: '', view: true},
        ]
    ]
};

const MyEstatesComponent = () => {
    const [inputValue, setInputValue] = useState(initState);
    const [showAddEstateModal, setShowAddEstateModal] = useState(false);

    const handleInput = (input = 'region', value = '') => {
        const data = typeof input === 'string' ? {[input]: value} : input;
        setInputValue({...inputValue, ...data});
    };

    const clearAll = () => {
        setInputValue(initState);
    };

    const openAddEstateModal = () => {
        setShowAddEstateModal(!showAddEstateModal);
    };

    return (
        <React.Fragment>
            <ContentPanel className="my-estates-content-wrapper">
                <div className='content-header'>
                    <div className='header-title'>My Estates</div>
                    <button className='button default add-estate' onClick={openAddEstateModal}>
                        <i className="landspot-icon plus"/>
                        Add Estate
                    </button>
                </div>
                <div className='content-filter-wrapper'>
                    <div className='filter-header'>
                        <div className='filter-title'>Filter by</div>
                        <a className='clear-all' onClick={clearAll}>
                            Clear all
                        </a>
                    </div>
                    <div className='filter-row'>
                        <div className='filter-column'>
                            <div className='filter-item'>
                                <div className='filter-key'>Estate name</div>
                                <div className='filter-value'>
                                    <NiceDropdown
                                        defaultItem='Select Range'
                                        defaultValue={null}
                                        items={inputValue.estate.map(name => ({
                                            text: name,
                                            value: name
                                        }))}
                                        onChange={option => handleInput('estateSelected', option)}
                                        value={inputValue.estateSelected}
                                    />
                                </div>
                            </div>
                            <div className='filter-item'>
                                <div className='filter-key'>Region</div>
                                <div className='filter-value'>
                                    <Input
                                        type='text'
                                        value={inputValue.region}
                                        maxLength="25"
                                        placeholder="Suburb"
                                        onChange={e => handleInput('region', e.currentTarget.value)}
                                    />
                                </div>
                            </div>
                            <div className='filter-item price-range'>
                                <div className='filter-key'>Price range</div>
                                <div className='filter-value'>
                                    <PriceSlider
                                        step={1}
                                        max={20000}
                                        min={0}
                                        onChange={e => handleInput({priceMin: get(e, '[0]'), priceMax: get(e, '[1]')})}
                                        valueMin={inputValue.priceMin}
                                        valueMax={inputValue.priceMax}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='filter-column'>
                            <div className='filter-item'>
                                <div className='filter-key'>Area range (m2)</div>
                                <div className='filter-value input-range'>
                                    <Input
                                        type='number'
                                        value={inputValue.areaMin}
                                        maxLength="25"
                                        placeholder="Min. area"
                                        onChange={e => handleInput('areaMin', e.currentTarget.value)}
                                    />
                                    <Input
                                        type='number'
                                        value={inputValue.areaMax}
                                        maxLength="25"
                                        placeholder="Max. area"
                                        onChange={e => handleInput('areaMax', e.currentTarget.value)}
                                    />
                                </div>
                            </div>
                            <div className='filter-item'>
                                <div className='filter-key'>Dimensions (m)</div>
                                <div className='filter-value input-range'>
                                    <Input
                                        type='number'
                                        value={inputValue.dimensionWidth}
                                        maxLength="25"
                                        placeholder="Width"
                                        onChange={e => handleInput('dimensionWidth', e.currentTarget.value)}
                                    />
                                    <Input
                                        type='number'
                                        value={inputValue.dimensionDepth}
                                        maxLength="25"
                                        placeholder="Depth"
                                        onChange={e => handleInput('dimensionDepth', e.currentTarget.value)}
                                    />
                                </div>
                            </div>
                            <div className='filter-item'>
                                <div className='filter-key'>Facade</div>
                                <div className='filter-value'>
                                    <Input
                                        type='text'
                                        value={inputValue.facade}
                                        maxLength="25"
                                        placeholder="Estate name"
                                        onChange={e => handleInput('facade', e.currentTarget.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='filter-column'>
                            <div className='filter-item'>
                                <div className='filter-key'>Floorplan</div>
                                <div className='filter-value'>
                                    <NiceDropdown
                                        defaultItem='Any'
                                        defaultValue={null}
                                        items={inputValue.floorplan.map(name => ({
                                            text: name,
                                            value: name
                                        }))}
                                        onChange={option => handleInput('floorplanSelected', option)}
                                        value={inputValue.floorplanSelected}
                                    />
                                </div>
                            </div>
                            <div className='filter-item'>
                                <div className='filter-key'>Range</div>
                                <div className='filter-value'>
                                    <NiceDropdown
                                        defaultItem='Any'
                                        defaultValue={null}
                                        items={inputValue.range.map(name => ({
                                            text: name,
                                            value: name
                                        }))}
                                        onChange={option => handleInput('rangeSelected', option)}
                                        value={inputValue.rangeSelected}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <table className='table'>
                    <thead>
                    <tr>
                        {table.th.map(th => <th key={th}>{th}</th>)}
                    </tr>
                    {table.data.map((tr, index) =>
                        <tr key={index}>
                            {tr.map((td, index) =>
                                <td key={index}>
                                    <span className='value'>{td.value} </span>
                                    {td.view && (
                                        <a href='#'>
                                            <i className='landspot-icon eye'/>
                                            View
                                        </a>
                                    )}
                                </td>
                            )}
                        </tr>
                    )}
                    </thead>
                </table>
            </ContentPanel>
            {showAddEstateModal &&
            <AddEstateModalComponent
                title='Add New Estate To Package'
                dialogClassName='add-estate'
                onOK={e => console.log('SAVE CHANGES', e)}
                onModalHide={openAddEstateModal}
                hideCancelButton
                okButtonTitle='Save Changes'
            />
            }
        </React.Fragment>
    );
};

MyEstatesComponent.componentUrl = '/kaspa-engine/my-estates';
MyEstatesComponent.propTypes = {};

export default connect((state => ({
    ...state.kaspaEngine
})), actions)(MyEstatesComponent);