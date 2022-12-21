import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withAlert} from 'react-alert';
import {PopupModal} from '~/popup-dialog/PopupModal';
import ShortListTable from './ShortListTable';
import {FormRowDropdown} from '~/helpers/FormRow';
import {LoadingSpinner} from '~/helpers';
import {isEmpty, isArray, isEqual} from 'lodash';
import * as actions from '../../store/popupDialog/actions';

class EstateShortListModal extends React.Component {
    static propTypes = {
        onCancel: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired,
        estates: PropTypes.array.isRequired,
        shortLists: PropTypes.array.isRequired,
        loading: PropTypes.bool.isRequired,
        errors: PropTypes.array.isRequired,
        userActionData: PropTypes.shape({
            id: PropTypes.number.isRequired
        }).isRequired,
        alert: PropTypes.object.isRequired,
        updated: PropTypes.bool
    };
    static defaultProps = {
        updated: false
    };

    state = {
        estateSelected: {},
        stageSelected: {},
        lotSelected: {},
        createShortLists: [],
        removeShortLists: []
    };

    componentDidMount() {
        const {userActionData, getShortLists} = this.props;
        getShortLists(userActionData);
    }

    componentWillUnmount() {
        this.props.resetDialogStore();
    }

    componentDidUpdate(prevProps) {
        const {
            shortLists,
            estates,
            errors,
            alert: {error, success},
            onCancel,
            updated
        } = this.props;

        if (errors && errors.length) {
            error(
                errors.map((error, errorIndex) => (
                    <div key={errorIndex}>{error.message || error}</div>
                ))
            );
            onCancel();
        }
        if (updated) {
            success('Short list updated!');
            onCancel();
        }
        if (shortLists.length && !isEqual(shortLists, prevProps.shortLists)) {
            const estateSelected =
                estates.find(estate => estate.id === shortLists[0].estate_id) ||
                {};
            this.setState({
                estateSelected
            });
        }
    }

    stages = () => {
        const {estateSelected} = this.state;

        if (!isEmpty(estateSelected) && isArray(estateSelected.stage)) {
            return estateSelected.stage.map(item => ({
                text: item.name,
                value: item.id
            }));
        }
        return [];
    };

    lots = () => {
        const {stageSelected} = this.state;
        if (!isEmpty(stageSelected) && isArray(stageSelected.lots)) {
            return stageSelected.lots.map(item => ({
                text: item.lot_number,
                value: item.id
            }));
        }
        return [];
    };

    onEstateSelectChange = index =>
        this.setState({
            estateSelected:
                this.props.estates.find(estate => estate.id === index) || {},
            stageSelected: {},
            lotSelected: {}
        });
    onSaveChanges = () => {
        const {
            onCancel,
            updateShortLists,
            alert: {success}
        } = this.props;
        const {createShortLists, removeShortLists} = this.state;

        if (createShortLists.length || removeShortLists.length) {
            updateShortLists({
                remove: removeShortLists,
                create: createShortLists
            });
        } else {
            success('Short list updated!');
            onCancel();
        }
    };

    shortListAlreadyPresent = () => {
        const {
            estateSelected,
            lotSelected,
            stageSelected,
            createShortLists
        } = this.state;
        return (
            this.props.shortLists.find(
                ({estate_id, short_list}) =>
                    estate_id === estateSelected.id &&
                    short_list.some(
                        ({lot_id, stage_id}) =>
                            lot_id === lotSelected.id &&
                            stage_id === stageSelected.id
                    )
            ) ||
            createShortLists.some(
                ({lot_id, estate_id, stage_id}) =>
                    lot_id === lotSelected.id &&
                    estate_id === estateSelected.id &&
                    stage_id === stageSelected.id
            )
        );
    };
    shortListInDeleted = () => {
        const {
            lotSelected,
            stageSelected,
            estateSelected,
            removeShortLists
        } = this.state;
        return removeShortLists.some(
            ({lot_id, estate_id, stage_id}) =>
                lot_id === lotSelected.id &&
                estate_id === estateSelected.id &&
                stage_id === stageSelected.id
        );
    };
    onAddShortList = () => {
        const {
            createShortLists,
            lotSelected,
            stageSelected,
            estateSelected,
            removeShortLists
        } = this.state;

        if (this.shortListInDeleted()) {
            this.setState({
                removeShortLists: removeShortLists.filter(
                    ({lot_id, estate_id, stage_id}) =>
                        !(
                            lot_id === lotSelected.id &&
                            estate_id === estateSelected.id &&
                            stage_id === stageSelected.id
                        )
                )
            });
        } else if (!isEmpty(lotSelected) && !this.shortListAlreadyPresent()) {
            const shortList = {
                invited_user_id: this.props.userActionData.id,
                lot_id: lotSelected.id,
                stage_id: stageSelected.id,
                estate_id: estateSelected.id,
                stage_name: stageSelected.name,
                lot_number: lotSelected.lot_number
            };

            this.setState({
                createShortLists: [...createShortLists, shortList]
            });
        }
    };

    tableData = () => {
        const {estateSelected, createShortLists, removeShortLists} = this.state;
        const {shortLists} = this.props;
        let list = shortLists.find(
            list => list.estate_id === estateSelected.id
        );

        list = list
            ? list.short_list.filter(
                  item =>
                      !removeShortLists.some(
                          removeItem =>
                              removeItem.stage_id == item.stage_id &&
                              removeItem.lot_id == item.lot_id
                      )
              )
            : [];
        return [
            ...list,
            ...createShortLists.filter(
                item => item.estate_id === estateSelected.id
            )
        ];
    };
    onShortListDelete = deleteItem => {
        const {createShortLists, removeShortLists, estateSelected} = this.state;

        if (createShortLists.find(item => isEqual(item, deleteItem))) {
            this.setState({
                createShortLists: createShortLists.filter(
                    item => !isEqual(item, deleteItem)
                )
            });
        } else {
            deleteItem.estate_id = estateSelected.id;
            this.setState({
                removeShortLists: [...removeShortLists, deleteItem]
            });
        }
    };

    render() {
        const {stageSelected, lotSelected, estateSelected} = this.state;
        const {onCancel, estates, loading} = this.props;

        return (
            <PopupModal
                dialogClassName={'wide-popup overflow-unset'}
                okButtonTitle={'Save changes'}
                title={'Short List'}
                onOK={this.onSaveChanges}
                onModalHide={onCancel}
            >
                {loading && <LoadingSpinner className={'overlay'} />}
                <p className="short-list_title">Select Estate</p>
                <div className="short-list_form">
                    <FormRowDropdown
                        defaultItem={isEmpty(estateSelected) ? 'Estate' : null}
                        defaultValue={0}
                        items={estates.map(item => ({
                            text: item.name,
                            value: item.id
                        }))}
                        onChange={this.onEstateSelectChange}
                        value={estateSelected.id}
                    />
                </div>
                <p className="short-list_title">Add Lot</p>
                <div className="short-list_form">
                    <FormRowDropdown
                        defaultItem={
                            isEmpty(stageSelected) ? 'Select Stage' : null
                        }
                        defaultValue={0}
                        items={isEmpty(estateSelected) ? [] : this.stages()}
                        onChange={stageId =>
                            this.setState({
                                stageSelected:
                                    estateSelected.stage.find(
                                        stage => stage.id === stageId
                                    ) || {},
                                lotSelected: {}
                            })
                        }
                        value={stageSelected.id}
                    />
                    <FormRowDropdown
                        defaultItem={isEmpty(lotSelected) ? 'Select Lot' : null}
                        defaultValue={0}
                        items={isEmpty(stageSelected) ? [] : this.lots()}
                        onChange={lotId =>
                            this.setState({
                                lotSelected:
                                    stageSelected.lots.find(
                                        lot => lot.id === lotId
                                    ) || {}
                            })
                        }
                        value={lotSelected.id}
                    />
                    <button
                        className="add-button"
                        onClick={this.onAddShortList}
                    >
                        <i className="fal fa-lg fa-plus-circle" />
                        Add Lot
                    </button>
                </div>
                <p className="short-list_title">Lots</p>
                <ShortListTable
                    shortList={this.tableData()}
                    onDelete={this.onShortListDelete}
                />
            </PopupModal>
        );
    }
}

export default withAlert(
    connect(
        state => ({
            shortLists: state.popupDialog.shortLists,
            estates: state.myClients.estates,
            loading: state.popupDialog.loading,
            errors: state.popupDialog.errors,
            updated: state.popupDialog.updated
        }),
        actions
    )(EstateShortListModal)
);
