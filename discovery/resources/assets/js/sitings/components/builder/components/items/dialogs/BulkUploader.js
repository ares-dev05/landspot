import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {withAlert} from 'react-alert';
import classnames from 'classnames';
import cloneDeep from 'lodash/fp/cloneDeep';

import {clickHandler, fileNameToTitle, randomString, LoadingSpinner} from '~sitings~/helpers';
import * as actions from '../../../store/new-floorplan-form/actions';
import DocumentFileUploader from '../DocumentFileUploader';
import * as FormItem from '../index';

const FloorplansContext = React.createContext({});

class BulkUploader extends React.Component {

    static propTypes = {
        step: PropTypes.number.isRequired,
        storeFloorplanForm: PropTypes.func.isRequired,
        setStep: PropTypes.func.isRequired,
    };

    state = {
        invalidFloorplans: [],
        newFloorplanKey: randomString(),
        floorplanForm: {
            live_date: '',
            state_id: null,
            range: '',
            floorplans: [],
        }
    };

    componentDidMount() {
        this.props.getFloorplanData({id: 0});
        this.props.setupSubmitCallback(this.submitFloorplanForm);
    }

    componentWillUnmount() {
        this.props.setupSubmitCallback(null);
        this.props.resetFloorplanFormStore();
    }

    onFloorplanFormInputChange = (param, value, index) => {
        const {floorplanForm: {floorplans}, newFloorplanKey, invalidFloorplans} = this.state;
        if (index != null) {
            let floorplan;
            const newState = {};

            if (floorplans.length <= index) {
                floorplan = {
                    key: newFloorplanKey,
                    file_dwg: param === 'file_dwg' ? value : null,
                    name: param === 'name' ? value : '',
                };
                newState.newFloorplanKey = randomString();
            } else {
                floorplan = cloneDeep(floorplans[index]);
                const offset = invalidFloorplans.indexOf(floorplan.key);

                if (offset >= 0) {
                    const invalidFloorplansFiltered = [...invalidFloorplans];
                    invalidFloorplansFiltered.splice(offset, 1);
                    newState.invalidFloorplans = invalidFloorplansFiltered;
                }
            }

            const newFloorplans = [...floorplans];

            if (!floorplan.name && param === 'file_dwg') {
                floorplan.name = fileNameToTitle(value.fileName);
            }

            newFloorplans[index] = {...floorplan, ...{[param]: value}};
            newState.floorplanForm = {...this.state.floorplanForm, ...{floorplans: newFloorplans}};

            this.setState(newState);
        } else {
            if (param === 'file_dwg[]') {
                if (!Array.isArray(value)) {
                    value = [value];
                }
                const floorplans = value.map(
                    file => ({
                        key: randomString(),
                        file_dwg: {...file},
                        name: fileNameToTitle(file.fileName)
                    })
                );

                this.setState({
                    floorplanForm: {
                        ...this.state.floorplanForm,
                        ...{floorplans}
                    }
                });
                this.props.setStep(1);

                return;
            }
            this.setState({
                floorplanForm: {
                    ...this.state.floorplanForm,
                    ...{[param]: value}
                }
            });
        }

    };

    static getDerivedStateFromProps(props/*, state*/) {
        const newState = {};
        const {ajaxSuccess, errors/*, floorplanData*/} = props.builderNewFloorplanForm;

        if (ajaxSuccess || errors) {
            if (ajaxSuccess) {
                props.closeDialogue();
                props.alert.success(ajaxSuccess);
            } else {
                newState.submittingFloorplanForm = false;
                const errorMsgs = [];
                Object
                    .keys(errors)
                    .map(key => errorMsgs.push(errors[key].toString()));

                if (errorMsgs.length) {
                    props.alert.error(errorMsgs.join('\n'));
                }
                props.resetMessages();
            }
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    submitFloorplanForm = () => {
        const {step} = this.props;
        const {state_id, range} = this.state.floorplanForm;
        if (step === 0) {
            if (state_id && range) {
                this.props.setStep(1);
            }
        } else {

            if (!this.state.submittingFloorplanForm && this.validateFloorplanForm()) {
                this.setState({submittingFloorplanForm: true});
                this.props.storeFloorplanForm(this.state.floorplanForm);
            }
        }
    };

    validateFloorplanForm = () => {
        const errors = [];
        const {floorplans} = this.state.floorplanForm;
        const invalidFloorplans = floorplans.reduce((acc, floorplan) => {
            if (!floorplan.file_dwg || !floorplan.name || !floorplan.name.trim()) {
                acc.push(floorplan.key);
            }
            return acc;
        }, []);

        if (invalidFloorplans.length > 0) {
            errors.push('Some floorplans are incomplete');
        }

        if (!floorplans.length) {
            errors.push('Please upload some floorplans');
        }

        this.setState({invalidFloorplans});

        if (errors.length) {
            this.props.alert.error(errors.join("\n"));
            return false;
        }

        return true;
    };

    setNextStep = step => {
        const {state_id, range} = this.state.floorplanForm;
        if (step === 1 && state_id && range) {
            this.setState({step});
        }
    };

    deleteUploadedFile = index => this.onFloorplanFormInputChange('file_dwg', null, index);

    render() {
        const {builderNewFloorplanForm: {states, ranges}, step} = this.props;
        const {
            submittingFloorplanForm, invalidFloorplans, newFloorplanKey,
            floorplanForm: {floorplans, state_id, range, live_date}
        } = this.state;

        const contextValues = {
            floorplans,
            invalidFloorplans,
            state: (states && state_id) ? states.find(state => state.id === state_id).name : null,
            range,
            newFloorplanKey,
            deleteUploadedFile: this.deleteUploadedFile,
            onFloorplanFormInputChange: this.onFloorplanFormInputChange
        };
        return (
            <div className={classnames('new-floorplan-form', submittingFloorplanForm && 'is-saving')}>
                {
                    states === null
                        ? <LoadingSpinner isStatic={true}/>
                        : <React.Fragment>
                            {
                                submittingFloorplanForm && <LoadingSpinner/>
                            }
                            {
                                step === 0 &&
                                <StateRangeForm {...{
                                    states, ranges, state_id, range, live_date,
                                    onFloorplanFormInputChange: this.onFloorplanFormInputChange,
                                    setNextStep: this.setNextStep,
                                }}/>
                            }
                            {
                                step === 1 &&
                                <FloorplansContext.Provider value={contextValues}>
                                    <BulkFloorplanForm/>
                                </FloorplansContext.Provider>
                            }
                        </React.Fragment>
                }
            </div>
        );
    }
}

const StateRangeForm = ({states, ranges, state_id, live_date, range, onFloorplanFormInputChange}) => (
    <React.Fragment>
        <FormItem.StatesInput states={states}
                              disabled={false}
                              value={state_id}
                              onFloorplanFormInputChange={onFloorplanFormInputChange}
        />

        <FormItem.RangesInput ranges={ranges}
                              disabled={false}
                              state_id={state_id}
                              value={range}
                              onFloorplanFormInputChange={onFloorplanFormInputChange}
        />

        <div className='floorplan-row live-date-row'>
            <FormItem.LiveDate
                name='bulk'
                live_date={live_date}
                onFloorplanFormInputChange={onFloorplanFormInputChange}
            />
        </div>
        <br/>
        <br/>
        <label>Acceptable files format - DWG, max 20Mb</label>

        <DocumentFileUploader
            buttonTitle='SELECT PLANS'
            disabled={!state_id}
            mimeType='image/vnd.dwg'
            multiple={true}
            buttonClass='button primary'
            uploadURL={`/sitings/plans/upload-document?file_type=DWG`}
            onFileUploaded={data => onFloorplanFormInputChange('file_dwg[]', data)}
        />
    </React.Fragment>
);
const BulkFloorplanForm = () => (
    <FloorplansContext.Consumer>
        {
            ({floorplans, range, state, invalidFloorplans, newFloorplanKey, onFloorplanFormInputChange, deleteUploadedFile}) => (
                <React.Fragment>
                    <div className='bulk-header'>STATE: {state}&nbsp;&nbsp;&nbsp;RANGE: {range}</div>
                    <p>PLAN NAME</p>
                    {
                        floorplans.map(
                            (floorplan, index) =>
                                <FloorplanField key={floorplan.key} {...floorplan}
                                                onFloorplanFormInputChange={
                                                    (arg, value) => onFloorplanFormInputChange(arg, value, index)
                                                }
                                                hasError={invalidFloorplans.indexOf(floorplan.key) >= 0}
                                                deleteUploadedFile={() => deleteUploadedFile(index)}
                                />
                        )
                    }
                    {
                        floorplans.length < 30 &&
                        <FloorplanField name=''
                                        key={newFloorplanKey}
                                        onFloorplanFormInputChange={(arg, value) =>
                                            onFloorplanFormInputChange(arg, value, floorplans.length)}
                        />
                    }
                </React.Fragment>
            )
        }
    </FloorplansContext.Consumer>
);

const FloorplanField = ({
                            file_dwg, name, hasError,
                            onFloorplanFormInputChange, deleteUploadedFile
                        }) => (
    <React.Fragment>
        <div className={classnames('floorplan-row', hasError && 'error')}>
            <input type='text'
                   className='input-box'
                   placeholder='Floorplan name'
                   value={name}
                   onChange={e => onFloorplanFormInputChange('name', e.target.value)}
            />
            <div className='file'>
                {
                    file_dwg ?
                        <React.Fragment>
                            <div className='file-name'>{file_dwg.fileName}
                                <button type='button'
                                        title='Remove file'
                                        className='transparent trash-file'
                                        onClick={e => clickHandler(e, deleteUploadedFile)}>
                                    <i className="fal fa-times"/>
                                </button>
                            </div>
                        </React.Fragment>
                        :
                        <DocumentFileUploader
                            buttonTitle={<React.Fragment><i className="landconnect-icon cloud-upload"
                                              title={'Upload DWG'}/>&nbsp;&nbsp;DWG</React.Fragment>}
                            mimeType='image/vnd.dwg'
                            buttonClass='transparent'
                            uploadURL={`/sitings/plans/upload-document?file_type=DWG`}
                            onFileUploaded={data => onFloorplanFormInputChange('file_dwg', data)}
                        />
                }
            </div>
        </div>
    </React.Fragment>
);

export default withAlert(connect(
    (state => ({builderNewFloorplanForm: state.builderNewFloorplanForm})), actions
)(BulkUploader));