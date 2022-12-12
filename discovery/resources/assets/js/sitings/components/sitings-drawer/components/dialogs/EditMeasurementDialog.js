import PropTypes from 'prop-types';
import React from 'react';
import {PopupModal} from '~sitings~/helpers';
import TransformationMeasurementModel from '~/sitings-sdk/src/sitings/model/house/transform/TransformationMeasurementModel';
import AccountMgr from '~/sitings-sdk/src/sitings/data/AccountMgr';
import Builder from '~/sitings-sdk/src/sitings/data/Builder';

class EditMeasurementDialog extends React.Component {
    static propTypes = {
        userActionData: PropTypes.shape({
            measurementModel: PropTypes.object.isRequired,
        }).isRequired,
        onCancel: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            distance: '',
            distanceToEave: '',
            isDistanceToWall: true,
            eaveWidth: 300,
            mustFocus: false
        };
        this.initialFocus = true;
    }

    componentDidMount() {
        const {
            userActionData: {
                measurementModel
            },
        } = this.props;
        const distance = measurementModel.getDisplayDistance(
            AccountMgr.i.userRegion === 4 || AccountMgr.i.builder === Builder.BURBANK ?
                3 : 2
        );
        let newState = {distance};
        const ompMeasurement = this.ompMeasurement;
        if (ompMeasurement) {
            newState = {
                distance,
                distanceToEave: ompMeasurement.getOMPDistance(),
                isDistanceToWall: false,
                eaveWidth: ompMeasurement.ompWidth * 1000
            };
        }

        this.setState(newState);
    }

    componentDidUpdate(prevProps, prevState) {
        const {mustFocus, distance} = this.state;
        if (prevState.distance !== distance && this.distanceInput && distance && this.initialFocus) {
            this.initialFocus = false;
            this.setState({mustFocus: true});
        }

        if (prevState.mustFocus !== mustFocus && mustFocus) {
            this.distanceInput.focus();
            this.setState({mustFocus: false});
        }
    }

    editMeasurement = () => {
        const {
            userActionData: {
                measurementModel
            },
            onCancel
        } = this.props;
        const {distance, distanceToEave, isDistanceToWall, eaveWidth} = this.state;
        const ompMeasurement = this.ompMeasurement;

        if (ompMeasurement) {
            ompMeasurement.ompWidth = eaveWidth / 1000;

            if (isDistanceToWall) {
                ompMeasurement.distance = parseFloat(distance) || 0;
            } else {
                ompMeasurement.ompDistance = parseFloat(distanceToEave) || 0;
            }
        } else {
            measurementModel.distance = distance;
        }

        onCancel();
    };

    deleteMeasurement = () => {
        if (!this.canDeleteModel) {
            return;
        }

        const {
            userActionData: {
                measurementModel
            },
            onCancel
        } = this.props;

        measurementModel.deleteMeasurement();
        onCancel();
    };

    cancelEdit = () => {
        const {onCancel} = this.props;
        onCancel();
    };

    get canDeleteModel() {
        if (this.props.heightVisualisationEnabled){
            return false;
        }
        const {
            userActionData: {
                measurementModel
            }
        } = this.props;
        return measurementModel.type !== TransformationMeasurementModel.TYPE;
    }

    /**
     * @returns {MeasurementPointModel}
     */
    get ompMeasurement() {
        const {
            userActionData: {
                measurementModel
            }
        } = this.props;

        if ((measurementModel.hasOwnProperty('isPlantationOMP') || 'isPlantationOMP' in measurementModel) && measurementModel.isPlantationOMP) {
            return measurementModel;
        }

        return null;
    }

    render() {
        const {distance, distanceToEave, isDistanceToWall, eaveWidth} = this.state;
        const canDelete = this.canDeleteModel;

        let ompMeasurement = this.ompMeasurement;
        let isMeasurementOMP = false;
        let isOMPCorner = false;

        if (ompMeasurement !== null) {
            isMeasurementOMP = true;
            isOMPCorner = ompMeasurement.isOnCorner;
        }

        return (
            <PopupModal title="Edit Measurement"
                        onModalHide={this.cancelEdit}
                        onOK={this.editMeasurement}
                        dialogClassName='measurement'
                        customFooterButtons={
                            <React.Fragment>
                                <button className={'button default'}
                                        onClick={this.editMeasurement}>
                                    Save
                                </button>

                                {canDelete &&
                                <button className={'button default'}
                                        onClick={this.deleteMeasurement}>
                                    Delete
                                </button>
                                }

                                {!canDelete &&
                                <button className={'button default'}
                                        onClick={this.cancelEdit}>
                                    Cancel
                                </button>
                                }
                            </React.Fragment>
                        }
                        hideCancelButton={true}
                        hideOKButton={true}>
                {isMeasurementOMP ?
                    <div className="form-rows">
                        <div className="form-row">
                            <label className="left-item">
                                <a href="#" onClick={(e) => {
                                    e.preventDefault();
                                    this.setState({isDistanceToWall: !isDistanceToWall});
                                }}>
                                    {isDistanceToWall ? 'Distance to Wall: (m) ☐' : 'Distance to Eave: (m) ☒'}
                                </a>
                            </label>
                            <div className='landconnect-input'>
                                <input type='number'
                                       ref={(input) => {
                                           this.distanceInput = input;
                                       }}
                                       autoComplete="off"
                                       onChange={(e) => {
                                           this.setState(
                                               isDistanceToWall ?
                                                   {distance: e.target.value.slice(0, e.target.maxLength)} :
                                                   {distanceToEave: e.target.value.slice(0, e.target.maxLength)}
                                           );
                                       }}
                                       onFocus={(event) => event.target.select()}
                                       onKeyDown={(event) => {
                                           if (event.key === 'Enter') {
                                               this.editMeasurement();
                                           }
                                           if (event.key === 'Escape') {
                                               this.cancelEdit();
                                           }
                                       }}
                                       maxLength={6}
                                       placeholder='Distance'
                                       value={isDistanceToWall ? distance : distanceToEave}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <label className="left-item">Custom Eave Width (mm)</label>
                            <div className='landconnect-input'>
                                <input type='number'
                                       autoComplete="off"
                                       onChange={(e) => {
                                           this.setState(
                                               {eaveWidth: parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0}
                                           );
                                       }}
                                       onFocus={(event) => event.target.select()}
                                       onKeyDown={(event) => {
                                           if (event.key === 'Enter') {
                                               this.editMeasurement();
                                           }
                                           if (event.key === 'Escape') {
                                               this.cancelEdit();
                                           }
                                       }}
                                       maxLength={6}
                                       placeholder='Eave Width'
                                       value={eaveWidth || ''}
                                />
                            </div>
                        </div>
                    </div>
                    :
                    <div className="form-rows">
                        <div className="form-row">
                            <label className="left-item">Distance: </label>
                            <div className='landconnect-input'>
                                <input type='number'
                                       ref={(input) => {
                                           this.distanceInput = input;
                                       }}
                                       autoComplete="off"
                                       onChange={(e) => {
                                           this.setState({distance: parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0});
                                       }}
                                       onFocus={(event) => event.target.select()}
                                       onKeyDown={(event) => {
                                           if (event.key === 'Enter') {
                                               this.editMeasurement();
                                           }
                                           if (event.key === 'Escape') {
                                               this.cancelEdit();
                                           }
                                       }}
                                       maxLength={6}
                                       placeholder='Distance'
                                       value={distance || ''}
                                />
                            </div>
                        </div>
                    </div>
                }
            </PopupModal>
        );
    }
}

export default EditMeasurementDialog;