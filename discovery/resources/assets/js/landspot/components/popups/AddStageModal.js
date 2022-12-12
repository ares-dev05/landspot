import React from 'react';
import PropTypes from 'prop-types';
import {withAlert} from 'react-alert';
import {PopupModal} from '~/popup-dialog/PopupModal';
import {LoadingSpinner} from '~/helpers';
import {connect} from 'react-redux';
import * as actions from '../../store/estate/actions';
import {resetDialogStore} from '../../store/popupDialog/actions';
import {FormRowInput} from '~/helpers/FormRow';


class AddStageModal extends React.Component {

    static propTypes = {
        estate: PropTypes.object.isRequired,
        addStage: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            error: false,
            name: '',
            preloader: false
        };
    }

    componentDidUpdate() {
        const {
            popupDialog: {ESTATE_UPDATED},
            alert: {success},
            onCancel
        } = this.props;

        if (ESTATE_UPDATED) {
            success('The new stage has been successfully created');
            onCancel();
        }
    }

    componentWillUnmount() {
        this.props.resetDialogStore();
    }

    submitHandler = () => {
        const {
            estate,
            addStage,
            alert: {info},
            filters
        } = this.props;
        const {name} = this.state;

        if (name) {
            addStage({name, filters}, estate);
            this.setState({preloader: true});
        } else {
            info('Stage name is required');
            this.setState({error: true});
        }
    };

    saveValue = (name) => {
        this.setState({name, error: false});
    };

    render() {
        const {onCancel} = this.props;
        const {error, preloader, name} = this.state;
        return (
            <PopupModal okButtonTitle={'Save'}
                        dialogClassName={'overflow-unset'}
                        title={'Add Stage'}
                        onOK={this.submitHandler}
                        onModalHide={onCancel}>
                <React.Fragment>
                    {preloader && <LoadingSpinner className={'overlay'}/>}
                    <div className='form-rows'>
                        <FormRowInput id='name'
                                      label='Stage Name'
                                      inputClassName={error ? 'has-error' : null}
                                      placeholder="Stage Name"
                                      maxLength='40'
                                      onChange={e => this.saveValue(e.target.value)}
                                      value={name}
                        />
                    </div>
                </React.Fragment>
            </PopupModal>
        );
    }
}

export default withAlert(connect(
    (state => ({
        popupDialog: state.popupDialog,
        estate: state.estate.estate
    })), {...actions, resetDialogStore}
)(AddStageModal));
