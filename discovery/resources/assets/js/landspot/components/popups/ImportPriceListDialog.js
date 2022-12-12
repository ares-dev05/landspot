import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withAlert} from 'react-alert';
import classnames from 'classnames';
import {PopupModal, ConfirmDialog} from '~/popup-dialog/PopupModal';
import {LoadingSpinner, clickHandler} from '~/helpers';
import {connect} from 'react-redux';
import * as actions from '../../store/estate/actions';
import {resetDialogStore} from '../../store/popupDialog/actions';

const PriceListContext = React.createContext();

class ImportPriceListDialog extends Component {
    static propTypes = {
        stage: PropTypes.object.isRequired,
        priceEditor: PropTypes.bool.isRequired,
        columns: PropTypes.array.isRequired,
        onCancel: PropTypes.func.isRequired,
        savePriceList: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.defaultLotValues = null;

        this.state = {
            columns: [],
            lots: [],
            errors: [],
            savingPriceList: false,
            preloader: false,
            lotUid: null,
            columnAttrName: null,
        };
    }

    componentDidMount() {
        const {columns: propsColumns} = this.props;

        const columns   = propsColumns.filter(column => column.column_type !== 'dynamic');
        const lotValues = {};
        columns.map(column => lotValues[column['attr_name']] = '');
        this.defaultLotValues = lotValues;

        const lots = this.fillLotsList([], 10);
        this.setState({columns, lots});

        document.addEventListener('paste', this.onPaste);
    }

    fillLotsList = (lots, length) => {
        for (let i = 0; i <= length; i++) {
            const lot = this.getNewLot();
            lots      = lots.concat(lot);
        }
        return lots;
    };

    getNewLot = () => {
        return {...this.defaultLotValues, uuid: Math.round(Math.random() * 1e6)};
    };

    componentDidUpdate() {
        const {
            errors,
        } = this.props;

        if (errors) {
            this.setState({preloader: false});
        }
    }

    componentWillUnmount() {
        this.props.resetDialogStore();
        document.removeEventListener('paste', this.onPaste);
    }

    onPaste = (event) => {
        const {
            alert: {info},
            priceEditor
        } = this.props;
        const {columns, lotUid, columnAttrName, lots: stateLots} = this.state;

        if (!columnAttrName || !lotUid) {
            return;
        }

        this.setState({
            preloader: true,
        });

        let pastedData = '',
            textHTML   = event.clipboardData.getData('text/html');

        if (textHTML && /<table[^>]*>/i.test(textHTML)) {
            pastedData = tableToArray(textHTML);
        } else {
            pastedData = event.clipboardData.getData('text/plain');
        }

        const inputArray = typeof pastedData !== 'string' ? pastedData : parseString(pastedData);

        if (inputArray.length === 0) {
            info('Empty Price List. Please try again according to the instructions.', {timeout: 10000});
            this.setState({preloader: false});
            return;
        }

        if (inputArray.length === 1 && inputArray[0].length === 1) {
            this.changeLotValue({lotUid, columnAttrName, value: inputArray[0][0]});
            this.setState({preloader: false});
            return;
        }

        const startColumn = columns.findIndex(column => column['attr_name'] === columnAttrName);
        const startRow    = stateLots.findIndex(lot => lot['uuid'] === lotUid);
        const endRow      = startRow + inputArray.length - 1;
        const endColumn   = startColumn + inputArray[0].length;
        let lots          = stateLots;

        const newValuesMaxRow    = inputArray.length - 1;
        const newValuesMaxColumn = columns.length < endColumn ? columns.length : endColumn;

        for (let row = startRow, valuesRow = 0; row <= endRow; row += 1) {
            let newRow = lots[row]
                ? {...lots[row]}
                : this.getNewLot();

            for (let column = startColumn, valuesColumn = 0; column < newValuesMaxColumn; column += 1) {
                const currentColumn = columns[column];
                let value = inputArray[valuesRow][valuesColumn].trim();

                if (!value && currentColumn['attr_name'] === 'lot_number') {
                    value = row + 1;
                } else if (!priceEditor && currentColumn['attr_name'] === 'price') {
                    value = null;
                }
                if(currentColumn['attr_name'] === 'price' && value) {
                    value = value.replace(/[, ]/g, '');
                }
                newRow[currentColumn['attr_name']] = value;
                valuesColumn = valuesColumn === newValuesMaxColumn ? 0 : valuesColumn += 1;
            }

            lots[row] = newRow;
            valuesRow = valuesRow === newValuesMaxRow ? 0 : valuesRow += 1;
        }

        this.setState({lots, preloader: false});
    };

    savePriceList = (confirmedSave) => {
        const {
            stage,
            savePriceList,
            filters
        } = this.props;
        const state = {savingPriceList: false};

        if (confirmedSave) {
            state.preloader = true;
            const lots = this.validateLots();

            savePriceList({lots, filters}, stage);
        }
        this.setState(state);
    };

    validateLots = () => {
        const {lots: stateLots, columns} = this.state;

        return stateLots.filter(lot => {
            const isFilled = [];

            columns.map(column => {
                if (!lot[column['attr_name']]) {
                    isFilled.push(column['attr_name']);
                }
            });

            return isFilled.length !== columns.length;
        });
    };

    onSave = () => {
        const {
            alert: {info},
        } = this.props;
        const lots = this.validateLots();

        if (!lots.length) {
            info('Empty Price List. Please try again according to the instructions.');
            return;
        }

        this.setState({savingPriceList: true});
    };

    changeLotValue = ({columnAttrName, lotUid, value}) => {
        const {lots} = this.state;
        const lotIndex = lots.findIndex(lot => lot.uuid === lotUid);

        if(lotIndex >= 0) {
            if (columnAttrName === 'price') {
                value = value.replace(/[, ]/g, '');
            }
            lots[lotIndex][columnAttrName] = value;

            this.setState({lots});
        }
    };

    selectCell = ({lotUid, columnAttrName}) => {
        this.setState({lotUid, columnAttrName});
    };

    clearTable = () => {
        const lots = this.fillLotsList([], 10);
        this.setState({lots});
    };

    render() {
        const {onCancel, priceEditor, stage} = this.props;
        const {preloader, savingPriceList} = this.state;

        const contextValues = {
            state: this.state,
            priceEditor,
            changeLotValue: this.changeLotValue,
            selectCell: this.selectCell,
        };

        return (
            <PopupModal okButtonTitle={'Save'}
                        dialogClassName={'wide-popup import-price-list'}
                        title={'Import Price List'}
                        onOK={this.onSave}
                        onModalHide={onCancel}>
                <React.Fragment>
                    {preloader && <LoadingSpinner className={'overlay'}/>}

                    {
                        savingPriceList &&
                        <ConfirmDialog onConfirm={() => this.savePriceList(true)}
                                       userActionData={{}}
                                       onCancel={() => this.savePriceList(false)}>
                            <p>Are you sure you want to store this price list for <b>{stage.name}</b> stage?</p>
                        </ConfirmDialog>
                    }

                    <div className="mass-action">
                        <a href={'#'} onClick={(e) => clickHandler(e, this.clearTable())}>
                            Clear all
                        </a>
                    </div>

                    <PriceListContext.Provider value={contextValues}>
                        <LotsTable/>
                    </PriceListContext.Provider>

                    <div className='instruction'>
                        <ol>
                            <li>Open Price list CSV/XLS file.</li>
                            <li>Press Ctrl + A (Cmd + A) and Ctrl + C (Cmd + C).</li>
                            <li>Click back on this webpage.</li>
                            <li>Press Ctrl + V (Cmd + V) to upload the Price List.</li>
                        </ol>
                    </div>
                </React.Fragment>
            </PopupModal>
        );
    }
}

function isHTMLTable(element) {
    return (element && element.nodeName || '').toLowerCase() === 'table';
}

function tableToArray(element) {
    let result = [];
    let checkElement = element;

    if (typeof checkElement === 'string') {
        let tempElem       = document.createElement('div');
        tempElem.innerHTML = checkElement.replace(/\n/g, '');
        checkElement       = tempElem.querySelector('table');
    }

    if (checkElement && isHTMLTable(checkElement)) {
        const rows    = checkElement.rows;
        const rowsLen = rows && rows.length;
        let tempArray = [];

        for (let row = 0; row < rowsLen; row += 1) {
            const cells    = rows[row].cells;
            const cellsLen = cells.length;
            let newRow     = [];

            for (let column = 0; column < cellsLen; column += 1) {
                const cell     = cells[column];
                cell.innerHTML = cell.innerHTML.trim().replace(/<br(.|)>(\n?)/, '\n');
                const cellText = cell.innerText;
                newRow.push(cellText);
            }

            tempArray.push(newRow);
        }

        result.push.apply(result, tempArray);
    }

    return result;
}

function countQuotes(str) {
    return str.split('"').length - 1;
}

function parseString(str) {
    let r, rLen, rows, arr = [], a = 0, c, cLen, multiline, last;

    rows = str.replace(/\r\n|\r/g, '\n').split('\n');

    if (rows.length > 1 && rows[rows.length - 1] === '') {
        rows.pop();
    }
    for (r = 0, rLen = rows.length; r < rLen; r += 1) {
        rows[r] = rows[r].split('\t');

        for (c = 0, cLen = rows[r].length; c < cLen; c += 1) {
            if (!arr[a]) {
                arr[a] = [];
            }
            if (multiline && c === 0) {
                last = arr[a].length - 1;
                arr[a][last] = arr[a][last] + '\n' + rows[r][0];

                if (multiline && (countQuotes(rows[r][0]) & 1)) { //& 1 is a bitwise way of performing mod 2
                    multiline = false;
                    arr[a][last] = arr[a][last].substring(0, arr[a][last].length - 1).replace(/""/g, '"');
                }
            }
            else {
                if (c === cLen - 1 && rows[r][c].indexOf('"') === 0 && (countQuotes(rows[r][c]) & 1)) {
                    arr[a].push(rows[r][c].substring(1).replace(/""/g, '"'));
                    multiline = true;
                }
                else {
                    arr[a].push(rows[r][c].replace(/""/g, '"'));
                    multiline = false;
                }
            }
        }
        if (!multiline) {
            a += 1;
        }
    }

    return arr;
}

function getText(el) {
    let text = el.innerText;

    if (typeof window.getSelection !== 'undefined'
        && typeof document.createRange !== 'undefined') {
        let range = document.createRange();
        let sel   = window.getSelection();

        sel.removeAllRanges();
        range.selectNodeContents(el);
        sel.addRange(range);
        text = sel.toString();
        range.collapse(false);
    } else if (typeof document.body.createTextRange !== 'undefined') {
        let textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }

    return text;
}

const statusClassnames = {
    'Available': 'available',
    'Sold': 'sold',
    'On Hold': 'hold',
    'Deposit': 'deposit',
};

const LotsTable = () => (
    <PriceListContext.Consumer>
        {({state: {columns, lots}}) => (
            <table className="table lots fixed">
                <thead>
                <tr>
                    {
                        columns.map((column, columnIndex) =>
                            <th key={columnIndex}
                                title={column.display_name}>
                                {
                                    column.display_name
                                }
                            </th>
                        )
                    }
                </tr>
                </thead>

                <tbody>
                {lots.length
                    ? lots.map(
                        (lotValues, lotIndex) => <StaticLotRow key={lotIndex} lotValues={lotValues}/>
                    )
                    : <tr>
                        <td colSpan={columns.length + 1}>Lots not imported</td>
                    </tr>
                }
                </tbody>
            </table>
        )}
    </PriceListContext.Consumer>
);

const StaticLotRow = ({lotValues}) => (
    <PriceListContext.Consumer>
        {({state: {columns, columnAttrName: selectedCell, lotUid: selectedLot}, changeLotValue, selectCell}) => {
            const lotUid = lotValues['uuid'];
            return (
                <tr>
                    {columns.map((column, columnIndex) => {
                        const columnAttrName = column['attr_name'];
                        const selected = columnAttrName === selectedCell && lotUid === selectedLot;
                        return (
                            <td key={columnIndex}
                                onClick={() => selectCell({lotUid, columnAttrName})}
                                className={classnames(selected && 'selected', (columnAttrName === 'status') ? statusClassnames[lotValues[columnAttrName]] : '')}
                                contentEditable={true}
                                suppressContentEditableWarning={true}
                                onPaste={(e) => e.preventDefault()}
                                onInput={(e) => changeLotValue({
                                    columnAttrName,
                                    lotUid,
                                    value: getText(e.target)
                                })}
                            >
                                {lotValues[columnAttrName] || ''}
                            </td>
                        );
                    })
                    }
                </tr>
            );
        }}
    </PriceListContext.Consumer>
);

export default withAlert(connect(
    (state => ({
        popupDialog: state.popupDialog,
        columns: state.estate.columns,
        errors: state.estate.errors
    })), {...actions, resetDialogStore}
)(ImportPriceListDialog));
