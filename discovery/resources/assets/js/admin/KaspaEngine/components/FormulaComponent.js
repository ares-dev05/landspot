import React, {useState} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {isEmpty, get} from 'lodash';

const FormulaComponent = ({formula, values, disabled, onFormulaSave, selected, onFormulaSelect, order}) => {
    const regex = new RegExp(/({{.*?}})/, 'g');
    const matches = get(formula, 'description', '').match(regex) || [];
    const [formulaValue, setFormulaValues] = useState((isEmpty(values) ? new Array(matches.length).fill(0) : values));

    const parts = get(formula, 'description', '').split(regex);

    function onInputChange({target}) {
        const numberRegex = /^[0-9\b]+$/;
        if (target.value === '' || numberRegex.test(target.value)) {
            const newValues = formulaValue.map((v, i) => i == target.dataset.index ? target.value : v);
            setFormulaValues(newValues);
        }
    }

    function formatFormula() {
        let pointer = 0;
        return parts.map((part, index) => matches.includes(part)
            ? <span className='text' key={index}>
                <input disabled={disabled}
                       data-index={pointer}
                       value={part.replace(regex, formulaValue[pointer++])}
                       onChange={onInputChange}/>
                {part.replace(/{|}|[xX]/gi, '')}
            </span>
            : part
        );
    }

    return (
        <div className={classnames('formula', disabled ? 'formula-disabled' : '', selected ? 'formula-selected' : '')}
             onClick={onFormulaSelect}>
            <p>
                {order && <span className='order'>{order}</span>}
                {formatFormula()}
            </p>
            {
                selected &&
            <button
                className="button default" onClick={() => onFormulaSave(formulaValue)}>
                <i className="fal fa-plus"/> Add
            </button>
            }
        </div>
    );
};

FormulaComponent.propTypes = {
    values: PropTypes.array,
    formula: PropTypes.shape({
        id: PropTypes.number.isRequired,
        description: PropTypes.string.isRequired
    }),
    onFormulaSave: PropTypes.func,
    selected: PropTypes.bool,
    disabled: PropTypes.bool
};

FormulaComponent.defaultProps = {
    onFormulaSelect: () => {},
    onFormulaSave: () => {},
    values: [],
    disabled: false,
    selected: false
};

export default FormulaComponent;