import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withAlert} from 'react-alert';
import classnames from 'classnames';
import cloneDeep from 'lodash/fp/cloneDeep';

import {LoadingSpinner} from '~sitings~/helpers';
import * as actions from '~sitings~/components/popup-dialog/store/actions'
import * as FormItem from '../index';

const DefaultFloorplanFormData = Object.freeze({
    state_id: '',
    range: '',
    status: '',
    name: '',
    file_dwg: [],
    static_file_dwg: [],
    floorplanId: null,
    live_date: '',
    update_note: '',
});

class EditFloorplanForm extends React.Component {
    static propTypes = {
        popupDialogStore: PropTypes.shape({
            history: PropTypes.array,
            ranges: PropTypes.array,
            states: PropTypes.array,
        }).isRequired,
        closeDialogue: PropTypes.func.isRequired,
        filters: PropTypes.object.isRequired,
        permissions: PropTypes.object.isRequired,
        floorplanId: PropTypes.number,
        updateFloorplan: PropTypes.func.isRequired,
        getFloorplanData: PropTypes.func.isRequired,
        resetMessages: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired,
        setupSubmitCallback: PropTypes.func.isRequired,
        storeFloorplanForm: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            floorplanForm: cloneDeep(DefaultFloorplanFormData),
            submittingFloorplanForm: false,
        };
    }

    componentDidMount() {
        const {floorplanId} = this.props;
        this.props.getFloorplanData({id: floorplanId || 0});
        this.props.setupSubmitCallback(this.submitFloorplanForm);
    }

    componentWillUnmount() {
        this.props.setupSubmitCallback(null);
        this.props.resetDialogStore();
    }

    onFloorplanFormInputChange = (name, value, arg) => {
        let newValue;
        const {floorplanForm} = this.state;

        switch (name) {
            case 'file_dwg':
                if (value === null && arg >= 0) {
                    newValue = [...floorplanForm[name]];
                    newValue.splice(arg)
                } else {
                    newValue = [...floorplanForm[name], value];
                }
                break;

            default:
                newValue = value;
        }

        const newFormData = {[name]: newValue};

        this.setState({
            floorplanForm: {...floorplanForm, ...newFormData}
        });
    };

    static getDerivedStateFromProps(props, state) {
        const newState = {};
        const {ajaxSuccess, errors, floorplanData} = props.popupDialogStore;

        if (ajaxSuccess || errors) {
            if (ajaxSuccess) {
                props.closeDialogue();
                props.alert.success(ajaxSuccess);
                props.resetMessages();
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

        if (!state.floorplanForm.floorplanId && floorplanData) {
            newState.floorplanForm = {
                ...state.floorplanForm, ...{
                    floorplanId: floorplanData.id,
                    range: floorplanData.range.name,
                    state_id: floorplanData.range.state_id,
                    live_date: floorplanData.live_date,
                    name: floorplanData.name,
                    status: floorplanData.status,
                    static_file_dwg: floorplanData.files.map(file => ({
                        fileName: file.name
                    }))
                }
            }
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    submitFloorplanForm = () => {
        const {isAdmin, isContractor} = this.props.permissions;
        const {floorplanForm} = this.state;

        if ((isAdmin || floorplanForm.status === 'Attention' || floorplanForm.status === 'Active') && !isContractor) {
            if (!this.state.submittingFloorplanForm && this.validateFloorplanForm()) {
                this.setState({submittingFloorplanForm: true});

                if (floorplanForm.floorplanId) {
                    this.props.updateFloorplan(
                        {id: floorplanForm.floorplanId}, floorplanForm, this.state.filters
                    );
                } else {
                    this.props.storeFloorplanForm(floorplanForm);
                }
            }
        } else {
            return false;
        }
    };

    validateFloorplanForm = () => {
        if (this.props.permissions.isAdmin) {
            return true;
        }
        const validator = {
            state_id: 'Please select a state',
            name: 'Please enter a floorplan name',
            file_dwg: 'Please upload a DWG file',
        };

        const {floorplanForm} = this.state;
        if (floorplanForm.floorplanId) {
            validator.update_note = 'Please describe your update';
        }

        const errors = Object
            .keys(validator)
            .reduce((accumulator, key) => {
                const value = floorplanForm[key];
                let msg;

                if ((Array.isArray(value) && !value.length) || !value || /^\s*$/.test(value.toString())) {
                    msg = validator[key];
                }

                if (msg) {
                    accumulator.push(msg);
                }

                return accumulator;
            }, [])
            .map(item => <div key={item}>{item}</div>);

        if (errors.length) {
            this.props.alert.error(errors);
            return false;
        }

        return true;
    };

    deleteUploadedFile = index => this.onFloorplanFormInputChange('file_dwg', null, index);

    render() {
        const {permissions, popupDialogStore: {states, ranges}} = this.props;
        const {floorplanForm, stateName, submittingFloorplanForm} = this.state;

        return (
            <React.Fragment>
                <div className={classnames('new-floorplan-form', submittingFloorplanForm && 'is-saving')}>
                    {
                        states == null
                            ? <LoadingSpinner isStatic={true}/>
                            : <React.Fragment>
                                {
                                    submittingFloorplanForm && <LoadingSpinner/>
                                }
                                <FloorplanForm
                                    {...{states, ranges, permissions}}
                                    floorplanForm={floorplanForm}
                                    stateName={stateName}
                                    deleteUploadedFile={this.deleteUploadedFile}
                                    onFloorplanFormInputChange={this.onFloorplanFormInputChange}
                                    submitFloorplanForm={this.submitFloorplanForm}
                                />
                            </React.Fragment>
                    }
                </div>
            </React.Fragment>
        );
    }
}

const FloorplanForm = ({
                           states,
                           ranges,
                           permissions,
                           floorplanForm,
                           onFloorplanFormInputChange,
                           deleteUploadedFile,
                       }) => (
    <React.Fragment>
        <FormItem.FloorplanStatus {...{floorplanForm, permissions}}
                                  onFloorplanFormInputChange={onFloorplanFormInputChange}
        />
        <FormItem.StatesInput states={states}
                              disabled={!!floorplanForm.floorplanId}
                              value={floorplanForm.state_id}
                              onFloorplanFormInputChange={onFloorplanFormInputChange}
        />

        <FormItem.RangesInput ranges={ranges}
                              disabled={!!floorplanForm.floorplanId}
                              state_id={floorplanForm.state_id}
                              value={floorplanForm.range}
                              onFloorplanFormInputChange={onFloorplanFormInputChange}
        />

        <FormItem.FloorplanFiles onFloorplanFormInputChange={onFloorplanFormInputChange}
                                 disabled={!floorplanForm.floorplanId || !permissions.isAdmin}
                                 {...floorplanForm}
        />

        <FormItem.UploadedFileList {...floorplanForm}
                                   deleteUploadedFile={deleteUploadedFile}
                                   onFloorplanFormInputChange={onFloorplanFormInputChange}
        />

        <FormItem.LiveDate {...floorplanForm} onFloorplanFormInputChange={onFloorplanFormInputChange}/>

    </React.Fragment>
);

export default withAlert(connect(
    (state => ({
        popupDialogStore: state.popupDialog,
        builderNewFloorplanForm: state.builderNewFloorplanForm,
    })), actions
)(EditFloorplanForm));