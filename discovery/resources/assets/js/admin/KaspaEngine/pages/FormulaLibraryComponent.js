import React, {useState, useEffect} from 'react';
import {LeftPanel, RightPanel} from '~/helpers/Panels';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {isEmpty} from 'lodash';
import * as actions from '../store/kaspaEngine/actions';
import {LoadingSpinner} from '~/helpers';
import FormulaComponent from '../components/FormulaComponent';

const queryString = require('query-string');

const FormulaLibraryComponent = ({location, history, formulas, getFormulas, loading}) => {
    const [formulaFilter, setFormulaFilter] = useState('');
    const [selectedFormula, setFormula] = useState({});

    useEffect(() => {
        const {search} = location;
        const formula = queryString.parse(search).formula || '';
        setFormulaFilter(formula);
        getFormulas({formula});
    }, [location.search]);

    function onEstateFilterChange(e) {
        const formula = e.target.value;
        const query = queryString.stringify({formula});

        history.push({
            pathname: location.pathname,
            search: `?${query}`
        });
    }

    const hardCodedFormulas = [{id: 1, name: 'Siting Requirements'}];
    return (
        <React.Fragment>
            <LeftPanel>
                <div className="header-wrapper">
                    <header>Formula Library</header>
                    <div className="filter-bar">
                        <div className="filter-form">
                            <div className="landspot-input magnify">
                                <input type="text"
                                       placeholder="Search Formulas"
                                       value={formulaFilter}
                                       autoComplete="off"
                                       onChange={onEstateFilterChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="engine-tabs">
                    <p className="tab-title">Formula Type</p>
                    <div className="tab-list">
                        {hardCodedFormulas.map(formulas => (
                            <div key={formulas.id}
                                 onClick={() => setFormula(formulas)}
                                 className={classnames('tab', formulas.id === selectedFormula.id ? 'active' : '')}>
                                <span>{formulas.name}</span>
                                {
                                    formulas.id === selectedFormula.id
                                    && (<i className="fal fa-angle-right fa-2x"/>)
                                }
                            </div>
                        ))}
                    </div>
                </div>
            </LeftPanel>
            <RightPanel>
                {
                    loading
                        ? (<LoadingSpinner className="overlay"/>)
                        : isEmpty(selectedFormula)
                        ? (<h1>Select the formula</h1>)
                        : (
                            <div className="selected-estate">
                                <div className="header">
                                    <h1>{selectedFormula.name}</h1>
                                </div>
                                <div className="requirement-description">
                                    All Siting Requirement formulas are related to the placement of a floorplan on a lot
                                    of land.
                                </div>
                                <div className="siting-requirements">
                                    <h2>Siting Requirements</h2>
                                    {formulas.map((formula, index) =>
                                        <div
                                            key={index + formula.id}
                                            className="requirement"
                                        >
                                            <FormulaComponent
                                                disabled
                                                order={`1.${index + 1}`}
                                                key={index + formula.id}
                                                formula={formula}
                                            />
                                        </div>
                                    )}

                                </div>
                            </div>
                        )
                }
            </RightPanel>
        </React.Fragment>
    );
};

FormulaLibraryComponent.componentUrl = '/kaspa-engine/formula-library';
FormulaLibraryComponent.propTypes = {
    estates: PropTypes.array.isRequired,
    getEstates: PropTypes.func.isRequired
};

export default connect((state => ({
    ...state.kaspaEngine
})), actions)(FormulaLibraryComponent);