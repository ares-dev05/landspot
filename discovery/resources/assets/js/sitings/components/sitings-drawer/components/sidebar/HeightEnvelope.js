import React, {useEffect, useState} from 'react';
import {get, find} from 'lodash';
import {NiceRadio} from '~sitings~/helpers/NiceRadio';
import classnames from 'classnames';
import NiceDropdown from '~sitings~/helpers/NiceDropdown';
import CanvasModel from '../CanvasModel';
import FacadeSettingsFactory from '../../../../../sitings-sdk/src/sitings/data/envelope/FacadeSettingsFactory';
import SearchBarAutocomplete from '../../../../helpers/SearchBarAutocomplete';
import FloorPositionModel from '../../../../../sitings-sdk/src/sitings/model/envelope/FloorPositionModel';

/**
 * @type {EnvelopeCanvasModel}
 */
const envelopeModel = CanvasModel.getEnvelopeModel();
const canvasModel = CanvasModel.getModel();

const initSideState = (side) => ({
    estateId: get(envelopeModel, 'envelopeCatalogue.currentCategory.name', ''),
    envelopes: get(envelopeModel, 'envelopeCatalogue.currentCategory.envelopes', []),
    envelopeId: get(envelopeModel, `envelope.builder[${side}].id`, 0)
});

const setCustomCellingHeight = x => {
    envelopeModel.transformations.transformations.find(point => point.isSlab === false).data = x;
};

const HeightEnvelope = ({showTestEnvelope}) => {
    const houseModel = canvasModel.multiFloors.crtFloor;

    const [state, setState] = useState({
        searchText: null,
        side: 'left',
        left: initSideState('left'),
        right: initSideState('right'),
        slabHeight: 0,
        showSuggestions: false,
        cellingHeight: 'custom',
        floorPosition: get(envelopeModel, 'floorPosition', {}),
        estates: get(envelopeModel, 'envelopeCatalogue.categories', [])
    });
    const [floor, setFloor] = useState({floorPosition: get(envelopeModel, 'floorPosition', {})})

    useEffect(() => {
        if (!!state.left.envelopes.length && !!state.left.envelopeId) {
            envelopeModel.envelope.builder.left.fromEnvelopeData(find(state.left.envelopes, {id: state.left.envelopeId}));
        }
        if (!!state.right.envelopes.length && !!state.right.envelopeId) {
            envelopeModel.envelope.builder.right.fromEnvelopeData(find(state.right.envelopes, {id: state.right.envelopeId}));
        }
    }, [state.right.envelopeId, state.left.envelopeId]);
    useEffect(() => {
        const handleCutLevelChange = () => {
            setFloor({ floorPosition: get(envelopeModel, 'floorPosition', {})
            });
        };
        const defaultSlab = envelopeModel.transformations.transformations.find(point => point.isSlab).data;
        let defaultCelling = envelopeModel.transformations.transformations.find(point => point.isSlab === false).data;
        defaultCelling = (defaultCelling.value !== undefined) ? defaultCelling.value : 'custom';
        updateState({cellingHeight: defaultCelling, slabHeight: defaultSlab.value});
        envelopeModel.floorPosition.addEventListener(FloorPositionModel.VCHANGE, handleCutLevelChange);
        return () => envelopeModel.floorPosition.removeEventListener(FloorPositionModel.VCHANGE, handleCutLevelChange);
    }, []);

    const setSlabHeight = x => {
        envelopeModel.transformations.transformations.find(point => point.isSlab).data = x;
        updateState({slabHeight: x.value});
    };

    const setCellingHeight = x => {
        if (x.value !== 'custom') {
            envelopeModel.transformations.transformations.find(point => point.isSlab === false).data = x;
        }
        updateState({cellingHeight: x.value});
    };

    const updateState = (data) => {
        setState({...state, ...data});
    };

    const filterEnvelopes = (estateId) => {
        const envelopes = estateId
            ? state.estates.reduce((accumulator, estate) => {
                if (estate.name === estateId) {
                    accumulator = estate.envelopes;
                }
                return accumulator;
            }, [])
            : [];

        updateState({[state.side]: {...state[state.side], envelopes, estateId}});
    };

    const setCutHeight = (e) => {
        envelopeModel.floorPosition.cutHeight = +e;
        setFloor({
            floorPosition: get(envelopeModel, 'floorPosition', {}),
        });
    };
    const setFillHeight = (e) => {
        envelopeModel.floorPosition.fillHeight = +e;
        setFloor({
            floorPosition: get(envelopeModel, 'floorPosition', {}),
        });
    };

    return (
        <div className='lot-settings'>
            <div className='header'>Height Envelopes</div>
            <div className='header'>Select the envelope sides</div>
            <div className="easements">
                <div className="btn-group">
                    <button type="button"
                            className={classnames('button', state.side === 'left' ? 'primary' : 'default')}
                            onClick={() => {
                                updateState({side: 'left'});
                            }}>
                        Left Side
                    </button>
                    <button type="button"
                            className={classnames('button', state.side === 'right' ? 'primary' : 'default')}
                            onClick={() => {
                                updateState({side: 'right'});
                            }}>
                        Right Side
                    </button>
                </div>
            </div>
            <div className='header'>Select the estate</div>
            <div className='landconnect-input search-floorplan'>
                <SearchBarAutocomplete
                    onSearchInputChange={value => updateState({searchText: value})}
                    items={state.estates}
                    value={state.searchText || state[state.side].estateId}
                    onSelect={value => filterEnvelopes(value)}
                    placeholder={'find'}
                />
            </div>
            {!!state.estates.length &&
            <React.Fragment>
                {!!state[state.side].envelopes.length &&
                <React.Fragment>
                    <div className='header'>Select the envelope</div>
                    <div className="form-rows">
                        {
                            state[state.side].envelopes.map(envelope =>
                                <div key={envelope.id} className="form-row">
                                    <NiceRadio
                                        name={`range-radio-${envelope.name}`}
                                        value={envelope.id}
                                        checked={parseInt(state[state.side].envelopeId) === envelope.id}
                                        label={envelope.name.toUpperCase()}
                                        onChange={() => {
                                            updateState({
                                                [state.side]: {
                                                    ...state[state.side],
                                                    envelopeId: envelope.id
                                                }
                                            });
                                        }}
                                    />
                                </div>
                            )
                        }
                    </div>
                </React.Fragment>
                }
                <div className='header'>Facade details</div>
                <div className='header'>Selected facade</div>
                <div className='sub-header'>{houseModel.houseName} {houseModel.facadeName} Facade</div>
                <div className='header'>Cut & Fill</div>
                <div className="easements">
                    <div className="btn-group column">
                        <div className="button-wrapper">
                            <div className="header button-label">Cut level</div>
                            <div className='btn-group-input'>
                                <div className='landconnect-input'>
                                    <input type='number'
                                           tabIndex={0}
                                           autoComplete="off"
                                           step={0.01}
                                           onChange={(e) => {
                                               setCutHeight(e.target.value);
                                           }}
                                           onFocus={(event) => event.target.select()}
                                           placeholder='Cut level'
                                           value={Math.round(floor.floorPosition.cutHeight * 100) / 100 || ''}
                                    />
                                </div>
                                <span>m</span>
                            </div>
                        </div>
                        <div className="button-wrapper">
                            <div className="header button-label">Fill level</div>
                            <div className='btn-group-input'>
                                <div className='landconnect-input'>
                                    <input type='number'
                                           tabIndex={0}
                                           autoComplete="off"
                                           step={0.01}
                                           onChange={(e) => {
                                               setFillHeight(e.target.value);
                                           }}
                                           onFocus={(event) => event.target.select()}
                                           placeholder='Fill level'
                                           value={Math.round(floor.floorPosition.fillHeight * 100) / 100 || ''}
                                    />
                                </div>
                                <span>m</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='header'>Facade extensions</div>
                <div className="easements">
                    <div className="btn-group column">
                        <div className="button-wrapper one-third-basis">
                            <div className="header button-label">Slab type</div>
                            <NiceDropdown
                                itemClass='right-item'
                                defaultItem='Select type'
                                items={FacadeSettingsFactory.slabHeights}
                                onChange={(slabValue) => setSlabHeight({value: slabValue}, true)}
                                value={state.slabHeight}
                            />
                        </div>
                        <div className="button-wrapper one-third-basis">
                            <div className="header button-label">Celling height</div>
                            <NiceDropdown
                                itemClass=''
                                defaultItem='Custom height'
                                defaultValue={'custom'}
                                items={FacadeSettingsFactory.ceilingHeights}
                                onChange={(cellingHeightValue) => setCellingHeight({value: cellingHeightValue})}
                                value={state.cellingHeight}
                            /></div>
                        {state.cellingHeight === 'custom' &&
                        <div className='button-wrapper one-third-basis' style={{marginTop: '-20px'}}>
                            <div className="header button-label"></div>
                            <div className='landconnect-input'>
                                <input type='number'
                                       tabIndex={0}
                                       autoComplete="off"
                                       onChange={(e) => {
                                           setCustomCellingHeight({value: e.target.value - 2.44});
                                       }}
                                       onFocus={(event) => event.target.select()}
                                       maxLength={7}
                                       step={0.01}
                                       placeholder='Fill level'
                                       defaultValue={2.44}
                                       style={{display: 'inline-block', width: '130px'}}
                                />
                                <span style={{marginLeft: '8px'}}>m</span>
                            </div>

                        </div>}

                    </div>
                </div>
                <br/>
            </React.Fragment>
            }
            <button type="button" style={{float: 'left'}}
                    className={classnames('button', 'default')}
                    onClick={showTestEnvelope}>
                Exit to Siting
            </button>
        </div>
    );
};

export default HeightEnvelope;