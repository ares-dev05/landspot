import React from 'react';
import UserAction from '../consts';
import EditMeasurementDialog from './EditMeasurementDialog';
import ClientsListDialog from './ClientsListDialog';
import {DrawerContext} from '../../DrawerContainer';
import CalibrateLotEdgeDialog from './CalibrateLotEdgeDialog';
import NextStepDialog from './NextStepDialog';


const DialogList = () => (
    <DrawerContext.Consumer>
        {({
              state: {
                  userAction,
                  userActionData,
                  heightVisualisationEnabled
              },
              setUserAction,
              resiteLot
          }) => {
            switch (userAction) {
                case UserAction.ASSIGN_TO_CLIENT:
                    return <ClientsListDialog
                        onCancel={() => {
                            setUserAction(null);
                        }}
                        userActionData={userActionData}
                    />;

                case UserAction.EDIT_MEASUREMENT:
                    return <EditMeasurementDialog
                        onCancel={() => {
                            setUserAction(null);
                        }}
                        userActionData={userActionData}
                        heightVisualisationEnabled={heightVisualisationEnabled}
                    />;

                case UserAction.CALIBRATE_EDGE:
                    return <CalibrateLotEdgeDialog
                        onCancel={() => {
                            setUserAction(null);
                        }}
                        userActionData={userActionData}
                    />;

                case UserAction.OPEN_PROCEED_DIALOG:
                    return <NextStepDialog
                        onCancel={() => {
                            setUserAction(null);
                        }}
                        resiteLot={resiteLot}
                    />;
            }
            return null;
        }}
    </DrawerContext.Consumer>
);

export default DialogList;