import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withAlert} from 'react-alert';
import PropTypes from 'prop-types';
import {NiceRadioGroup} from '~/helpers/NiceRadio';
import * as actions from './store/settings/actions';
import {LoadingSpinner} from '~/helpers';
import {ContentPanel} from '~/helpers/Panels';

const Titles = {
    job_email_notifications: 'Enable all email notifications'
};

class SiteAdminSettings extends Component {
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
        const {DATA_UPDATED} = props.siteSettingsStore;
        const newState = {};

        if (DATA_UPDATED) {
            newState.preloader = false;
            props.resetDataUpdated();
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    onChange = (setting, value) => {
        this.setState({preloader: true});
        this.props.updateSettings({[setting]: value});
    };

    render() {
        const {siteSettings} = this.props.siteSettingsStore;
        const {preloader} = this.state;
        return (
            <ContentPanel className="discovery-manager">
                <header>Landspot settings</header>

                {siteSettings === null ? (
                    <LoadingSpinner />
                ) : (
                    <React.Fragment>
                        <div className="form-rows">
                            {Object.keys(siteSettings).map(setting => (
                                <div className="form-row" key={setting}>
                                    <label>{Titles[setting]}:</label>
                                    &nbsp;&nbsp;
                                    <Setting
                                        {...siteSettings[setting]}
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

const Setting = ({type, value, onChange}) => {
    let item = null;
    switch (type) {
        case 'job_email_notifications': {
            item = <NiceRadioGroup {...{name, value, onChange}} />;
        }
    }

    return item;
};

export default withAlert(
    connect(
        state => ({
            siteSettingsStore: state.siteSettingsStore
        }),
        actions
    )(SiteAdminSettings)
);
