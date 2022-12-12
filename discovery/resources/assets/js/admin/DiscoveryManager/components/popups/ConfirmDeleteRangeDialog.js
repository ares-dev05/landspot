import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {withAlert} from 'react-alert';
import NiceDropdown from '~/helpers/NiceDropdown';
import {ConfirmDeleteDialog, PopupModal} from '~/popup-dialog/PopupModal';

class ConfirmDeleteRangeDialog extends Component {
    static propTypes = {
        userActionData: PropTypes.oneOfType([
            PropTypes.shape({
                userRanges: PropTypes.array.isRequired
            })
        ]),
        onCancel: PropTypes.func.isRequired,
        removeHandler: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            selectedRange: {},
            openConfirm: false
        };
    }

    onRangeSelect = (rangeId) => {
        const {userActionData: {userRanges}} = this.props;
        const selectedRange = userRanges.find(range => range.id === rangeId);
        this.setState({selectedRange});
    };

    toggleConfirmDialog = () => {
        this.setState({openConfirm: !this.state.openConfirm});
    };

    render() {
        const {openConfirm, selectedRange} = this.state;
        const {onCancel, userActionData: {userRanges}, removeHandler} = this.props;
        return (
            <React.Fragment>
                <PopupModal title="Ranges list"
                            ref={(e) => this.dialog = e}
                            dialogClassName={'overflow-unset'}
                            okButtonDisabled={!selectedRange.id}
                            onOK={this.toggleConfirmDialog}
                            onModalHide={onCancel}
                >
                    <NiceDropdown
                        defaultItem='Select Range'
                        defaultValue={null}
                        items={
                            userRanges.map(range => ({value: range.id, text: range.name}))
                        }
                        onChange={rangeId => this.onRangeSelect(rangeId)}
                        value={selectedRange.id || null}
                    />
                </PopupModal>

                {openConfirm &&
                <ConfirmDeleteDialog onConfirm={removeHandler}
                                     userActionData={{
                                         itemName: selectedRange.name,
                                         itemId: selectedRange.id,
                                         itemType: 'range',
                                     }}
                                     onCancel={this.toggleConfirmDialog}
                />
                }
            </React.Fragment>
        );
    }
}

export default withAlert(ConfirmDeleteRangeDialog);