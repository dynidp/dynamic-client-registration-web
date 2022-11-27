import React, {useEffect} from "react";
import {ActionTypes, ActorRef, AnyEventObject, AnyState} from "xstate";
import {Box, FormControlLabel, Paper, Slide, Switch, Typography} from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import NotificationList from "../logger/NotificationList";
import {AuthService} from "../machines/authMachine";
import {NotificationResponseItem, NotificationsEvents, NotificationsService} from "../machines/notificationsMachine";
import {omit} from "lodash/fp";
import {useActor, useSelector} from "@xstate/react";
import {AppMachine, AppService} from "../machines/appMachine";
import {ErrorBoundary} from "../logger/NotificationListItem";
import {isUpdateType, useAppLogger} from "../logger/useApplicationLogger";

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
    authService: AuthService;
    notificationsService: NotificationsService;
}

function generateUniqueID() {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2, 9);
}


interface NotificationUpdatePayload {
}

const contextSelector = (state: AnyState) => state?.context;
const appSelector = (state: AnyState) => state?.context?.app;
const compareApp = (prevApp: ActorRef<AppMachine>, nextNext: ActorRef<AppMachine>) => prevApp?.id === nextNext?.id;

const appsSelector = (state: AnyState) => state?.context?.apps;

function getPayload(event: AnyEventObject) {
    return {
        ...omit(['type', 'data', 'service', 'loader'], event),
        ...(event.data || {})

    };
}

function doneDetails(event: AnyEventObject): Partial<NotificationResponseItem> {
    if (event.type.indexOf('DONE.') > 0) {
        const title = `done: ${event.type.replace('DONE.INVOKE.', '').replace(':INVOCATION[0]', '')}`
        return {
            severity: 'success',
            title

        }
    }
    return {};
}


function errorDetails(event: AnyEventObject): Partial<NotificationResponseItem> {
    if (event.type.indexOf('ERROR.') > 0) {
        const title = `${event.type.toLowerCase()
            .replace(ActionTypes.ErrorCommunication, 'communication error: ')
            .replace(ActionTypes.ErrorExecution, 'execution error: ')
            .replace(ActionTypes.ErrorCustom, 'error: ')

            .replace(':invocation[0]', '')} `;
        return {
            severity: 'error',
            title

        }
    }
    return {};
}


const emptySubscriber = {
    subscribe: ((observer: (state: AnyState) => {}) => {
                return {
                    unsubscribe: () => {
                    }
                };
        }
    )

}

const NotificationsContainer: React.FC<Props> = ({authService, notificationsService}) => {
    const classes = useStyles();
    const [notificationsState, sendNotifications] = useActor(notificationsService);
    const app = useSelector(authService, appSelector, compareApp) ;
    // const apps = useSelector(app, appsSelector) || [];
    useAppLogger(app as unknown as AppService, sendNotifications);


    function getType(state: AnyState) {
        return !state.event?.type ?
            "" :
            state.event.type.toLowerCase() === "xstate.update" ?
                "update" :
                state.event.type.toLowerCase()
    }

    useEffect(() => {
        authService.subscribe(state => {
            if (!state || isUpdateType(state)) return;
            sendNotifications({
                type: "ADD", notification: {
                    id: generateUniqueID(),
                    title: `${state.value}`,
                    severity: 'success',
                    summary: `event: ${getType(state)}`,
                    group: 'auth',
                    icon: 'login',
                    payload: getPayload(state.event),
                    ...doneDetails(state.event),
                    ...errorDetails(state.event)
                }
            })
        })

    }, [authService])


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
                <ErrorBoundary data={app}>
                    {/*{app && <AppsListener app={app} notifications={notificationsService}/>}*/}
                </ErrorBoundary>
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

