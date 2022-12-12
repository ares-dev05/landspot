import classnames from 'classnames';
import React, {useState} from 'react';
import {clickHandler, dateFormat} from '~sitings~/helpers';
import {CssStatuses} from '../Floorplans';
import DocumentFileUploader from './DocumentFileUploader';
import RangesInput from './RangesInput';
import SearchBar from '~sitings~/helpers/SearchBar';
import {NiceRadioGroup} from '~sitings~/helpers/NiceRadio';
import StatesAutocomplete from './StatesAutocomplete';
import moment from 'moment';

export {SearchBar, RangesInput};

export const StatesInput = ({states, value, disabled, onFloorplanFormInputChange}) => (
    <React.Fragment>
        {/*<h5>Basic Information</h5>*/}
        <label htmlFor='states-autocomplete'>STATE</label>
        <StatesAutocomplete
            initialValue={value}
            disabled={disabled}
            onStateSelect={value => onFloorplanFormInputChange('state_id', value)}
            states={states}
        />
    </React.Fragment>
);

export const FloorplanFiles = ({
                                   name, floorplanId, disabled, static_file_dwg, status,
                                   onFloorplanFormInputChange
                               }) => (
    <React.Fragment>
        <label>NAME</label>
        <input type='text'
               className='input-box'
               maxLength={100}
               value={name}
               disabled={disabled}
               placeholder='Floorplan name'
               onChange={e => onFloorplanFormInputChange('name', e.target.value)}
        />
        {
            static_file_dwg.length > 0 && floorplanId && <p>Your uploaded files</p>
        }
        {
            static_file_dwg.map((file, index) => (
                    <p className='ellipsis flex-centered file-data' key={index}>
                        <i className="fal fa-paperclip" aria-hidden="true"/>
                        <span>{file.fileName}</span>
                    </p>
                )
            )
        }
        {/*{*/}
            {/*status === 'Attention' &&*/}
            <div className='order-row upload-file'>
                <DocumentFileUploader buttonTitle={floorplanId ? 'Make an Update' : 'Upload floorplan'}
                                      multiple={false}
                                      mimeType='image/vnd.dwg'
                                      uploadURL={`/sitings/plans/upload-document?file_type=DWG`}
                                      onFileUploaded={data => onFloorplanFormInputChange('file_dwg', data)}
                />
                <label>Acceptable file format - DWG, max 20Mb</label>
            </div>
        {/*}*/}
    </React.Fragment>
);

export const UploadedFileList = ({
                                     file_dwg, update_note, floorplanId, status,
                                     deleteUploadedFile, onFloorplanFormInputChange
                                 }) => (
    <React.Fragment>
        {
            file_dwg.map((file, index) => (
                    <p className='file-data' key={index}>
                        <i className="fal fa-paperclip" aria-hidden="true"/>
                        <span className='ellipsis'>{file.fileName}</span>
                        {
                            !floorplanId &&
                            <button type={'button'}
                                    className={'transparent'}
                                    onClick={e => clickHandler(e, deleteUploadedFile, [index])}>
                                <i className="fal fa-times"/>
                            </button>
                        }
                    </p>
                )
            )
        }
        {
            floorplanId /*&& status === 'Attention'*/ &&
            <div className='order-row upload-file'>
                <label>Type a note for your update</label>
                <textarea placeholder='Note for the update'
                          maxLength={255}
                          onChange={e => onFloorplanFormInputChange('update_note', e.target.value)}
                          value={update_note}
                />
            </div>
        }
    </React.Fragment>
);

export const LiveDate = ({floorplanId, status, live_date, name, onFloorplanFormInputChange}) => {
    const [dateType, setType] = useState('asap');
    const disabled = dateType === 'asap';
    return <React.Fragment>
        <label className='live-date-label'>LIVE&nbsp;DATE</label>
        {
            (floorplanId && status !== 'Active' && status !== 'Attention')
                ? <div className='live-date-static'>{live_date ? dateFormat(live_date) : 'ASAP'}</div>
                : <div className='floorplan-row live-date-form'>
                    <NiceRadioGroup
                        name={`live-date-radio-${name}`}
                        radioClass='floorplan-date'
                        value={dateType}
                        labels={{'asap': 'ASAP', 'custom': 'Custom'}}
                        onChange={value => {
                            setType(value);
                            if (value === 'asap') {
                                onFloorplanFormInputChange('live_date', '')
                            }
                        }}
                    />
                    <div className={classnames('live-date', disabled && 'disabled')}>
                        <input type='date'
                               min={moment().format('YYYY-MM-DD')}
                               value={live_date || ''}
                               disabled={disabled}
                               onChange={e => {
                                   let {value} = e.target;
                                   if (!value) {
                                       setType('asap');
                                   }
                                   onFloorplanFormInputChange('live_date', value)
                               }}
                        />
                    </div>
                </div>
        }
    </React.Fragment>
};


export const FloorplanStatus = ({onFloorplanFormInputChange, floorplanForm: {status}, permissions: {isAdmin}}) => (
    isAdmin
        ? <React.Fragment>
            <label className='status'>STATUS</label>
            <div className='select-wrapper floorplan-status'>
                <select className='select-filter'
                        onChange={e => onFloorplanFormInputChange('status', e.target.value)}
                        value={status}>
                    {
                        Object.keys(CssStatuses).map(
                            status => <option key={status}>{status}</option>
                        )
                    }
                </select>
            </div>
        </React.Fragment>
        : null
);