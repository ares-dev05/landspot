import React, {Component} from 'react';
import {PopupModal} from '~/popup-dialog/PopupModal';
import {connect} from 'react-redux';
import {get} from 'lodash';
import * as actions from '../../store/popupDialog/actions';
import FirstEnquireStep from './FirstEnquireStep';
import SecondEnquireStep from './SecondEnquireStep';
import ThirdEnquireStep from './ThirdEnquireStep';
import {EnquireDialogStep} from '../../constants';
import {withAlert} from 'react-alert';

const Title = () => (
    <React.Fragment>
        <div className="logo"/>
        <div className='title'>Enquire</div>
    </React.Fragment>
);

class EnquireDialog extends Component {

    constructor(props) {
        super(props);
        this.state = {
            verified: false
        };
    }

    componentDidMount() {
        const {userActionData, setEnquireState} = this.props;

        setEnquireState({
            companyId: get(userActionData, 'companyId', ''),
            estateId: get(userActionData, 'estateId', ''),
            lotId: get(userActionData, 'lotId', ''),
        });
    }

    static getDerivedStateFromProps(props) {
        const {
            popupDialog: {
                errors,
                enquireState: {
                    emailAlert,
                    verified,
                    companyId,
                    estateId,
                    lotId,
                    formData: {phone, buyerTypeId, regionId}
                },
            },
            alert,
            resetPopupMessages,
            setUserAction,
            resetDialogStore,
            sendCompanyEnquireForm,
            sendEstateEnquireForm,
            setEnquireState
        } = props;

        if (emailAlert) {
            alert.success(emailAlert);
            setUserAction(null);
            resetDialogStore();
        }

        if (verified) {
            if (companyId) {
                sendCompanyEnquireForm({phone, buyerTypeId, regionId}, {id: companyId});
            } else if (estateId) {
                sendEstateEnquireForm({phone, lotId}, {id: estateId});
            } else {
                alert.error('No company id or estate id');
                resetPopupMessages();
            }
            setEnquireState({verified: false});
        }

        if (errors && errors.length) {
            alert.error(errors.map(
                (error, errorIndex) => <div key={errorIndex}>{error.message || error}</div>
            ));
            resetPopupMessages();
        }

        return null;
    }

    setFormState = (data) => {
        const {setEnquireState, popupDialog: {enquireState}} = this.props;
        setEnquireState({formData: {...enquireState.formData, ...data}});
    };

    nextStep = (data, errors = null) => {
        const {alert, popupDialog: {enquireState}, setEnquireState} = this.props;
        if (errors) {
            this.setFormState(data);
            errors.map(error => alert.error(error));
            return false;
        }

        const nextStep = (enquireState.step === EnquireDialogStep.EMAIL && enquireState.companyId)
            ? EnquireDialogStep.nextStep(enquireState.step)
            : EnquireDialogStep.PHONE;

        setEnquireState({step: nextStep, formData: {...enquireState.formData, ...data}});
    };

    sendCode = () => {
        const {alert, popupDialog: {enquireState}, sendSMSVerification} = this.props;
        sendSMSVerification(enquireState.formData);
        alert.success('A confirmation code has been sent to your phone');
    };

    verifyCode = () => {
        const {popupDialog: {enquireState}, verifySMSCode} = this.props;
        const {phone, code} = enquireState.formData;
        verifySMSCode({phone, code});
    };

    handleCloseModal = () => {
        const {setUserAction, resetDialogStore} = this.props;
        setUserAction(null);
        resetDialogStore();
    };

    render() {
        const {popupDialog: {enquireState, loading}, regions, buyerTypes} = this.props;
        return (
            <PopupModal
                title={<Title/>}
                dialogClassName={'enquire-modal'}
                onModalHide={this.handleCloseModal}
                onOK={f => f}
                hideCancelButton
                hideOKButton
            >
                <React.Fragment>
                    {enquireState.step === EnquireDialogStep.EMAIL &&
                    <FirstEnquireStep
                        formState={enquireState.formData}
                        setFormState={this.setFormState}
                        nextStep={this.nextStep}
                    />
                    }
                    {enquireState.step === EnquireDialogStep.REGION &&
                    <SecondEnquireStep
                        formState={enquireState.formData}
                        setFormState={this.setFormState}
                        nextStep={this.nextStep}
                        regions={regions}
                        buyerTypes={buyerTypes}
                    />
                    }
                    {enquireState.step === EnquireDialogStep.PHONE &&
                    <ThirdEnquireStep
                        enquireState={enquireState}
                        setFormState={this.setFormState}
                        nextStep={this.nextStep}
                        sendCode={this.sendCode}
                        verifyCode={this.verifyCode}
                        loading={loading}
                    />
                    }
                </React.Fragment>
            </PopupModal>
        );
    }
}

export default withAlert(connect(
    (state => ({
        popupDialog: state.discoveryPopupDialog,
        regions: state.discoveryCatalogue.regions,
        buyerTypes: state.discoveryCatalogue.buyerTypes,
    })),
    actions
)(EnquireDialog));