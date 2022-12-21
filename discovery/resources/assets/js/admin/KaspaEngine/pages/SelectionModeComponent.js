import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {isEmpty, get} from 'lodash';

import * as actions from '../store/kaspaEngine/actions';

import {PathNavLink} from '~/helpers';
import {LeftPanel, RightPanel} from '~/helpers/Panels';
import PdfFile from '~/helpers/PdfFile';
import FormulaComponent from '../components/FormulaComponent';
import {GuidelineProfileComponent} from './GuidelineProfileComponent';
import {withAlert} from 'react-alert';

const queryString = require('query-string');


const SelectionModeComponent = ({
                                    location,
                                    history,
                                    formulas,
                                    getFormulas,
                                    getLastFormulas,
                                    resetMessages,
                                    addNewRules,
                                    addedRules,
                                    doc,
                                    errors,
                                    message,
                                    alert
                                }) => {
    const [formulaFiler, setFormulaFiler] = useState('');
    const [selectedFormulas, setSelectedFormulas] = useState([]);
    const [activeFormula, setActiveFormula] = useState(null);

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
        getLastFormulas(location.pathname);
    }, []);

    useEffect(() => {
        if (!addedRules.length) {
            return;
        }
        setSelectedFormulas(addedRules);
    }, [addedRules.length]);

    useEffect(() => {
        const {search} = location;
        const formula = queryString.parse(search).formula || '';
        setFormulaFiler(formula);
        getFormulas({formula});
    }, [location.search]);

    const onRuleFilterChange = (e) => {
        const formula = e.target.value;
        const query = queryString.stringify({formula});

        history.push({
            pathname: location.pathname,
            search: `?${query}`
        });
    };

    const onAddNewRules = () => {
        if (addedRules.length === selectedFormulas.length) {
            return;
        }
        addNewRules({selectedFormulas}, location.pathname);
    };

    return (
        <React.Fragment>
            <LeftPanel className="selection__left-panel">
                <div className="header-wrapper">
                    <header className="border-bottom">Selection Mode</header>
                    <p className="subtitle">Search Formula Library</p>
                    <div className="filter-bar">
                        <div className="filter-form">
                            <div className="landspot-input magnify">
                                <input type="text"
                                       placeholder="Find Rule"
                                       value={formulaFiler}
                                       autoComplete="off"
                                       onChange={onRuleFilterChange}
                                />
                            </div>
                        </div>
                    </div>
                    <hr/>
                </div>
                <div className="forluma-list">
                    {formulas.map((formula) =>
                        <FormulaComponent
                            key={formula.id}
                            selected={activeFormula === formula.id}
                            onFormulaSelect={() => setActiveFormula(formula.id)}
                            onFormulaSave={values => setSelectedFormulas([...selectedFormulas, {formula, values}])}
                            formula={formula}
                        />)}
                </div>
                {!isEmpty(selectedFormulas) && (
                    <div className="last-formula">
                        <hr/>
                        <p className="formula-title">Last selected formula:</p>
                        <FormulaComponent
                            disabled
                            key={addedRules.length + selectedFormulas.length}
                            formula={get(selectedFormulas[selectedFormulas.length - 1], 'formula', {
                                id: 0,
                                description: ''
                            })}
                            values={get(selectedFormulas[selectedFormulas.length - 1], 'values', [])}
                        />
                        <div className="action-block">
                            <p className="action-title">
                                <i className="landspot-icon eye"/>
                                View all <b>{selectedFormulas.length}</b> selected formulas
                            </p>
                            <div className="action-buttons">
                                <PathNavLink
                                    className="button default"
                                    to={GuidelineProfileComponent.componentUrl + '?' + queryString.stringify(location.state)}>
                                    exit
                                </PathNavLink>
                                <button className="button primary"
                                        onClick={onAddNewRules}>
                                    save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </LeftPanel>
            <RightPanel className="selection__right-panel">
                <PdfFile
                    pdfUrl={get(doc, 'fileURL', '')}
                    pdfExist={!!doc}
                />
            </RightPanel>
        </React.Fragment>
    );
};

SelectionModeComponent.componentUrl = '/kaspa-engine/guideline-profiles/section-mode/stage/:id';
SelectionModeComponent.propTypes = {
    estates: PropTypes.array.isRequired,
    addedRules: PropTypes.array.isRequired,
    getEstates: PropTypes.func.isRequired
};

const SelectionModeInstance = withAlert(connect((state => ({
    ...state.kaspaEngine
})), actions)(SelectionModeComponent));

export {SelectionModeInstance, SelectionModeComponent};