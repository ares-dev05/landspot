import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withAlert} from 'react-alert';
import {withRouter} from 'react-router-dom';
import * as actions from '../../store/popupDialog/actions';
import {LoadingSpinner, NiceCheckbox} from '~/helpers';
import NiceDropdown from '~/helpers/NiceDropdown';
import {NiceRadioGroup} from '~/helpers/NiceRadio';
import {PopupModal} from '~/popup-dialog/PopupModal';

class LotmixVisibilityDialogue extends Component {
    static propTypes = {
        onCancel: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired,
        saveLotmixSettings: PropTypes.func.isRequired,
        states: PropTypes.array.isRequired,
        company: PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            chas_lotmix: PropTypes.number.isRequired,
            sitingsSaveSetting: PropTypes.object.isRequired
        }).isRequired,
    };
    constructor(props) {
        super(props);

        this.state = {
            lotmixStateSettings: null,
            stateId: null,
            chasLotmix: 0,
            preloader: false
        };
    }

    componentWillUnmount() {
        this.props.resetDialogStore();
    }

    componentDidMount() {
        const {
            states,
            company: {
                chas_lotmix: chasLotmix,
            }
        } = this.props;

        const lotmixStateSettings = states.reduce((accumulator, state) => {
            accumulator.push({
                state_id: state.id,
                has_lotmix: state.lotmixAccess,
                has_siting_access: state.sitingAccess,
                has_estates_disabled: state.estatesDisabled,
                value: state.lotmixSettingsValue,
                name: state.name
            });
            return accumulator;
        }, []);

        this.setState({lotmixStateSettings, chasLotmix});
    }

    componentDidUpdate(prevProps, prevState) {
        const {
            popupDialog: {message, errors: propsErrors},
            alert: {success, error},
            resetDialogStore,
        } = this.props;
        const {preloader} = this.state;

        if (preloader && preloader === prevState.preloader) {
            this.setState({preloader: false});
        }
        
        if (message && message.success) {
            success(message.success);
            resetDialogStore();
        }

        if (propsErrors) {
            let errors = [];
            typeof propsErrors === 'object'
                ? Object.keys(propsErrors).forEach((error, i) => {
                    const column = propsErrors[error];
                    errors[i] = {
                        message: `${column}`,
                    };
                })
                : errors.push(propsErrors);

            if (errors.length) {
                error(errors.map(
                    (error, errorIndex) => <div key={errorIndex}>{error.message || error}</div>
                ));
            }
            resetDialogStore();
        }

    }

    toggleCompanyLotmixAccess = () => {
        const {states} = this.props;
        const {
            chasLotmix: stateChasLotmix,
            lotmixStateSettings
        } = this.state;
        const chasLotmix = stateChasLotmix ? 0 : 1;

        let newLotmixStateSettings = states.reduce((accumulator, state, index) => {
                accumulator.push({
                    state_id: state.id,
                    value: chasLotmix
                        ? state.lotmixSettingsValue
                        : 0,
                    has_lotmix: chasLotmix
                        ? state.lotmixAccess
                        : 0,
                    has_siting_access: lotmixStateSettings[index].has_siting_access,
                    has_estates_disabled: lotmixStateSettings[index].has_estates_disabled,
                    name: state.name
                });
                return accumulator;
            }, []);

        this.setState({newLotmixStateSettings, chasLotmix});
    };
    
    toggleStateLotmixAccess = selectedState => {
        const {states} = this.props;
        const {lotmixStateSettings} = this.state;

        const stateIndex = lotmixStateSettings.findIndex(s => s.state_id === selectedState.state_id);

        const hasLotmix = selectedState.has_lotmix ? 0 : 1;

        lotmixStateSettings[stateIndex].has_lotmix = hasLotmix;
        lotmixStateSettings[stateIndex].value = hasLotmix
            ? states[stateIndex].lotmixSettingsValue
            : 0;

        this.setState({lotmixStateSettings});
    };

    toggleStateSitingAccess = selectedState => {
        const {lotmixStateSettings} = this.state;

        const stateIndex = lotmixStateSettings.findIndex(s => s.state_id === selectedState.state_id);

        lotmixStateSettings[stateIndex].has_siting_access = selectedState.has_siting_access ? 0 : 1;

        this.setState({lotmixStateSettings});
    };

    toggleStateEstatesDisabled = selectedState => {
        const {lotmixStateSettings} = this.state;

        const stateIndex = lotmixStateSettings.findIndex(s => s.state_id === selectedState.state_id);

        lotmixStateSettings[stateIndex].has_estates_disabled = selectedState.has_estates_disabled ? 0 : 1;

        this.setState({lotmixStateSettings});
    };

    updateStateSetting = ({selectedState, value}) => {
        const {lotmixStateSettings} = this.state;

        const stateIndex = lotmixStateSettings.findIndex(s => s.state_id === selectedState.state_id);

        lotmixStateSettings[stateIndex].value = value;

        this.setState({lotmixStateSettings});
    };

    getSitingsSaveSetting = () => {
        const {chasLotmix} = this.state;
        const {company: {sitingsSaveSetting}} = this.props;

        return chasLotmix
            ? sitingsSaveSetting
            : {0: sitingsSaveSetting[0]};
    };

    saveSettings = () => {
        const {lotmixStateSettings, chasLotmix} = this.state;
        const {company} = this.props;
        this.props.saveLotmixSettings({lotmixStateSettings, chasLotmix}, company);
        this.setState({preloader: true});
    };

    onStateSelect = (stateId) => {
        this.setState({stateId});
    };

    render() {
        const {states} = this.props;
        const {lotmixStateSettings, chasLotmix, stateId, preloader} = this.state;
        const {onCancel} = this.props;
        const selectedState = lotmixStateSettings
            ? lotmixStateSettings.find(s => s.state_id === stateId)
            : null;
        return (
            <PopupModal dialogClassName={'sales-locations overflow-unset'}
                        title={'Sitings and Lotmix Permissions'}
                        onOK={this.saveSettings}
                        onModalHide={onCancel}
            >
                <Fragment>
                    {lotmixStateSettings === null
                        ? <LoadingSpinner className={'overlay'}/>
                        : <div className="form-rows">
                            <div className="form-row">
                                <div className="left-item landspot-input">
                                    <NiceCheckbox
                                        checked={parseInt(chasLotmix)}
                                        name={'chasLotmix'}
                                        label="Company Lotmix Access"
                                        onChange={() => this.toggleCompanyLotmixAccess()}
                                    />
                                </div>
                                <NiceDropdown
                                    defaultItem='Select state'
                                    defaultValue={0}
                                    items={states.map(
                                        state => ({value: state.id, text: state.name})
                                    )}
                                    onChange={(stateId) => this.onStateSelect(stateId)}
                                    value={parseInt(stateId) || 0}
                                />
                            </div>
                            {
                                selectedState &&
                                <Fragment>
                                    <div className="form-row">
                                        <div className="left-item landspot-input">
                                            <NiceCheckbox
                                                checked={parseInt(selectedState.has_lotmix)}
                                                name={`hasLotmix-${selectedState.state_id}`}
                                                label="Lotmix Access"
                                                onChange={() => this.toggleStateLotmixAccess(selectedState)}
                                            />
                                        </div>
                                        <div className="landspot-input">
                                            <NiceRadioGroup
                                                value={selectedState.value}
                                                labels={this.getSitingsSaveSetting()}
                                                name={`state-radio-${selectedState.state_id}`}
                                                onChange={value =>
                                                    this.updateStateSetting({selectedState, value})
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="left-item landspot-input">
                                            <NiceCheckbox
                                                checked={parseInt(selectedState.has_siting_access)}
                                                name={`hasSiting-${selectedState.state_id}`}
                                                label="Siting Access"
                                                onChange={() => this.toggleStateSitingAccess(selectedState)}
                                            />
                                        </div>
                                        <div className="landspot-input">
                                            <NiceCheckbox
                                                checked={parseInt(selectedState.has_estates_disabled)}
                                                name={`hasEstatesDisabled-${selectedState.state_id}`}
                                                label="Disable Estates"
                                                onChange={() => this.toggleStateEstatesDisabled(selectedState)}
                                            />
                                        </div>
                                    </div>
                                </Fragment>
                            }
                        </div>
                    }

                    {preloader && <LoadingSpinner className={'overlay'}/>}
                </Fragment>
            </PopupModal>
        );
    }
}

export default withAlert(withRouter(connect(
    (state => ({
        popupDialog: state.popupDialog,
        company: state.users.company,
        states: state.users.states,
    })), actions
)(LotmixVisibilityDialogue)));