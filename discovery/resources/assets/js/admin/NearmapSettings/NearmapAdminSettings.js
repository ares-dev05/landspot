import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {withAlert} from 'react-alert';
import PropTypes from 'prop-types';
import * as actions from './store/settings/actions';
import {LoadingSpinner} from '~/helpers';
import {ContentPanel} from '~/helpers/Panels';

const Titles = {
    nearmap_api_key: 'API Key'
};

class NearmapAdminSettings extends Component {
    static propTypes = {
        getSettings: PropTypes.func.isRequired,
        resetStore: PropTypes.func.isRequired,
        resetDataUpdated: PropTypes.func.isRequired,
        updateSettings: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            preloader: false
        };
    }

    componentDidMount() {
        this.props.getSettings();
    }

    componentWillUnmount() {
        this.props.resetStore();
    }

    static getDerivedStateFromProps(props /*, state*/) {
        const {DATA_UPDATED} = props.nearmapSettingsStore;
        const newState = {};

        if (DATA_UPDATED) {
            newState.preloader = false;
            props.resetDataUpdated();
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    onChange = (setting, value) => {
        if (this.state.preloader===true) {
            return;
        }

        this.setState({preloader: true});
        this.props.updateSettings({[setting]: value});
    };

    render() {
        const {nearmapSettings} = this.props.nearmapSettingsStore;
        const {preloader} = this.state;

        return (
            <ContentPanel className="discovery-manager">
                <header>Nearmap Settings</header>
                <label>Enter the Nearmap API Key below. The Key will be saved automatically to your company account.</label>

                {nearmapSettings === null ? (
                    <LoadingSpinner />
                ) : (
                    <React.Fragment>
                        <div className="form-rows">
                            {Object.keys(nearmapSettings).map(setting => (
                                <div className="form-row" key={setting}>
                                    {/*<label>{Titles[setting]}:</label> &nbsp;&nbsp;*/}

                                    <Setting
                                        disabled={preloader}
                                        type={setting}
                                        value={nearmapSettings[setting]}
                                        onChange={value =>
                                            this.onChange(setting, value)
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </React.Fragment>
                )}

                {preloader && <LoadingSpinner className={'overlay'} />}
            </ContentPanel>
        );
    }
}

const Setting = ({type, value, onChange, disabled}) => {
    let item = null;
    switch (type) {
        case 'nearmap_api_key': {
            item = <Fragment>
                <div className='landspot-input'
                    style={{width:'100%'}}>
                    <input type='password'
                           disabled={disabled}
                           value={value}
                           maxLength={64}
                           onChange={e => onChange && onChange(e.target.value)}
                    />
                </div>
            </Fragment>;
        }
    }

    return item;
};

export default withAlert(
    connect(
        state => ({
            nearmapSettingsStore: state.nearmapSettingsStore
        }),
        actions
    )(NearmapAdminSettings)
);
