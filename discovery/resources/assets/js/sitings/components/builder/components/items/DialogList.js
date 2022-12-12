import React from 'react';
import {
    ViewFloorplanHistoryDialog,
    EditFloorplanDialog,
    ViewFloorplanFilesDialog,
    ViewFloorplanDialog,
    BulkFloorplanUploaderDialog,
    SVGEditorDialog,
} from '../items/dialogs';

import {ConfirmDeleteDialog} from './dialogs/ConfirmDeleteDialog';

export const DialogContext = React.createContext({});

export const UserAction = Object.freeze({
    ADD_FLOORPLAN: Symbol('ADD_FLOORPLAN'),
    EDIT_FLOORPLAN: Symbol('EDIT_FLOORPLAN'),
    VIEW_FLOORPLAN: Symbol('VIEW_FLOORPLAN'),
    CHOOSE_FLOORPLAN: Symbol('CHOOSE_FLOORPLAN'),
    CONFIRM_REMOVE_ITEM: Symbol('CONFIRM_REMOVE_ITEM'),
    VIEW_HISTORY: Symbol('VIEW_HISTORY'),
    VIEW_FILES: Symbol('VIEW_FILES'),
    BULK_UPLOADER: Symbol('BULK_UPLOADER'),
    SVG_EDITOR: Symbol('SVG_EDITOR'),
});

export const DialogList = ({userAction, setUserAction, userActionData, onConfirmDelete, gotoFloorplans}) => {
    let component = null;
    const resetUserAction = () => setUserAction(null);
    switch (userAction) {
        case UserAction.VIEW_HISTORY:
            component = <ViewFloorplanHistoryDialog
                onCancel={resetUserAction}
                userActionData={userActionData}
            />;
            break;

        case UserAction.VIEW_FILES:
            component = <ViewFloorplanFilesDialog
                onCancel={resetUserAction}
                userActionData={userActionData}
            />;
            break;

        case UserAction.EDIT_FLOORPLAN:
            component = <EditFloorplanDialog
                onCancel={resetUserAction}
                userActionData={userActionData}
            />;
            break;

        case UserAction.VIEW_FLOORPLAN:
            component = <ViewFloorplanDialog
                onCancel={gotoFloorplans}
                userActionData={userActionData}
            />;
            break;

        case UserAction.BULK_UPLOADER:
            component = <BulkFloorplanUploaderDialog
                onCancel={resetUserAction}
                userActionData={userActionData}
            />;
            break;

        case UserAction.CONFIRM_REMOVE_ITEM:
            component = <ConfirmDeleteDialog
                onConfirm={onConfirmDelete}
                userActionData={userActionData}
                onCancel={resetUserAction}
            />;
            break;

        case UserAction.SVG_EDITOR:
            component = <SVGEditorDialog
                userActionData={userActionData}
                onCancel={resetUserAction}
            />;
            break;

        default:
            component = null


    }
    return component;
};
