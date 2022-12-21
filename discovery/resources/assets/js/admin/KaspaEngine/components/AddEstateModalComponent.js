import React, {useState} from 'react';
import {PopupModal} from '../../../popup-dialog/PopupModal';
import classnames from 'classnames';

const navList = ['Select Existing', 'Request New Estate'];

const Input = ({className, ...props}) => (
    <div className={classnames('landspot-input', className)}>
        <input maxLength="250" {...props}/>
    </div>
);

const AddEstateModalComponent = ({onOK, ...props}) => {
        const [selectedNavItem, setSelectedNavItem] = useState('Select Existing');
        const [inputValue, setInputValue] = useState({
            estate: '',
            region: '',
            zone: ''
        });

        const handleInput = (input = 'region', value = '') => {
            const data = typeof input === 'string' ? {[input]: value} : input;
            setInputValue({...inputValue, ...data});
        };

        return (
            <PopupModal onOK={() => onOK(inputValue)} {...props}>
                <nav role="navigation" className="navigation">
                    {navList.map(item =>
                        <a
                            key={item}
                            onClick={() => setSelectedNavItem(item)}
                            className={classnames(item === selectedNavItem ? 'active' : '')}
                            href='#'>
                            {item}
                        </a>
                    )}
                </nav>
                {selectedNavItem === 'Select Existing' &&
                <div className='modal-content'>
                    <div className='flex-row estate'>
                        <div className='flex-left'>Estate:</div>
                        <div className='flex-right'>
                            <Input
                                type='text'
                                value={inputValue.estate}
                                maxLength="25"
                                placeholder="Edgebrook"
                                onChange={e => handleInput('estate', e.currentTarget.value)}
                            />
                        </div>
                    </div>
                    <div className='flex-row contact'>
                        <div className='flex-left logo'
                            style={{backgroundImage: 'url()'}}
                        />
                        <div className='flex-right contact-column'>
                            <div className='contact-row address'>
                                <div className='contact-title'>ADDRESS</div>
                                <div className='contact-field'>4 Collins Street, Melbourne VIC</div>
                                <div className='contact-field'> Australia 3000</div>
                            </div>
                            <div className='contact-row contact'>
                                <div className='contact-title'>CONTACT</div>
                                <div className='contact-field'>email@email.com</div>
                                <div className='contact-field'>+61 3 1234 5678</div>
                            </div>
                            <div className='contact-row contact'>
                                <div className='contact-title'>4 - AVAILABLE STAGES</div>
                            </div>
                        </div>
                    </div>
                    <div className='flex-row region'>
                        <div className='flex-left'>Select Region:</div>
                        <div className='flex-right'>
                            <Input
                                type='text'
                                value={inputValue.region}
                                maxLength="25"
                                placeholder="enter region"
                                onChange={e => handleInput('region', e.currentTarget.value)}
                            />
                        </div>
                    </div>
                    <div className='flex-row zone'>
                        <div className='flex-left'>Select Zone:</div>
                        <div className='flex-right'>
                            <Input
                                type='text'
                                value={inputValue.zone}
                                maxLength="25"
                                placeholder="enter zone"
                                onChange={e => handleInput('zone', e.currentTarget.value)}
                            />
                        </div>
                    </div>
                </div>
                }
            </PopupModal>
        );
    }
;

export default AddEstateModalComponent;