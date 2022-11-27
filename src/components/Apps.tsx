import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import {AuthService} from "../machines/authMachine";
import {useSelector} from "@xstate/react";
import {ActorRef, AnyState} from "xstate";
import {Paper} from "@mui/material";
import {styled} from '@mui/material/styles';
import {AppMachine} from "../machines/appMachine";
import {ApplicationCard} from "./ApplicationCard";
import {PortalApplicationRef} from "../machines/portalApplication";
import {NotificationsService} from "../machines/notificationsMachine";
 


export interface ProfileProps {
    authService: AuthService;
    notificationsService: NotificationsService;
}

const contextSelector = (state: AnyState) => state?.context;

function Apps({ authService, notificationsService }: ProfileProps) {
    // const { apps } = useSelector(authService, userSelector) || {};
    const { app } = useSelector(authService, contextSelector) || {};
    const { apps } = useSelector(app, contextSelector) || {};
    
    return (
        <> 
            {apps?.length > 0 ? (
                <div className="columns is-multiline">
                    {apps.map((app: PortalApplicationRef) => (
                        <ApplicationCard
                            notificationsService={notificationsService}
                            key={app.name}
                            app={app}
                        />
                    ))}
                </div>
            ) : (
                <></>
            )}
        </>
    );
}


const appsSelector = (app: ActorRef<AppMachine>) => app.getSnapshot().state?.context?.apps;

export default Apps;
