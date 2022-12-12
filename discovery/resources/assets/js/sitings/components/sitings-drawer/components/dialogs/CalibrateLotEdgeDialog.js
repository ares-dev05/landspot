import PropTypes from 'prop-types';
import React from 'react';
import {PopupModal} from '~sitings~/helpers';

class CalibrateLotEdgeDialog extends React.Component {
    static propTypes = {
        userActionData: PropTypes.shape({
            lotEdgeModel: PropTypes.object.isRequired,
        }).isRequired,
        onCancel: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            length: ''
        };
    }

    componentDidMount() {
        const {
            userActionData: {
                lotEdgeModel
            },
        }              = this.props;
        const length = Number(lotEdgeModel.length.toFixed(3));
        this.setState({length});
    }

    calibrateEdge = () => {
        const {
            userActionData: {
                lotEdgeModel
            },
            onCancel
        }              = this.props;
        const {length} = this.state;

        lotEdgeModel.manipulator.length = length;
        onCancel();
    };

    cancelCalibration = () => {
        this.props.onCancel();
    };

    render() {
        const {length} = this.state;
        return (
            <PopupModal title="Edit Edge"
                        onModalHide={this.calibrateEdge}
                        onOK={this.calibrateEdge}
                        dialogClassName='measurement'
                        customFooterButtons={
                            <React.Fragment>
                                <button className={'button default'}
                                        onClick={this.cancelCalibration}>
                                    Cancel
                                </button>
                                <button className={'button default'}
                                        onClick={this.calibrateEdge}>
                                    Save
                                </button>
                            </React.Fragment>
                        }
                        hideCancelButton={true}
                        hideOKButton={true}>
                <div className="form-rows">
                    <div className="form-row">
                        <label className="left-item">Length: </label>
                        <div className='landconnect-input'>
                            <input type='number'
                                   autoComplete="off"
                                   onChange={(e) => {
                                       this.setState({length: parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0});
                                   }}
                                   maxLength={5}
                                   placeholder='Length'
                                   value={length || ''}
                            />
                        </div>
                    </div>
                </div>
            </PopupModal>
        );
    }
}

export default CalibrateLotEdgeDialog;