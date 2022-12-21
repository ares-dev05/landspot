import React, {Component, Fragment} from 'react';
import {arrayMove} from 'react-sortable-hoc';
import PropTypes from 'prop-types';
import {LotPackages} from '~/landspot/LotPackages';
import Tooltip from '~/helpers/Tooltip';
import {EstateDataContext} from '../../Estate-new';
import StatusesSelect from './StatusesSelect';
import {formatCurrency, PathNavLink, NiceCheckbox} from '~/helpers';
import {EstateLotsDataContext} from '../EstateLots';

const NoDiscoveryBuilder = 'Your company is yet to integrate your floorplan catalogue.<br/>' +
    'For more information e-mail: <a href="mailto:sales@landspot.com.au">sales@landspot.com.au</a>';

const statusClassnames = {
    'Available': 'available',
    'Sold': 'sold',
    'On Hold': 'hold',
    'Deposit': 'deposit',
};

const dateFormat = (dateString) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (dateString == null) return '';
    let values = dateString.split('-');
    let date = new Date(values[0], parseInt(values[1]) - 1, values[2]);
    if (date.getTime() < 0) return '';
    return date.getDate() + '-' + months[date.getMonth()] + '-' + date.getFullYear().toString().substr(2);
};

const StaticLotRow = ({
                          changeLotVisibility, showLotPackagesDialog, lotVisibility, packagesCount, columns,
                          isBuilder, lot, stage, lotId, checkPermission, isDiscoveryBuilder, toggleDeleteLot,
                          displayNewColumn, showLotDrawerDialog, drawerData, checkFeature, lotmixLotVisibility
                      }) => {

    const formatters = {
        price: [formatCurrency],
    };

    const formatCell = (lotValue, column) => {
        const formatter = formatters[column['attr_name']];
        return formatter ? formatter[0](lotValue) : lotValue;
    };

    const getColumnsList = ({
                                state: {screenSize, moveIndex, sortOverData: {newIndex, index}},
                                getColumnIndex, onLotStatusChange
                            }) => {
        if (moveIndex !== '') {
            const newLot = arrayMove(lot, index, newIndex);
            const newColumns = arrayMove(columns, index, newIndex);
            return (
                newLot.map((lotValue, columnIndex) =>
                    <td key={columnIndex}>
                        {formatCell(lotValue, newColumns[columnIndex])}
                    </td>
                )
            );
        }

        const formatColumnCell = (lotValue, columnIndex) => {
            if ((columnIndex === getColumnIndex('status') && !isBuilder)) {
                return <StatusesSelect isStaticCell={true}
                                       statusValue={lotValue}
                                       onLotCellStatusChange={
                                           (value) => {
                                               onLotStatusChange(stage.id, lotId, value);
                                           }
                                       }
                />;
            } else if (columnIndex === getColumnIndex('lot_number') && drawerData) {
                return <button type="button"
                               title='Lot drawer'
                               className='button transparent'
                               onClick={() => showLotDrawerDialog({lotNumber: lotValue, isBuilder})}>
                    <i className="fal fa-image"/> {formatCell(lotValue, columns[columnIndex])}
                </button>;
            } else {
                return isBuilder
                    ? (
                        lotValue != null && lotValue !== '' &&
                        <Canvas screenSize={screenSize}
                                text={formatCell(lotValue, columns[columnIndex])}/>
                    )
                    : formatCell(lotValue, columns[columnIndex]);
            }
        };

        return (
            lot.map((lotValue, columnIndex) =>
                <td key={columnIndex}
                    className={(columnIndex === getColumnIndex('status')) ? statusClassnames[lotValue] : ''}
                    style={{color: columns[columnIndex].color}}>
                    {
                        formatColumnCell(lotValue, columnIndex)
                    }
                </td>
            )
        );
    };

    return (
        <EstateLotsDataContext.Consumer>
            {
                ({getColumnIndex, onLotStatusChange, state, onLotEdit}) => {
                    const isSold = stage.sold || lot[getColumnIndex('status')] === 'Sold';
                    return (
                        <tr>
                            {
                                getColumnsList({state, getColumnIndex, onLotStatusChange})
                            }

                            {
                                displayNewColumn && <td/>
                            }

                            {
                                isBuilder
                                    ? isDiscoveryBuilder
                                    ? BuilderCells({
                                        lot,
                                        packagesCount,
                                        getColumnIndex,
                                        showLotPackagesDialog,
                                        isSold,
                                        checkPermission
                                    })
                                    : DisabledBuilderCells({packagesCount, checkPermission})
                                    : AdminCells({
                                        lot, getColumnIndex, lotId, stageId: stage.id, lotVisibility, changeLotVisibility,
                                        onLotEdit, packagesCount, checkPermission, toggleDeleteLot, isSold, checkFeature,
                                        lotmixLotVisibility, drawerData
                                    })
                            }
                        </tr>
                    );
                }
            }
        </EstateLotsDataContext.Consumer>
    );

};

StaticLotRow.propTypes = {
    lotVisibility: PropTypes.oneOfType([PropTypes.number, PropTypes.array]),
    packagesCount: PropTypes.number,
    lotId: PropTypes.number,
    columns: PropTypes.array,
    lot: PropTypes.array,
    isBuilder: PropTypes.bool,
    displayNewColumn: PropTypes.bool,
    isDiscoveryBuilder: PropTypes.bool,
    stage: PropTypes.object,

    showLotPackagesDialog: PropTypes.func.isRequired,
    showLotDrawerDialog: PropTypes.func.isRequired,
    changeLotVisibility: PropTypes.func.isRequired,
    checkPermission: PropTypes.func.isRequired,
    toggleDeleteLot: PropTypes.func.isRequired,
};

//Discovery, Packages
const BuilderCells = ({lot, getColumnIndex, packagesCount, isSold, showLotPackagesDialog, checkPermission}) => {
    const isGeneralUser = !checkPermission('pdf_manager') && packagesCount;
    const isPdfManager  = checkPermission('pdf_manager');

    return (
        <Fragment>
            <td className='actions'>
                <a className="button transparent"
                   href={`/discovery?width=${parseFloat(lot[getColumnIndex('frontage')])}&depth=${lot[getColumnIndex('depth')]}`}>
                    <i className='landspot-icon house'/>
                </a>
            </td>
            <td>
                {(isGeneralUser || isPdfManager)
                    ?
                    <button disabled={isSold ? true : null}
                            type="button"
                            title={isSold ? 'Lot is sold' : null}
                            className={(packagesCount ? 'available ' : '') + 'button transparent'}
                            onClick={showLotPackagesDialog}>
                        <i className={isGeneralUser ? 'fal fa-file-pdf' : 'landspot-icon cog'}/>
                    </button>
                    : ''
                }
            </td>
        </Fragment>
    );
};

BuilderCells.propTypes = {
    lot: PropTypes.array,
    packagesCount: PropTypes.number,
    isSold: PropTypes.bool,

    showLotPackagesDialog: PropTypes.func.isRequired,
    checkPermission: PropTypes.func.isRequired,
    getColumnIndex: PropTypes.func.isRequired,
};

//Discovery, Packages
const DisabledBuilderCells = ({packagesCount}) => (
    <Fragment>
        <td key='discovery' className='actions'>
            <Tooltip text={NoDiscoveryBuilder} isHTML={true}>
                <button type="button" className='button transparent'>
                    <i className='landspot-icon house'/>
                </button>
            </Tooltip>
        </td>
        <td key='packages'>
            <Tooltip text={NoDiscoveryBuilder} isHTML={true}>
                <button type="button"
                        className={(packagesCount ? 'available ' : '') + 'button transparent'}>
                    <i className="landspot-icon cog"/>
                </button>
            </Tooltip>
        </td>
    </Fragment>
);

DisabledBuilderCells.propTypes = {
    packagesCount: PropTypes.number,
    checkPermission: PropTypes.func.isRequired,
};


const AdminCells = ({
                        lot, getColumnIndex, lotId, stageId, lotVisibility, changeLotVisibility,
                        onLotEdit, packagesCount, checkPermission, toggleDeleteLot, isSold, checkFeature,
                        lotmixLotVisibility, drawerData
                    }) => {
    //'Packages', 'Discovery', 'Visibility', 'Edit'

    let showLotVisibilityText = () => {
        if (Array.isArray(lotVisibility)) {
            return lotVisibility.map((builder, i) => <div key={i}>{builder}</div>);
        }
        switch (lotVisibility) {
            case 0:
                return 'HIDDEN';
            case 2:
                return 'ALL';
            default:
                return null;
        }
    };

    return (
        <Fragment>
            {(checkFeature('lotmix') && checkPermission('lotmix')) &&
            <td className='actions'>
                {
                    drawerData ?
                    <EstateLotsDataContext.Consumer>
                        {
                            ({updateLotmixVisibility}) => (
                                <NiceCheckbox
                                    checked={!!lotmixLotVisibility}
                                    label={''}
                                    name={lotId}
                                    onChange={() => updateLotmixVisibility(lotId, lotmixLotVisibility ? 0 : 1)}
                                />
                            )
                        }
                    </EstateLotsDataContext.Consumer> :
                        null
                }
            </td>
            }
            <td className='actions'>
                <EstateDataContext.Consumer>
                    {
                        ({estateId}) => (
                            packagesCount > 0 &&
                            (isSold
                                    ? <i className="fal fa-file-pdf"/>
                                    : <PathNavLink to={LotPackages.componentUrl + '?stage_id=:stage_id&lot_id=:lot_id'}
                                                   urlArgs={{estateId, lot_id: lotId, stage_id: stageId}}>
                                        <i className="fal fa-file-pdf"/>
                                    </PathNavLink>
                            )
                        )
                    }
                </EstateDataContext.Consumer>
            </td>
            <td className='actions'>
                <a className="button transparent"
                   href={`/landspot/discovery?width=${parseFloat(lot[getColumnIndex('frontage')])}&depth=${lot[getColumnIndex('depth')]}`}>

                    <i className='landspot-icon house'/>
                </a>
            </td>
            {
                !checkPermission('read_only') && (
                    <Fragment>
                        <td className={'visibility'}>
                            <button type="button"
                                    className="button transparent"
                                    onClick={changeLotVisibility}>
                                {showLotVisibilityText()}
                            </button>
                        </td>
                        <td className='actions'>

                            <a onClick={() => toggleDeleteLot(lot[getColumnIndex('lot_number')])}>
                                <i className='landspot-icon trash'/>
                            </a>

                            <a onClick={() => onLotEdit(lotId, stageId)}>
                                <i className='landspot-icon pen'/>
                            </a>
                        </td>
                    </Fragment>
                )
            }
        </Fragment>
    );
};

AdminCells.propTypes = {
    lot: PropTypes.array,
    lotId: PropTypes.number,
    stageId: PropTypes.number,
    lotVisibility: PropTypes.oneOfType([PropTypes.number, PropTypes.array]),
    isSold: PropTypes.bool,
    packagesCount: PropTypes.number,


    getColumnIndex: PropTypes.func.isRequired,
    onLotEdit: PropTypes.func.isRequired,
    changeLotVisibility: PropTypes.func.isRequired,
    checkPermission: PropTypes.func.isRequired,
    toggleDeleteLot: PropTypes.func.isRequired,
};

class Canvas extends Component {
    static propTypes = {
        text: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        screenSize: PropTypes.number
    };

    constructor(props) {
        super(props);
        this.frameID = null;
    }

    componentDidMount() {
        this.getStageSize(this.props.text);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.screenSize !== nextProps.screenSize) {
            this.getStageSize(nextProps.text);
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.text !== prevProps.text) {
            this.getStageSize(this.props.text);
        }
    }

    getStageSize = (text) => {
        if (this.frameID) {
            window.cancelAnimationFrame(this.frameID);
        }

        this.frameID = window.requestAnimationFrame(() => {
            const canvas = this.canvas;
            if (canvas) {
                const parent = canvas.parentNode;

                const styles = window.getComputedStyle(parent);
                const ratio  = Math.max(1, window.devicePixelRatio);

                const paddingLeft  = parseInt(styles.getPropertyValue('padding-left'));
                const paddingRight = parseInt(styles.getPropertyValue('padding-right'));
                const color        = styles.getPropertyValue('color');
                const font         = styles.getPropertyValue('font-size') + ' ' + styles.getPropertyValue('font-family');
                const lineHeight   = parseInt(styles.getPropertyValue('line-height'));

                const context = canvas.getContext('2d');
                context.font  = font;
                const metrics = context.measureText(text);
                let width     = parent.clientWidth - (paddingLeft + paddingRight);
                const words   = this.getFragmentText(metrics, width, text);
                const height  = words.length === 1 ? lineHeight : (lineHeight * words.length);

                if ((context.measureText(words[0]).width > width) || words.length === 1) {
                    width = Math.ceil(metrics.width);
                }
                canvas.width         = width;
                canvas.height        = height;
                context.textBaseline = 'middle';
                context.fillStyle    = color;
                context.font         = font;
                words.forEach(function (word, i) {
                    context.fillText(word || '', 0, (lineHeight / 2) + (lineHeight * i));
                });
                canvas.style.width  = `${width}px`;
                canvas.style.height = `${height}px`;
            }
            this.frameID = null;
        });
    };

    getFragmentText = (metrics, width, text) => {
        let words = text ? text.toString().split(' ') : [];

        if (metrics.width < width) {
            return [text];
        }

        return words;
    };

    render() {
        return (
            <canvas width={0} height={0} ref={s => this.canvas = s}/>
        );
    }
}

export default StaticLotRow;