import React, {useEffect, useState} from 'react';

import {xor} from 'lodash';
import classnames from 'classnames';
import {withAlert} from 'react-alert';
import StepLeftSection from '../StepLeftSection';
import {getStates, getSuburbs} from '../../store/actions';

// import FileUploader from '../../../file-uploader/FileUploader';

const LandStep = ({alert, formData, handleNextStep, handlePrevStep}) => {
    const land = Object.freeze({
        NEED_LAND: 'need_land',
        HAVE_LAND: 'have_land',
    });
    const [selectedLand, setLand] = useState(formData.land || land.NEED_LAND);
    const [showMore, setShowMore] = useState(false);
    const [errors, setErrors] = useState({});
    const [form, setValue] = useState(formData.landForm || {
        lotNumber: '',
        streetName: '',
        estateName: '',
        selectedState: {},
        states: [],
        suburbs: [],
        selectedSuburbs: [],
        filePath: '',
        thumb: '',
        origin_name_file: ''
    });
    const {lotNumber, streetName, estateName, suburbs, selectedSuburbs} = form;
    const {error, success} = alert;
    const showItems = 7;

    useEffect(() => {
        Promise.all([getSuburbs({regionId: formData['region']}), getStates()])
            .then(([suburbs, states]) => {
                setValue({
                    ...form,
                    suburbs: suburbs.data,
                    states: states.data
                });
            }).catch(e => {
            error(<div><p>{e.response.data.message}</p></div>);
        });
    }, []);

    const onSuburbsSelect = id => {
        const result = xor(selectedSuburbs, [id]);
        setValue({
            ...form,
            selectedSuburbs: result
        });
    };

    const onInputChange = e => {
        setValue({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const onNumberInputChange = e => {
        const numberedValue = Number(e.target.value.toString().replace(/[^0-9]/g, ''));
        setValue({
            ...form,
            [e.target.name]: numberedValue
        });
    };

    // const PDFUploadError = (data) => {
    //     setErrors({
    //         ...errors,
    //         errors: data.errors
    //     });
    // };
    //
    // const PDFUploadSuccess = (result) => {
    //     setValue((prevState) => ({
    //         ...prevState,
    //         filePath: result.path.storagePath,
    //         thumb: result.thumb,
    //         origin_name_file: result.origin_name_file
    //     }));
    //     success('Document Uploaded');
    // };

    const validateName = e => {
        setErrors({
            ...errors,
            [e.target.name]: e.target.value.length > 0
                ? null
                : 'This field must be longer than your character'
        });
    };

    const setStates = (value) => {
        if (value === land.NEED_LAND) {
            const data = {
                lotNumber: '',
                streetName: '',
                estateName: '',
                filePath: '',
                thumb: '',
                origin_name_file: ''
            };
            setLand(land.NEED_LAND);
            setValue((prevState) => ({...prevState, ...data}));
        }

        if (value === land.HAVE_LAND) {
            setLand(land.HAVE_LAND);
            setValue((prevState) => ({...prevState, selectedSuburbs: []}));
        }
    };

    const validateFields = () => {
        if (land.NEED_LAND === selectedLand) {
            return selectedSuburbs.length;
        }
        return (Number.isInteger(lotNumber)
            && streetName.length
            && estateName.length
        );
    };

    const beforeNextStep = () => {
        handleNextStep({
            land: selectedLand,
            landForm: form
        });
    };

    const shownSuburbs = showMore ? suburbs : suburbs.slice(0, showItems);
    return (
        <div className="multi-step-layout">
            <StepLeftSection
                formData={formData}
                header={
                    <React.Fragment>
                        Do you need land or already <span>have land?</span>
                    </React.Fragment>
                }
                text="Builders can help you find the perfect lot. If you already have land, great start!"
            />
            <div className="right-section">
                <div className="section-row with-line active desktop">
                    <button className="btn-step" onClick={() => handlePrevStep()}>Back to previous section</button>
                </div>

                <div className="section-row navigation responsive">
                    <div className="step-number complete" onClick={() => handlePrevStep(2)}>&#10003;</div>
                    <div className="step-number complete" onClick={() => handlePrevStep()}>&#10003;</div>
                    <div className="step-number active">3</div>
                    <div className="step-number">4</div>
                    <div className="step-number">5</div>
                    <div className="step-number">6</div>
                </div>

                <div className="section-row">
                    <div className="step-number active desktop">3</div>
                    <p className="step-title active">Land Requirement</p>
                </div>
                <div className="section-row with-line">
                    <div className="land-step-form">
                        <div className="land-radio">
                            <div
                                className={classnames('land-text', selectedLand === land.NEED_LAND && 'selected')}
                                onClick={() => setStates(land.NEED_LAND)}
                            >
                                I need land
                                {selectedLand === land.NEED_LAND && <div className='icon-vector'/>}
                            </div>
                            <div
                                className={classnames('land-text', selectedLand === land.HAVE_LAND && 'selected')}
                                onClick={() => setStates(land.HAVE_LAND)}
                            >
                                I have land
                                {selectedLand === land.HAVE_LAND && <div className='icon-vector'/>}
                            </div>
                        </div>
                        {land.NEED_LAND === selectedLand && (
                            <div className="suburbs">
                                <div className="header-suburb">Select Suburb:</div>
                                <div className="suburbs-list">
                                    {
                                        shownSuburbs.map(({id, suburb}) => {
                                            const active = selectedSuburbs.includes(id);
                                            return (
                                                <div key={id}
                                                     className={classnames('suburb', active && 'selected')}
                                                     onBlur={validateName}
                                                     onClick={() => onSuburbsSelect(id)}
                                                >{suburb}
                                                </div>);
                                        })
                                    }
                                    {(suburbs.length >= showItems) &&
                                    <div className="more-less"
                                         onClick={() => setShowMore(!showMore)}>{showMore ? 'SHOW LESS' : 'SHOW MORE'}
                                    </div>
                                    }
                                </div>
                            </div>
                        )}

                        {land.HAVE_LAND === selectedLand && (
                            <React.Fragment>
                                <div className="input-row">
                                    <label className="form-label">Lot number</label>
                                    <div className="form-group">
                                        <input
                                            className='lot-number register-input'
                                            placeholder="Write your lot number..."
                                            name="lotNumber"
                                            value={lotNumber.toLocaleString()}
                                            onBlur={validateName}
                                            onChange={(e) => onNumberInputChange(e)}
                                        />
                                        {errors.lotNumber && <div className='invalid-feedback'>{errors.lotNumber}</div>}
                                    </div>
                                </div>
                                <div className="input-row">
                                    <label className="form-label">Street name</label>
                                    <div className="form-group">
                                        <input
                                            className={'street-name register-input'}
                                            placeholder="Write street name..."
                                            name="streetName"
                                            value={streetName}
                                            onBlur={validateName}
                                            onChange={(e) => onInputChange(e)}
                                        />
                                        {errors.streetName &&
                                        <div className='invalid-feedback'>{errors.streetName}</div>}
                                    </div>
                                </div>
                                <div className="input-row">
                                    <label className="form-label">Estate</label>
                                    <div className="form-group">
                                        <input
                                            className={'estate register-input'}
                                            placeholder="Write estate name..."
                                            name="estateName"
                                            value={estateName}
                                            onBlur={validateName}
                                            onChange={(e) => onInputChange(e)}
                                        />
                                        {errors.estateName &&
                                        <div className='invalid-feedback'>{errors.estateName}</div>}
                                    </div>
                                </div>
                                {/*<div className="input-row upload-pdf">*/}
                                {/*    <label className="form-label">Upload Plan of Subdivision</label>*/}
                                {/*    <div className="form-group">*/}
                                {/*        <FileUploader*/}
                                {/*            className="file-upload"*/}
                                {/*            baseUrl='/enquire-once/upload-file'*/}
                                {/*            acceptMime='application/pdf'*/}
                                {/*            fileFieldName='file'*/}
                                {/*            chooseFileButton={*/}
                                {/*                <a className="button default register-input">*/}
                                {/*                    <i className="landspot-icon upload"/>*/}
                                {/*                    Upload PDF*/}
                                {/*                </a>*/}
                                {/*            }*/}
                                {/*            uploadError={PDFUploadError}*/}
                                {/*            uploadSuccess={PDFUploadSuccess}*/}
                                {/*        />*/}
                                {/*    </div>*/}
                                {/*</div>*/}
                            </React.Fragment>
                        )}
                        <button
                            disabled={!validateFields()}
                            className={`btn-step ${validateFields() ? 'next-step' : ''}`}
                            onClick={beforeNextStep}
                        >
                            Next step
                        </button>
                    </div>
                </div>
                <div className="section-row desktop">
                    <div className="step-number">4</div>
                    <p className="step-title active">House Requirements</p>
                </div>
                <div className="section-row with-line"/>
                <div className="section-row desktop">
                    <div className="step-number desktop">5</div>
                    <p className="step-title">Finance</p>
                </div>
                <div className="section-row with-line"/>
                <div className="section-row desktop">
                    <div className="step-number desktop">6</div>
                    <p className="step-title">SMS Verification</p>
                </div>
            </div>
        </div>
    );
};

export default withAlert(LandStep);