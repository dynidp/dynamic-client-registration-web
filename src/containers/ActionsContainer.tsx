import React, {useEffect} from "react";
import {AnyEventObject, AnyState, Interpreter, PayloadSender, StateLike, StateNode, TransitionDefinition} from "xstate";
import {
    Button,
    List,
    ListItem,
    ListItemText,
    Paper,
    Typography,
    AppBar,
    Box,
    responsiveFontSizes,
    createTheme,
    ThemeProvider,
    Theme,
    StyledEngineProvider,
    Icon,
    ListItemIcon
} from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import {AuthService} from "../machines/authMachine";
import {useActor} from "@xstate/react";
import {EventObject, Sender} from "xstate/lib/types";
import {MailOutline, LoginOutlined} from "@mui/icons-material"
import IconButton from '@mui/material/IconButton';
import {NotificationsService} from "../machines/notificationsMachine";

declare module '@mui/styles/defaultTheme' {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DefaultTheme extends Theme {
    }
}

 
export interface Props {
    authService: AuthService;
    notificationsService: NotificationsService;
}

const EventsContainer: React.FC<Props> = ({authService, notificationsService}) => {
    const [authState] = useActor(authService);

    const sendEvent = authService.send;
   
    const events: Array<{ type: string, icon: string, info: string }> = [{
        type: "LOGIN",
        icon: 'login',
        info: 'Login!',
    },
        {
            type: "LOGOUT",
            icon: 'logout',
            info: 'Logout'
        },
        {
            type: "REGISTER",
            icon: 'mail',
            info: 'Register new organization'
        }];
    return (
        <div id="main-navbar" className="navbar mobile-navbar is-inline-flex is-not-transparent is-mobile no-shadow">
            <div className="container is-fluid">
                <div className="navbar-brand">
                    <a href="/cdc-starter-kit/"
                       className="navbar-item hint--bottom hint--bounce hint--infoo hint--rounded "
                       aria-label="Goto Home">
                        <img className="menu-pic site-logo" src="/img/sap.png" width="150" style={{float: "none"}}
                             alt="{{Title}}"/>
                        <h5 className="menu-description is-size-5 has-text-weight-bold">CDC Starter Kit</h5>
                    </a>
                    <div className="navbar-start logged">
                        

                       
                    </div>
                </div>
                
                <div className="navbar-brand">
                    <div className="navbar-end">
                    {
                        events.map(({type, icon, info}) => {
                            return (
                                <ListItemIcon key={type}>
                                    <Event  state={authState} send={sendEvent} type={type} icon={icon}
                                            info={info}/>
                                </ListItemIcon>
                            );
                        })}
                    </div>

               </div>
            </div>
        </div>
    );
};

export const Event = (props: { type: string, state: AnyState, send: PayloadSender<any>, icon: string, info: string }) => {
 
    const {state, send, type, info, icon} = props;
    const defaultEvent = state?.meta?.eventPayloads?.[type] || {};
  
    return (

        <div className="navbar-item is-icon drop-trigger">

            <a className="icon-link is-primary hint--bottom hint--bounce hint--infoo hint--rounded " aria-label={info}
               href="#"
               onClick={() => {
                   // flyJson(eventData, eventData.Type);
                   send({
                       ...defaultEvent,
                       // ...event,
                       type: type,
                   });
               }}>

                <Icon  baseClassName="material-icons material-icons-outlined">{icon}</Icon>

            </a>

        </div>


    );
};

export default EventsContainer;
