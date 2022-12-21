import React from 'react';
import PropTypes from 'prop-types';
import {FormRowDropdown} from '~/helpers/FormRow';
import {isEmpty, isArray, isEqual} from 'lodash';

class ShortListComponent extends React.Component {
    static propTypes = {
        houses: PropTypes.array.isRequired,
        clientId: PropTypes.number.isRequired,
        shortLists: PropTypes.array.isRequired,
        createdShortLists: PropTypes.array.isRequired,
        removedShortLists: PropTypes.array.isRequired,
        onUpdateCreateShortList: PropTypes.func.isRequired
    };

    state = {
        floorplanSelected: {},
        facadeSelected: {}
    };

    onFloorplanSelectChange = index =>
        this.setState({
            floorplanSelected:
                this.props.houses.find(house => house.id === index) || {},
            facadeSelected: {}
        });

    facades = () => {
        const {floorplanSelected} = this.state;

        if (!isEmpty(floorplanSelected) && isArray(floorplanSelected.facades)) {
            return floorplanSelected.facades.map(item => ({
                text: item.title,
                value: item.id
            }));
        }
        return [];
    };
    shortListAlreadyPresent = () => {
        const {
            floorplanSelected,
            facadeSelected
        } = this.state;
        const {createdShortLists} = this.props;
        let compareShortList = ({house_id, facade_id}) =>
            house_id === floorplanSelected.id &&
            facade_id === facadeSelected.id;

        return (
            this.props.shortLists.find(compareShortList) ||
            createdShortLists.some(compareShortList)
        );
    };
    shortListInDeleted = () => {
        const {
            facadeSelected,
            floorplanSelected
        } = this.state;
        const {removedShortLists} = this.props;
        return removedShortLists.some(
            ({house_id, facade_id}) =>
                house_id === floorplanSelected.id &&
                facade_id === facadeSelected.id
        );
    };
    onAddShortList = () => {
        const {
            floorplanSelected,
            facadeSelected
        } = this.state;
        const {
            createdShortLists,
            removedShortLists,
            onUpdateCreateShortList,
            onUpdateRemoveShortList,
            clientId
        } = this.props;

        if (this.shortListInDeleted()) {
            onUpdateRemoveShortList(removedShortLists.filter(
                ({house_id, facade_id}) =>
                    !(
                        house_id === floorplanSelected.id &&
                        facade_id === facadeSelected.id
                    )
            ));
        } else if (
            !isEmpty(facadeSelected) &&
            !this.shortListAlreadyPresent()
        ) {
            const shortList = {
                invited_user_id: clientId,
                house_id: floorplanSelected.id,
                house_name: floorplanSelected.title,
                facade_name: facadeSelected.title,
                facade_id: facadeSelected.id
            };
            onUpdateCreateShortList([...createdShortLists, shortList]);
        }
    };
    onShortListDelete = deleteItem => {
        const {createdShortLists, removedShortLists, onUpdateCreateShortList, onUpdateRemoveShortList} = this.props;

        if (createdShortLists.find(item => isEqual(item, deleteItem))) {
            onUpdateCreateShortList(createdShortLists.filter(
                item => !isEqual(item, deleteItem)
            ));
        } else {
            onUpdateRemoveShortList([...removedShortLists, deleteItem]);
        }
    };
    tableData = () => {
        const {createdShortLists, removedShortLists, shortLists} = this.props;

        let list =
            shortLists.filter(
                item =>
                    !removedShortLists.some(
                        removeItem =>
                            removeItem.house_id == item.house_id &&
                            removeItem.facade_id == item.facade_id
                    )
            ) || [];
        return [...list, ...createdShortLists];
    };

    render() {
        const {houses = []} = this.props;
        const {floorplanSelected, facadeSelected} = this.state;

        return (
            <div className="short-list">
                <p className="short-list_title">Add Floorplan</p>
                <div className="short-list_form">
                    <FormRowDropdown
                        label="SELECT FLOORPLAN"
                        defaultItem={
                            isEmpty(floorplanSelected) ? 'Floorplan' : null
                        }
                        defaultValue={0}
                        items={houses.map(item => ({
                            text: item.title,
                            value: item.id
                        }))}
                        onChange={this.onFloorplanSelectChange}
                        value={floorplanSelected.id}
                    />
                    <FormRowDropdown
                        label="SELECT FACADE"
                        defaultItem={isEmpty(facadeSelected) ? 'Facade' : null}
                        defaultValue={0}
                        items={isEmpty(floorplanSelected) ? [] : this.facades()}
                        onChange={id =>
                            this.setState({
                                facadeSelected:
                                    floorplanSelected.facades.find(
                                        facade => facade.id === id
                                    ) || {}
                            })
                        }
                        value={facadeSelected.id}
                    />
                    <button
                        className="add-button"
                        onClick={this.onAddShortList}
                    >
                        <i className="fal fa-lg fa-plus-circle"/>
                        Add
                    </button>
                </div>
                <p className="short-list_title">Floorplans</p>
                <table className="table short-list_table">
                    <tbody>
                    {this.tableData().length ? (
                        this.tableData().map((item, index) => (
                            <tr key={index}>
                                <td width="45%">{item.house_name}</td>
                                <td width="45%">
                                        <span className="my-client-theme-text">
                                            {item.facade_name}
                                        </span>
                                </td>
                                <td className="actions">
                                    <a
                                        onClick={() =>
                                            this.onShortListDelete(item)
                                        }
                                    >
                                        <i className="landspot-icon trash"/>
                                    </a>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td className="my-clients-table_one-cell">
                                Table is empty
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default ShortListComponent;
