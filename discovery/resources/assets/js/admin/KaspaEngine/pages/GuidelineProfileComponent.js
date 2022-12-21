import React, {useState, useEffect} from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {get} from 'lodash';
import {withAlert} from 'react-alert';

import * as actions from '../store/kaspaEngine/actions';

import {success as actionSuccess, error as actionError} from '~/axios/api';
import {LeftPanel, RightPanel} from '~/helpers/Panels';
import {SelectionModeComponent} from './SelectionModeComponent';
import {PathNavLink, LoadingSpinner} from '~/helpers';
import GuidelineFile from '../components/GuidelineFile';
import FormulaComponent from '../components/FormulaComponent';

const queryString = require('query-string');

const GuidelineProfileComponent = ({
                                       location,
                                       history,
                                       estates,
                                       getEstates,
                                       getLastFormulas,
                                       resetMessages,
                                       removeRule,
                                       loading,
                                       updatePackage,
                                       deletePackage,
                                       addedRules,
                                       alert,
                                       errors,
                                       message
                                   }) => {
    const [state, setState] = useState({
        estateFilter: '',
        selectedTab: {},
        tabExpanded: false,
        confirmDelete: false,
        uploadingFile: false,
        preloader: false
    });

    useEffect(() => {
        if (!errors.length) {
            return;
        }
        alert.error(errors);
    }, [errors]);

    useEffect(() => {
        if (!message.length) {
            return;
        }
        alert.success(message);
        resetMessages();
    }, [message]);

    useEffect(() => {
        const {search} = location;
        const parsed = queryString.parse(search);
        const estateFilter = parsed.estate || '';
        if (parsed.stage_id) {
            getLastFormulas(SelectionModeComponent.componentUrl.replace(':id', parsed.stage_id));
        }
        getEstates({estate: estateFilter});
        updateState({estateFilter});
    }, [location.search]);

    useEffect(() => {
        const {search} = location;
        const parsed = queryString.parse(search);
        const estateId = state.selectedTab.estate ? state.selectedTab.estate.id : parsed.estate_id;
        if (!estates.length || !estateId) {
            return;
        }
        const estate = estates.find(estate => estate.id == estateId);
        const stage = estate && (state.selectedTab.stage
            ? estate.stage.find(stage => stage.id === state.selectedTab.stage.id)
            : parsed.stage_id
                ? estate.stage.find(stage => stage.id == parsed.stage_id)
                : get(estate.stage, '[0]', ''));
        updateState({selectedTab: {estate, stage}});
    }, [estates]);

    const updateState = data => {
        setState({...state, ...data});
    };

    const updateQuery = data => {
        const search = {...queryString.parse(location.search), ...data};
        return queryString.stringify(search);
    };

    const getSpecialQuery = (key) => {
        return get(queryString.parse(location.search), `${key}`, null)
    };

    const onEstateFilterChange = (e) => {
        const estate = e.target.value;
        const query = updateQuery({estate});

        history.push({
            pathname: location.pathname,
            search: `?${query}`
        });
    };

    const onSelectionItem = (selectedEstate, selectedStage) => {
        const stage = selectedStage || get(selectedEstate.stage, '[0]', '');
        const estate = selectedEstate;
        const estate_id = estate && estate.id;
        const stage_id = stage && stage.id;
        const query = updateQuery({estate_id, stage_id});
        updateState({
            selectedTab: {
                estate: selectedEstate,
                stage: stage
            }
        });
        history.push({
            pathname: GuidelineProfileComponent.componentUrl,
            search: `?${query}`
        });
    };

    const onUpdatePackage = (payload) => {
        updatePackage({data: payload}, actionSuccess);
    };

    const onUpdatePackageError = (payload = {}) => {
        const error = payload.response ? payload : {response: {data: payload}};
        updatePackage({error}, actionError);
    };

    const onUpdatePackageProgress = () => {
        updatePackage();
    };

    const onDeletePackage = (confirmDelete, id) => {
        if (confirmDelete) {
            deletePackage({id});
        }
        updateState({confirmDelete: false});
    };

    const onConfirmDelete = confirmDelete => {
        updateState({confirmDelete});
    };

    const Profile = ({addedRules = [], removeRule}) => {
        const selectionModePath = SelectionModeComponent.componentUrl.replace(
            ':id',
            state.selectedTab.stage && state.selectedTab.stage.id
        );
        return (
            <div className="selected-estate">
                <div className="header">
                    <h1>
                        <span>{(state.selectedTab.estate && state.selectedTab.estate.name)}&nbsp;</span>
                        <span>{(state.selectedTab.stage && state.selectedTab.stage.name)}</span>
                    </h1>
                    <PathNavLink
                        to={{
                            pathname: selectionModePath,
                            state: {
                                estate_id: getSpecialQuery('estate_id'),
                                stage_id: getSpecialQuery('stage_id')
                            }
                        }}
                        className="button primary">Selection mode</PathNavLink>
                </div>
                <div className="guidelines">
                    <div className="title">
                        CURRENT GUIDELINES:
                    </div>
                    {
                        state.selectedTab.stage &&
                        <GuidelineFile
                            onUpdatePackage={onUpdatePackage}
                            onUpdatePackageError={onUpdatePackageError}
                            onUpdatePackageProgress={onUpdatePackageProgress}
                            onDeletePackage={onDeletePackage}
                            onConfirmDelete={onConfirmDelete}
                            uploadingFile={state.uploadingFile}
                            confirmDelete={state.confirmDelete}
                            stage={state.selectedTab.stage}
                            doc={state.selectedTab.stage.stage_docs.find(item => item.type === 2)}
                        />
                    }
                </div>
                <div className="siting-requirements">
                    <h2>Siting Requirements</h2>
                    {
                        addedRules.map((rule, index) =>
                            <div
                                className="requirement"
                                key={index + rule.id}
                            >
                                <FormulaComponent
                                    disabled
                                    order={`1.${index + 1}`}
                                    key={index + rule.id}
                                    formula={rule.formula}
                                    values={rule.values}
                                />
                                <div
                                    className='remove'
                                    onClick={() => removeRule({formula_id: rule.id}, selectionModePath)}>
                                    <i className='landspot-icon times'/>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        );
    };

    return (
        <React.Fragment>
            <LeftPanel>
                <div className="header-wrapper">
                    <header>Guideline Profile</header>
                    <div className="filter-bar">
                        <div className="filter-form">
                            <div className="landspot-input magnify">
                                <input type="text"
                                       placeholder="Search Estate"
                                       value={state.estateFilter}
                                       autoComplete="off"
                                       onChange={onEstateFilterChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="engine-tabs">
                    <p className="tab-title">My estates</p>
                    <div className="tab-list">
                        {estates.map(estate => (
                            <React.Fragment key={estate.id}>
                                <div
                                    onClick={() => onSelectionItem(estate)}
                                    className={classnames('tab', state.selectedTab.estate && estate.id === state.selectedTab.estate.id ? 'active' : '')}>
                                    <span>{estate.name}</span>
                                    {
                                        state.selectedTab.estate && estate.id === state.selectedTab.estate.id
                                        && (<i className="fal fa-angle-right fa-2x"/>)
                                    }
                                </div>
                                <div
                                    className={classnames('sub-list', (state.selectedTab.estate && state.selectedTab.estate.id === estate.id) ? 'open' : '')}>
                                    {
                                        estate.stage.map(stage =>
                                            <div
                                                key={stage.id}
                                                onClick={() => onSelectionItem(estate, stage)}
                                                className={classnames('tab', state.selectedTab.stage && stage.id === state.selectedTab.stage.id ? 'sub-active' : '')}>
                                                <span className='sub-tab'>{stage.name}</span>
                                            </div>
                                        )
                                    }
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </LeftPanel>
            <RightPanel>
                {loading && (<LoadingSpinner className="overlay"/>)}
                {!state.selectedTab.estate && estates.length > 0 && <h1>Select the stage</h1>}
                {estates.length === 0 && <h1>No estate found</h1>}
                {!loading && state.selectedTab.estate && estates.length > 0 && (
                    <Profile
                        addedRules={addedRules}
                        removeRule={removeRule}
                    />
                )}
            </RightPanel>
        </React.Fragment>
    );
};

GuidelineProfileComponent.componentUrl = '/kaspa-engine/guideline-profiles';
GuidelineProfileComponent.propTypes = {
    estates: PropTypes.array.isRequired,
    getEstates: PropTypes.func.isRequired
};

const GuidelineProfileInstance = withAlert(connect((state => ({
    ...state.kaspaEngine
})), actions)(GuidelineProfileComponent));

export {GuidelineProfileInstance, GuidelineProfileComponent};