import React, {useState} from 'react';
import {connect} from 'react-redux';
import MenuList from '~/helpers/MenuList';
import {EstateDataContext} from '../Estate-new';
import PlusMinus from '~/helpers/PlusMinus';
import * as actions from '../../store/estate/actions';
import {EstateLotsDataContext} from './EstateLots';

const TitleRow = ({handleBulkUpdateLot, title}) => (
    <div className='title-date-bulk-update'>
        <span>{title}</span>
        <a href='#'
           onClick={() => handleBulkUpdateLot()}>
            <i className="fal fa-save"/>
        </a>
    </div>
);

const InputRow = ({value, setValue, handleBulkUpdateLot, placeholder, type}) => (
    <div className='landspot-input'>
        <input type={type}
               className='column-name'
               style={{width: '100%'}}
               placeholder={placeholder}
               onChange={e => setValue(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleBulkUpdateLot()}
               value={value}
        />
    </div>
);

const BulkUpdateLot = ({
                           bulkUpdateLot,
                           placeholder = 'Enter value',
                           title = 'Bulk Update',
                           resetUserAction,
                           column
                       }) => {
    const isNumber = column === 'price';
    const [value, setValue] = useState(isNumber ? 0 : '');

    const handleBulkUpdateLot = () => {
        bulkUpdateLot({value});
    };

    const handleSetPrice = (value) => {
        setValue(value);
    };

    return (
        <React.Fragment>
            <div
                className='bulk-overlay'
                onClick={() => resetUserAction()}
            />
            <MenuList
                placement='right'
                clickable
                className='bulk-tooltip'
                items={[
                    {
                        html: <TitleRow
                            handleBulkUpdateLot={handleBulkUpdateLot}
                            title={title}
                        />
                    },
                    {
                        html: <div className={isNumber ? 'input-row' : ''}>
                            <InputRow
                                value={value}
                                setValue={isNumber ? handleSetPrice : setValue}
                                handleBulkUpdateLot={handleBulkUpdateLot}
                                placeholder={placeholder}
                                type={isNumber ? 'number' : 'text'}
                            />
                            {
                                isNumber &&
                                <PlusMinus
                                    value={value}
                                    setValue={handleSetPrice}
                                />
                            }
                        </div>
                    }
                ]}
            />
        </React.Fragment>
    );
};

const BulkUpdateLotConsumer = (props) => (
    <EstateDataContext.Consumer>
        {
            ({resetUserAction}) =>  <EstateLotsDataContext.Consumer>
                {
                    ({bulkUpdateLot}) =>  <BulkUpdateLot {...props} {...{resetUserAction , bulkUpdateLot}}/>
                }
            </EstateLotsDataContext.Consumer>
        }
    </EstateDataContext.Consumer>
);

export default BulkUpdateLotConsumer;