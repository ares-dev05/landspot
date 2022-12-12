import {
    UPDATE_LOT_PACKAGES,
    UPDATE_LOT_VISIBILITY
} from '../popupDialog/actions';
import * as estateActions from './actions';
import {success, error} from '~/axios/api';
import * as actions from '../popupDialog/actions';
import {errorExtractor} from '~/helpers';

const initialState = Object.freeze({
    estate: null,
    stages: null,
    columns: null,
    loading: false
});

export default (state = initialState, action) => {
    switch (action.type) {
        case estateActions.PUSH_ESTATE_GALLERY:
            return {
                ...state,
                estate: {
                    ...state.estate,
                    estate_gallery: [
                        ...action.payload,
                        ...state.estate.estate_gallery
                    ]
                }
            };
        case estateActions.UPDATE_ESTATE_DESCRIPTION:
        case estateActions.ADD_AMENITY:
        case estateActions.DELETE_ESTATE_IMAGE:
        case estateActions.UPDATE_SNAPSHOTS:
        case estateActions.UPDATE_ANSWERS:
        case estateActions.BULK_UPDATE_LOT:
            return {...state, loading: true};
        case success(estateActions.ADD_COLUMN):
        case success(estateActions.RENAME_COLUMN):
        case success(estateActions.ADD_LOT):
        case success(estateActions.ADD_STAGE):
        case success(estateActions.DELETE_STAGE):
        case success(estateActions.GET_ESTATE_LOTS):
        case success(estateActions.MOVE_COLUMN):
        case success(estateActions.REMOVE_COLUMN):
        case success(estateActions.REMOVE_LOT):
        case success(estateActions.UPDATE_ESTATE):
        case success(estateActions.UPDATE_LOT):
        case success(estateActions.UPDATE_LOTMIX_LOT_VISIBILITY):
        case success(estateActions.UPDATE_STAGE):
        case success(estateActions.SAVE_PRICE_LIST):
        case success(actions.UPDATE_LOT_PACKAGES):
        case success(UPDATE_LOT_VISIBILITY):
        case success(actions.DELETE_LOT_PACKAGE):
        case success(estateActions.BULK_UPDATE_LOT):
            return {...state, ...action.payload.data, loading: false};
        case success(estateActions.DELETE_ESTATE_IMAGE):
            return {
                ...state,
                message: action.payload.data.message,
                estate: {
                    ...state.estate,
                    estate_gallery: action.payload.data.estate_gallery
                },
                estateImageDeleted: true,
                loading: false
            };
        case success(estateActions.ADD_AMENITY):
        case success(estateActions.UPDATE_SNAPSHOTS):
        case success(estateActions.UPDATE_ANSWERS):
            return {
                ...state,
                estate: {
                    ...state.estate,
                    ...action.payload.data
                },
                loading: false
            };
        case estateActions.RESET_POPUP_MESSAGES: {
            const newState = {...state};
            delete newState['ajax_success'];
            delete newState['errors'];
            return newState;
        }

        case success(UPDATE_LOT_PACKAGES): {
            const newState = {...state, loading: false};
            newState['ESTATE_UPDATED'] = true;
            return newState;
        }
        case success(estateActions.UPDATE_ESTATE_DESCRIPTION): {
            const newState = {...state, loading: false};
            newState.descriptionUpdated = true;
            return newState;
        }

        // case success(estateActions.BULK_UPDATE_LOT): {
        //     const stages = state.stages.map(stage => stage.id === action.payload.data.stageId
        //         ? {
        //             ...stage, lots: stage.lots.map(lot =>
        //             {
        //                 const actionLot = action.payload.data.lots.find(actionLot => actionLot.lot_number === lot[0]);
        //                 lot[4] = actionLot['title_date'];
        //                 return lot;
        //             })
        //         }
        //         : stage
        //     );
        //     return {
        //         ...state,
        //         ESTATE_UPDATED: true,
        //         stages,
        //         loading: false
        //     };
        // }

        case 'RESET_ESTATE_UPDATED': {
            const newState = {...state};
            delete newState['ESTATE_UPDATED'];
            return newState;
        }
        case 'RESET_ERRORS': {
            const newState = {...state};
            delete newState.errors;
            return newState;
        }
        case 'RESET_DESCRIPTION_UPDATED': {
            const newState = {...state};
            delete newState.descriptionUpdated;
            return newState;
        }
        case 'RESET_ESTATE_IMAGE_DELETED': {
            const newState = {...state};
            delete newState.estateImageDeleted;
            return newState;
        }

        case error(estateActions.ADD_COLUMN):
        case error(estateActions.ADD_LOT):
        case error(estateActions.ADD_STAGE):
        case error(estateActions.DELETE_STAGE):
        case error(estateActions.MOVE_COLUMN):
        case error(estateActions.REMOVE_COLUMN):
        case error(estateActions.REMOVE_LOT):
        case error(estateActions.UPDATE_ESTATE):
        case error(estateActions.UPDATE_ESTATE_DESCRIPTION):
        case error(estateActions.UPDATE_LOT):
        case error(estateActions.UPDATE_STAGE):
        case error(actions.UPDATE_LOT_PACKAGES):
        case error(UPDATE_LOT_VISIBILITY):
        case error(actions.DELETE_LOT_PACKAGE):
        case error(estateActions.RENAME_COLUMN):
        case error(estateActions.SAVE_PRICE_LIST):
        case error(estateActions.ADD_AMENITY):
        case error(estateActions.DELETE_ESTATE_IMAGE):
        case error(estateActions.UPDATE_LOTMIX_LOT_VISIBILITY):
        case error(estateActions.GET_ESTATE_LOTS):
        case error(estateActions.UPDATE_SNAPSHOTS):
        case error(estateActions.UPDATE_ANSWERS):
        case error(estateActions.BULK_UPDATE_LOT): {
            return {
                ...state,
                errors: errorExtractor(action),
                loading: false
            };
        }

        case estateActions.RESET_ESTATE_DATA:
            return initialState;

        default: {
            return state;
        }
    }
};
