import React, {useEffect} from "react";
import {ActionTypes, ActorRef, AnyEventObject, AnyState,AnyInterpreter} from "xstate";
import {Box, FormControlLabel, Paper, Slide, Switch, Typography} from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import NotificationList from "../logger/NotificationList";
import {AuthService} from "../machines/authMachine";
import {NotificationResponseItem, NotificationsService} from "../machines/notificationsMachine";
import {omit} from "lodash/fp";
import {useActor, useSelector} from "@xstate/react";
import {ErrorBoundary} from "../logger/NotificationListItem";
import {getPayload, isUpdateType, useAppLogger} from "../logger/useApplicationLogger";
import {AnyRecord} from "../models";
declare type  AppService= AnyInterpreter;

const useStyles = makeStyles((theme) => ({
    paper: {
        minHeight: "90vh",
        padding: theme.spacing(2),
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
    },
}));

export interface Props {
    notificationsService: NotificationsService;
}

 

interface NotificationUpdatePayload {
}
 

const NotificationsContainer: React.FC<Props> = ({ notificationsService}) => {
    const classes = useStyles();
    const [notificationsState, sendNotifications] = useActor(notificationsService);
    // const apps = useSelector(app, appsSelector) || [];

    function getType(state: AnyState) {
        return !state.event?.type ?
            "" :
            state.event.type.toLowerCase() === "xstate.update" ?
                "update" :
                state.event.type.toLowerCase()
    }

     
    const handleChange = () => {
        if (notificationsState.matches("visible")) {
            sendNotifications("HIDE");
        } else {
            sendNotifications("SHOW");
        }
    };

    const updateNotification = (payload: NotificationUpdatePayload) => {
    };
    const checked = notificationsState.matches("visible");

    // @ts-ignore
    return (

            <Box>
               
                <FormControlLabel
                    control={<Switch checked={notificationsState.matches("visible")} onChange={handleChange}/>}
                    label="Show logger"
                />
                <Slide direction="up" in={checked}>
                    <Paper className={classes.paper}>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Logger
                        </Typography>

                        <NotificationList
                            notifications={notificationsState?.context?.notifications!}
                            updateNotification={updateNotification}/>
                    </Paper>
                </Slide>
            </Box>
    );
};

export default NotificationsContainer;

