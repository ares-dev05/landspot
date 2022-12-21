import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import FileUploader from '~/file-uploader/FileUploader';
import MenuList from '../../../helpers/MenuList';
import * as actions from '../../store/estate/actions';
import UserAction from './consts';
import {EstateDataContext} from '../Estate-new';
import {clickHandler} from '~/helpers';
import NiceDropdown from '~/helpers/NiceDropdown';
import StageLotsTable from './StageLotsTable';
import {EstateLotsDataContext} from './EstateLots';

class Stage extends React.Component {
    static propTypes = {
        estateData: PropTypes.shape({
            isBuilder: PropTypes.bool.isRequired,
            permissions: PropTypes.array,
        }),
        stage: PropTypes.object,
        userAction: PropTypes.symbol,
        userActionData: PropTypes.object,
        setUserAction: PropTypes.func.isRequired,
        checkPermission: PropTypes.func.isRequired,
        selectedFilters: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
    }

    render() {
        const {
            estateData: {
                isBuilder,
                permissions
            },
            stage,
            userAction,
            setUserAction,
            userActionData,
            checkPermission,
            selectedFilters: filters
        } = this.props;

        const canEdit = !isBuilder && !checkPermission('read_only');
        const listManagerOnly = permissions.length === 1 && checkPermission('list_manager');
        return (
            <EstateLotsDataContext.Consumer>
                {
                    ({
                         toggleDisplayNewLot, onRemove, saveColumn, priceListUploaded,
                         priceListUploadBefore, priceListUploadError, updateStageStatus
                    }) => (
                        <React.Fragment>
                            <div className="header table-header stage">
                                <div className="title">
                                    {stage.name}
                                </div>

                                {
                                    canEdit &&
                                    <div className="actions">

                                        <button className='button default'
                                                onClick={() => setUserAction(UserAction.CONFIRM_MAKE_STAGE_SOLD_OUT, {
                                                    stage,
                                                    filters
                                                })}
                                        >{stage.sold ? 'SOLD OUT' : 'SOLD OUT?'}</button>

                                        <span className="status">STATUS</span>
                                        <NiceDropdown
                                            disabled={!!(stage.sold && stage.published)}
                                            defaultItem={null}
                                            items={[
                                                {text: 'Published', value: 1},
                                                {text: 'Unpublished', value: 0}
                                            ]}
                                            itemClass={stage.published ? 'published' : 'unpublished'}
                                            value={stage.published}
                                            onChange={published => updateStageStatus(published, stage)}
                                        />

                                        <a className='button transparent'
                                           onClick={(e) => clickHandler(e, onRemove('stage', stage.id))}>
                                            <i className="landspot-icon trash"/>
                                            Delete stage
                                        </a>
                                    </div>
                                }
                            </div>

                            {
                                canEdit &&
                                <div className="header table-header stage-actions">
                                    <FileUploader
                                        baseUrl={`/landspot/upload-price-list/${stage.id}`}
                                        acceptMime='text/csv'
                                        fileFieldName='file'
                                        chooseFileButton={
                                            <button type={'button'} className={'button transparent'}>
                                                <i className={'landspot-icon upload'}/>Upload Price List
                                            </button>
                                        }


                                        beforeUpload={priceListUploadBefore}
                                        uploadError={priceListUploadError}
                                        uploadSuccess={priceListUploaded}/>

                                    <div style={{marginLeft: '10px'}}>
                                        <button type={'button'}
                                                className={'button transparent'}
                                                onClick={() => setUserAction(UserAction.IMPORT_PRICE_LIST, {
                                                    stage,
                                                    filters,
                                                    priceEditor: checkPermission('price_editor')
                                                })}>
                                            <i className={'landspot-icon upload'}/>Import from clipboard
                                        </button>
                                    </div>

                                    <div className="edit-table">

                                        {
                                            ((userAction === UserAction.ADD_COLUMN || userAction === UserAction.EDIT_COLUMN) && userActionData.newColumnName !== '') &&
                                            <button type="button"
                                                    className="active button transparent"
                                                    onClick={saveColumn}>
                                                <i className="fal fa-save"/> Save column
                                            </button>
                                        }

                                        <MenuList
                                            title='Edit table'
                                            items={[
                                                {
                                                    text: 'Add a lot',
                                                    hidden: listManagerOnly,
                                                    handler: () => toggleDisplayNewLot(stage.id)
                                                }, {
                                                    text: 'Add a column',
                                                    handler: () => setUserAction(UserAction.ADD_COLUMN, {newColumnName: ''})
                                                }, {
                                                    text: 'Move column',
                                                    handler: () => setUserAction(UserAction.MOVE_COLUMN)
                                                }
                                            ]}
                                        />
                                    </div>
                                </div>
                            }

                            <StageLotsTable stage={stage}/>
                        </React.Fragment>
                    )
                }
            </EstateLotsDataContext.Consumer>
        );
    }
}

const StageConsumer = (props) => (
    <EstateDataContext.Consumer>
        {
            ({setUserAction, userAction, selectedFilters, userActionData, checkPermission}) =>
                <Stage {...props} {...{setUserAction, userAction, selectedFilters, userActionData, checkPermission}}/>
        }
    </EstateDataContext.Consumer>
);

export default connect((state => ({
    estateData: state.estate
})), actions)(StageConsumer);