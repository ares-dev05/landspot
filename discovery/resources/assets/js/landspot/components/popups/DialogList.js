import React from 'react';
import UserAction from '../estate/consts';
import {EstateDataContext} from '../Estate-new';
import AddEstateModal from './AddEstateModal';
import AddStageModal from './AddStageModal';
import {ConfirmDeleteDialog} from '~/popup-dialog/PopupModal';
import ConfirmMakeStageSoldOut from './ConfirmMakeStageSoldOut';
import EstateExportStageDialog from './EstateExportStageDialog';
import EstateDocumentsDialog from './EstateDocumentsDialog';
import EstateDocumentsUploadDialog from './EstateDocumentsUploadDialog';
import LotPackagesDialog from './LotPackagesDialog';
import LotVisibilityDialog from './LotVisibilityDialog';
import PDFExportLotsTemplateEditor from './PDFExportLotsTemplateEditor';
import ImportPriceListDialog from './ImportPriceListDialog';
import LotDrawerDetailsDialog from '~/lot-drawer/components/popups';
import {ConfirmDialog} from '~/popup-dialog/PopupModal';

const DialogList = () => (
    <EstateDataContext.Consumer>
        {({
            userAction,
            userActionData,
            setUserAction,
            resetUserAction,
            selectedFilters

            // estate,
            // addStage,
            // alertContainer,
            // updateStage,
            // removeHandler,
            // saveLotVisibility,
            // updateEstateLots
        }) => {
            switch (userAction) {
                case UserAction.EDIT_ESTATE:
                    return (
                        <AddEstateModal
                            title="Edit estate"
                            {...userActionData}
                            onCancel={resetUserAction}
                        />
                    );

                case UserAction.CONFIRM_REMOVE_ITEM:
                    if (userActionData) {
                        return (
                            <ConfirmDeleteDialog
                                onConfirm={userActionData.removeHandler}
                                userActionData={userActionData}
                                onCancel={() => {
                                    setUserAction(null);
                                }}
                            />
                        );
                    }
                    break;

                case UserAction.EDIT_LOT_VISIBILITY:
                    return (
                        <LotVisibilityDialog
                            {...userActionData}
                            selectedFilters={selectedFilters}
                            onCancel={resetUserAction}
                        />
                    );

                case UserAction.EDIT_LOT_PACKAGES:
                    return (
                        <LotPackagesDialog
                            {...userActionData}
                            selectedFilters={selectedFilters}
                            onCancel={resetUserAction}
                        />
                    );

                case UserAction.ADD_STAGE:
                    return (
                        <AddStageModal
                            onCancel={resetUserAction}
                            {...userActionData}
                        />
                    );

                case UserAction.EDIT_ESTATE_PACKAGES:
                    return (
                        <EstateDocumentsUploadDialog
                            onCancel={resetUserAction}
                        />
                    );

                case UserAction.VIEW_ESTATE_PACKAGES:
                    return <EstateDocumentsDialog onCancel={resetUserAction} />;

                case UserAction.EXPORT_STAGE_LOTS:
                    return (
                        <EstateExportStageDialog
                            onCancel={resetUserAction}
                            {...userActionData}
                        />
                    );

                case UserAction.EDIT_LOTS_PDF_TEMPLATE:
                    return (
                        <PDFExportLotsTemplateEditor
                            {...{userActionData}}
                            onCancel={resetUserAction}
                        />
                    );

                case UserAction.CONFIRM_MAKE_STAGE_SOLD_OUT:
                    return (
                        <ConfirmMakeStageSoldOut
                            {...userActionData}
                            onCancel={resetUserAction}
                        />
                    );
                case UserAction.CONFIRM_REMOVE_IMAGE:
                    return (
                        <ConfirmDialog
                            onCancel={() => setUserAction(null)}
                            userActionData={userActionData}
                            onConfirm={userActionData.deleteImage}
                        >
                            <p>Are you sure you want to delete this image?</p>
                        </ConfirmDialog>
                    );

                case UserAction.IMPORT_PRICE_LIST:
                    return (
                        <ImportPriceListDialog
                            onCancel={resetUserAction}
                            {...userActionData}
                        />
                    );

                case UserAction.VIEW_LOT_DRAWER:
                    return (
                        <LotDrawerDetailsDialog
                            onCancel={resetUserAction}
                            {...userActionData}
                        />
                    );
            }
            return null;
        }}
    </EstateDataContext.Consumer>
);

export default DialogList;
