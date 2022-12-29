import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import LotFeaturesModel from '~/sitings-sdk/src/sitings/model/lot/features/LotFeaturesModel';
import ParallelEasement from '~/sitings-sdk/src/sitings/model/easement/ParallelEasement';
import LotEasementModel from '~/sitings-sdk/src/sitings/model/lot/features/LotEasementModel';
import LotDrivewayModel from '~/sitings-sdk/src/sitings/model/lot/features/LotDrivewayModel';
import EventBase from '~/sitings-sdk/src/events/EventBase';
import CanvasModel from '../CanvasModel';
import {DrawerContext} from '../../DrawerContainer';
import RestoreEvent from '~/sitings-sdk/src/sitings/events/RestoreEvent';
import AccountMgr from '~/sitings-sdk/src/sitings/data/AccountMgr';

class LotEasements extends Component {
    static propTypes = {
        setDrawerData: PropTypes.func.isRequired,
        metric: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            modelMode: null,
            easement: -1
        };
    }

    componentDidMount() {
        const canvasModel = CanvasModel.getModel();
        canvasModel.lotFeaturesModel.addEventListener(EventBase.ADDED, this.onEasementAdded, this);
        canvasModel.lotFeaturesModel.addEventListener(EventBase.CHANGE, this.onEasementChange, this);
        canvasModel.lotFeaturesModel.parallelEasements.addEventListener(EventBase.ADDED, this.onEasementAdded, this);
        canvasModel.lotFeaturesModel.envelopes.addEventListener(EventBase.ADDED, this.onEasementAdded, this);
        canvasModel.lotFeaturesModel.addEventListener(RestoreEvent.RESTORE_COMPLETE, this.onEasementsRestored, this);
    }

    componentWillUnmount() {
        const canvasModel = CanvasModel.getModel();
        canvasModel.lotFeaturesModel.removeEventListener(EventBase.ADDED, this.onEasementAdded);
        canvasModel.lotFeaturesModel.removeEventListener(EventBase.CHANGE, this.onEasementChange, this);
        canvasModel.lotFeaturesModel.parallelEasements.removeEventListener(EventBase.ADDED, this.onEasementAdded);
        canvasModel.lotFeaturesModel.envelopes.removeEventListener(EventBase.ADDED, this.onEasementAdded);
        canvasModel.lotFeaturesModel.removeEventListener(RestoreEvent.RESTORE_COMPLETE, this.onEasementsRestored, this);
    }

    componentDidUpdate(prevProps) {
    }

    addEasement = (modelMode) => {
        const canvasModel                 = CanvasModel.getModel();
        canvasModel.lotFeaturesModel.mode = modelMode;
        this.setState({modelMode});
        this.onEasementChange();
    };

    onEasementAdded = () => {
        this.onEasementChange();
    };

    onEasementChange = () => {
        const {
            setDrawerData
        } = this.props;
        const canvasModel = CanvasModel.getModel();
        setDrawerData({sitingSession: canvasModel.recordState()});
    };

    onEasementsRestored = () => {
        try {
            this.addEasement(CanvasModel.getModel().lotFeaturesModel.mode);
        }   catch(e) {
            // eslint-disable-next-line no-empty
        }
    };

    render() {
        const {metric}    = this.props;
        const {modelMode} = this.state;
        const canvasModel = CanvasModel.getModel();
        const {lotFeaturesModel} = canvasModel;
        const blocks      = lotFeaturesModel.specialEasements;
        const parallels   = lotFeaturesModel.parallelEasements.edges;
        const envelopes   = lotFeaturesModel.envelopes.edges;
        const truncations = lotFeaturesModel.truncations;
        const driveways   = lotFeaturesModel.driveways;

        return (
            <div className='lot-settings'>
                <div className='header'>Easements</div>
                <div className="easements">
                    <div className="btn-group">
                        <div
                            className={classnames('btn-primary', (modelMode && canvasModel.lotFeaturesModel.mode === LotFeaturesModel.MODE_PARALLEL_EASEMENT) ? 'active' : '')}
                            onClick={() => this.addEasement(LotFeaturesModel.MODE_PARALLEL_EASEMENT)}>
                            <i className="landconnect-icon plus"/> <span>Parallel</span>
                        </div>
                        <div
                            className={classnames('btn-primary', (modelMode && canvasModel.lotFeaturesModel.mode === LotFeaturesModel.MODE_ANGLED_EASEMENT) ? 'active' : '')}
                            onClick={() => this.addEasement(LotFeaturesModel.MODE_ANGLED_EASEMENT)}>
                            <i className="landconnect-icon plus"/> <span>Angled</span>
                        </div>
                        <div
                            className={classnames('btn-primary', (modelMode && canvasModel.lotFeaturesModel.mode === LotFeaturesModel.MODE_BLOCK_EASEMENT) ? 'active' : '')}
                            onClick={() => this.addEasement(LotFeaturesModel.MODE_BLOCK_EASEMENT)}>
                            <i className="landconnect-icon plus"/> <span>Block</span>
                        </div>

                        {
                            (
                                modelMode === LotFeaturesModel.MODE_PARALLEL_EASEMENT ||
                                modelMode === LotFeaturesModel.MODE_BLOCK_EASEMENT ||
                                modelMode === LotFeaturesModel.MODE_ANGLED_EASEMENT
                            ) &&
                            <div className="note">
                                <i className="fal fa-exclamation-circle"/>
                                <span>Click on a lot to place</span>
                            </div>
                        }
                    </div>

                    <div className="easement">
                        <div className="blocks">
                            {
                                [...parallels, ...blocks].map(
                                    (easement, easementIndex) => <Easement key={easementIndex}
                                                                           easement={easement}
                                                                           easementNo={easementIndex + 1}
                                                                           easementType={
                                                                               (easement instanceof ParallelEasement ||
                                                                               easement.type === LotEasementModel.EXTERNAL)
                                                                                   ? 'Parallel'
                                                                                   : easement.type === LotEasementModel.ANGLED
                                                                                       ? 'Angled'
                                                                                       : 'Block'
                                                                           }
                                                                           metric={metric}
                                                                           external={true}
                                                                           onEasementChange={this.onEasementChange}
                                    />
                                )
                            }
                        </div>
                    </div>
                </div>

                <div className="easements">
                    <div className="btn-group">
                    <div className='header'>Crossovers</div>
                        <div
                            className={classnames('btn-primary', (modelMode && canvasModel.lotFeaturesModel.mode === LotFeaturesModel.MODE_DRIVEWAY) ? 'active' : '')}
                            onClick={() => this.addEasement(LotFeaturesModel.MODE_DRIVEWAY)}>
                            <i className="landconnect-icon plus"/> <span>Add</span>
                        </div>

                        {
                            (
                                modelMode === LotFeaturesModel.MODE_DRIVEWAY
                            ) &&
                            <div className="note">
                                <i className="fal fa-exclamation-circle"/>
                                <span>Click on a lot to place</span>
                            </div>
                        }
                    </div>

                    <div className="easement">
                        <div className="blocks">
                            {
                                driveways.map(
                                    (easement, easementIndex) => <Easement key={easementIndex}
                                                                           easement={easement}
                                                                           easementNo={easementIndex + 1}
                                                                           easementType={'Crossover'}
                                                                           onEasementChange={this.onEasementChange}
                                    />
                                )
                            }
                        </div>
                    </div>
                </div>


                <div className="easements">
                    <div className="btn-group">
                        <div className='header'>Lot boundary lines</div>
                        <div
                            className={classnames('btn-primary', (modelMode && canvasModel.lotFeaturesModel.mode === LotFeaturesModel.MODE_ENVELOPE) ? 'active' : '')}
                            onClick={() => this.addEasement(LotFeaturesModel.MODE_ENVELOPE)}>
                            <i className="landconnect-icon plus"/> <span>Add</span>
                        </div>

                        {
                            (
                                modelMode === LotFeaturesModel.MODE_ENVELOPE
                            ) &&
                            <div className="note">
                                <i className="fal fa-exclamation-circle"/>
                                <span>Click on a lot to place</span>
                            </div>
                        }
                    </div>

                    <div className="easement">
                        <div className="blocks">
                            {
                                envelopes.map(
                                    (easement, easementIndex) => <Easement key={easementIndex}
                                                                           easement={easement}
                                                                           easementNo={easementIndex + 1}
                                                                           easementType={'Envelope'}
                                                                           metric={metric}
                                                                           isEnvelope={true}
                                                                           onEasementChange={this.onEasementChange}
                                    />
                                )
                            }
                        </div>
                    </div>
                </div>

                {
                    AccountMgr.i.builder.hasTruncations &&
                    <React.Fragment>
                        <div className='header'>Lot truncations</div>
                        <div className="easements">
                            <div className="btn-group">
                                <button type="button"
                                        className={classnames('button', (modelMode && canvasModel.lotFeaturesModel.mode === LotFeaturesModel.MODE_TRUNCATION) ? 'primary' : 'default')}
                                        onClick={() => this.addEasement(LotFeaturesModel.MODE_TRUNCATION)}>
                                    <i className="landconnect-icon plus"/> Corner truncation
                                </button>

                                {
                                    (
                                        modelMode === LotFeaturesModel.MODE_TRUNCATION
                                    ) &&
                                    <div className="note">
                                        <i className="fal fa-exclamation-circle"/>
                                        Select two boundaries to apply a corner truncation to.
                                    </div>
                                }
                            </div>

                            <div className="easement">
                                <div className="blocks">
                                    {
                                        truncations.map(
                                            (truncation, truncationIndex) => <Truncation key={truncationIndex}
                                                                                         truncation={truncation}
                                                                                         truncationNo={truncationIndex+1}
                                                                                         onTruncationChange={this.onEasementChange}

                                            />
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                }
            </div>
        );
    }
}

const Truncation = ({truncation, onTruncationChange, truncationNo}) => {
    const sizeDisplay = truncation.size + ' x ' + truncation.size + 'm';
    const toggleSize  = truncation.size === 6 ? 9 : 6;

    const leftEdge    = truncation.leftEdge  ? truncation.leftEdge.simpleDescription  : 'Select 1st boundary';
    const rightEdge   = truncation.rightEdge ? truncation.rightEdge.simpleDescription : 'Select 2nd boundary';

    return (
        <div className="block">
            <div className="easement-number">
                {truncationNo}
            </div>
            <div className="easement-type">
                Truncation
            </div>

            <button type="button" className='button transparent delete-btn'
                    onClick={() => {
                        truncation.deleteTruncation();
                        onTruncationChange();
                    }}>
                <i className='landconnect-icon times'/>
            </button>

            <div className='easement-dimension'>
                <div className='landconnect-input input-group'>
                    <div className="input-group-addon">
                        <button type="button" className='button transparent'
                                onClick={() => {
                                    truncation.size = toggleSize;
                                    onTruncationChange();
                                }}>
                            {sizeDisplay}
                        </button>
                    </div>
                </div>

                <div className='landconnect-input'>
                    <input type='text' autoComplete="off" disabled="disabled" placeholder={leftEdge} value=""/>
                </div>

                <div className='landconnect-input'>
                    <input type='text' autoComplete="off" disabled="disabled" placeholder={rightEdge} value=""/>
                </div>
            </div>

        </div>
    );
};

const Easement = ({easement, onEasementChange, easementNo, easementType, external=false, isEnvelope=false, metric=true}) => {
    const isParallel  = easement instanceof ParallelEasement;
    const isDriveway  = easement instanceof LotDrivewayModel;
    const isExternal  = easement.type === LotEasementModel.EXTERNAL;
    const isSplayed   = isParallel && easement.splayed === true;
    const externalBtn = (external && isParallel) || isExternal;
    const splayedBtn  = !external && isParallel;
    const canvasModel = CanvasModel.getModel();
    const {lotFeaturesModel} = canvasModel;
    const isSimpleParallel = isParallel || isExternal || isEnvelope;
    let tabIndex = easementNo * (metric ? 5 : 7) + (isEnvelope ? 100 : 0);

    const onDelete = () => {
        if (isParallel) {
            easement.deleteEdge();
        } else if (isDriveway) {
            easement.deleteDriveway();
        } else {
            easement.deleteEasement();
        }
    };

    return (
        <div className="block">
            <div className="easement-number">
                {easementNo}
            </div>
            <div className='wrap'>
                <div className='row'>
                    <div className="easement-type">
                        {easementType}
                    </div>

                    <button type="button" className='button transparent delete-btn'
                            onClick={() => {
                                onDelete();
                                onEasementChange();
                            }}>
                        <i className='landconnect-icon times'/>
                    </button>
                </div>
                <div className='easement-dimension'>
                    {!isDriveway &&
                        <div className='easement-angle top'>
                            {metric &&
                                <div className='landconnect-input'>
                                    <input type='number'
                                        tabIndex={tabIndex++}
                                        autoComplete="off"
                                        onChange={(e) => {
                                            const value = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0

                                            isSimpleParallel ? easement.distance = value : easement.width = value;
                                            onEasementChange();
                                        }}
                                        onFocus={(event) => event.target.select()}
                                        maxLength={5}
                                        placeholder={isEnvelope ? 'Setback Distance' : 'Width'}
                                        value={
                                            isSimpleParallel ? (easement.distance || '') : (easement.width || '')
                                        }
                                    />
                                </div>
                            }
                            {!metric &&
                            <React.Fragment>
                                <div className='landconnect-input'>
                                    <input type='number'
                                        tabIndex={tabIndex++}
                                        autoComplete="off"
                                        onChange={(e) => {
                                            const value = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0

                                            isSimpleParallel ? easement.feet = value : easement.widthFeet = value;
                                            onEasementChange();
                                        }}
                                        onFocus={(event) => event.target.select()}
                                        maxLength={5}
                                        placeholder={isEnvelope ? 'Setback Distance (ft)' : 'Width (ft)'}
                                        value={
                                            isSimpleParallel ? (easement.feet || '') : (easement.widthFeet || '')
                                        }
                                    />
                                </div>
                                <div className='landconnect-input'>
                                    <input type='number'
                                        tabIndex={tabIndex++}
                                        autoComplete="off"
                                        onChange={(e) => {
                                            const value = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;

                                            isSimpleParallel ? easement.inches = value : easement.widthInches = value;
                                            onEasementChange();
                                        }}
                                        onFocus={(event) => event.target.select()}
                                        maxLength={5}
                                        placeholder={isEnvelope ? 'Setback Distance (in)' : 'Width (in)'}
                                        value={
                                            isSimpleParallel ? (easement.inches || '') : (easement.widthInches || '')
                                        }
                                    />
                                </div>
                            </React.Fragment>
                            }

                            {isSplayed &&
                            <div className='landconnect-input'>
                                <input type='number'
                                    tabIndex={tabIndex++}
                                    autoComplete="off"
                                    onChange={(e) => {
                                        easement.splayDistance = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                                        onEasementChange();
                                    }}
                                    onFocus={(event) => event.target.select()}
                                    maxLength={5}
                                    placeholder='Splay Width'
                                    value={easement.splayDistance || ''}
                                />
                            </div>
                            }
                        </div>
                    }

                    {(externalBtn || splayedBtn) &&
                        <div className={'landconnect-input input-group'}>
                            {externalBtn &&
                            <div className="input-group-addon">
                                <button type="button" className='button transparent'
                                        disabled={isSplayed}
                                        onClick={() => {
                                            lotFeaturesModel.toggleParallelEasement(easement);
                                            onEasementChange();
                                        }}>
                                    {isExternal ? 'EXT' : 'INT'}
                                </button>
                            </div>
                            }

                            {splayedBtn &&
                            <div className="input-group-addon">
                                <button type="button" className='button transparent'
                                        onClick={() => {
                                            easement.splayed = !easement.splayed;
                                            onEasementChange();
                                        }}>
                                    {isSplayed ? 'REG' : 'SPLAY'}
                                </button>
                            </div>
                            }
                        </div>
                    }

                    {(easement.type === LotEasementModel.BLOCK) &&
                        <React.Fragment>
                            {metric ?
                                <div className='landconnect-input'>
                                    <input type='number'
                                        tabIndex={tabIndex++}
                                        autoComplete="off"
                                        onChange={(e) => {
                                            easement.distance = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                                            onEasementChange();
                                        }}
                                        onFocus={(event) => event.target.select()}
                                        maxLength={5}
                                        placeholder='Height'
                                        value={easement.distance || ''}
                                    />
                                </div> :
                                <div className='easement-angle'>
                                    <div className='landconnect-input'>
                                        <input type='number'
                                            tabIndex={tabIndex++}
                                            autoComplete="off"
                                            onChange={(e) => {
                                                easement.feet = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0
                                                onEasementChange();
                                            }}
                                            onFocus={(event) => event.target.select()}
                                            maxLength={5}
                                            placeholder='Height (ft)'
                                            value={easement.feet || ''}
                                        />
                                    </div>
                                    <div className='landconnect-input'>
                                        <input type='number'
                                            tabIndex={tabIndex++}
                                            autoComplete="off"
                                            onChange={(e) => {
                                                easement.inches = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0
                                                onEasementChange();
                                            }}
                                            onFocus={(event) => event.target.select()}
                                            maxLength={5}
                                            placeholder='Height (in)'
                                            value={easement.inches || ''}
                                        />
                                    </div>
                                </div>
                            }
                        </React.Fragment>
                    }

                    {easement.type === LotEasementModel.ANGLED &&
                    <React.Fragment>
                        {metric ?
                            <div className='landconnect-input'>
                                <input type='number'
                                    tabIndex={tabIndex++}
                                    autoComplete="off"
                                    onChange={(e) => {
                                        easement.distance = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                                        onEasementChange();
                                    }}
                                    onFocus={(event) => event.target.select()}
                                    maxLength={5}
                                    placeholder='Offset'
                                    value={easement.distance || ''}
                                />
                            </div> :
                            <div className='easement-angle'>
                                <div className='landconnect-input'>
                                    <input type='number'
                                        tabIndex={tabIndex++}
                                        autoComplete="off"
                                        onChange={(e) => {
                                            easement.feet = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0
                                            onEasementChange();
                                        }}
                                        onFocus={(event) => event.target.select()}
                                        maxLength={5}
                                        placeholder='Offset (ft)'
                                        value={easement.feet || ''}
                                    />
                                </div>
                                <div className='landconnect-input'>
                                    <input type='number'
                                        tabIndex={tabIndex++}
                                        autoComplete="off"
                                        onChange={(e) => {
                                            easement.inches = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0
                                            onEasementChange();
                                        }}
                                        onFocus={(event) => event.target.select()}
                                        maxLength={5}
                                        placeholder='Offset (in)'
                                        value={easement.inches || ''}
                                    />
                                </div>
                            </div>
                        }
                        <div className='easement-angle'>
                            <div className='landconnect-input'>
                                <input type='number'
                                    tabIndex={tabIndex++}
                                    autoComplete="off"
                                    onChange={(e) => {
                                        easement.angle.degrees = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                                        onEasementChange();
                                    }}
                                    onFocus={(event) => event.target.select()}
                                    maxLength={5}
                                    placeholder='Deg'
                                    value={easement.angle.degrees || ''}
                                />
                            </div>
                            <div className='landconnect-input'>
                                <input type='number'
                                    tabIndex={tabIndex++}
                                    autoComplete="off"
                                    onChange={(e) => {
                                        easement.angle.minutes = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                                        onEasementChange();
                                    }}
                                    onFocus={(event) => event.target.select()}
                                    maxLength={5}
                                    placeholder='Min'
                                    value={easement.angle.minutes || ''}
                                />
                            </div>
                            <div className='landconnect-input'>
                                <input type='number'
                                    tabIndex={tabIndex++}
                                    autoComplete="off"
                                    onChange={(e) => {
                                        easement.angle.seconds = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                                        onEasementChange();
                                    }}
                                    onFocus={(event) => event.target.select()}
                                    maxLength={5}
                                    placeholder='Sec'
                                    value={easement.angle.seconds || ''}
                                />
                            </div>
                        </div>

                        <button type="button" className='button transparent direction'
                                onClick={() => {
                                    easement.flipStart = !easement.flipStart;
                                    onEasementChange();
                                }}>
                            <i className={classnames('landconnect-icon boundary-arrow-left', easement.flipStart && 'active')}/>
                            <i className={classnames('landconnect-icon boundary-arrow-right', !easement.flipStart && 'active')}/>
                        </button>
                    </React.Fragment>
                    }
                </div>
            </div> 
        </div>
    );
};

Easement.propTypes = {
    easement: PropTypes.object.isRequired,
    easementNo: PropTypes.number.isRequired,
    onEasementChange: PropTypes.func.isRequired,
    easementType: PropTypes.string.isRequired,
    external: PropTypes.bool,
};

const LotEasementsConsumer = (props) => (
    <DrawerContext.Consumer>
        {
            ({
                 setDrawerData
             }) => <LotEasements  {...props} {...{
                setDrawerData
            }}/>
        }
    </DrawerContext.Consumer>
);

const LotEasementsInstance = connect((state) => ({
    drawerDetails: state.sitingsDrawerDetails,
}), null)(LotEasementsConsumer);

export default LotEasementsInstance;