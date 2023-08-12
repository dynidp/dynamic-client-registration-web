import React, {useEffect, useState} from "react";
import {RouteComponentProps} from "@reach/router"

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import makeStyles from '@mui/styles/makeStyles';
import Container from "@mui/material/Container";
import {useInterpret, useSelector} from "@xstate/react";
import {AuthService} from "../machines/authMachine";
import {ErrorOutlined} from "@mui/icons-material";
import {Google, WindowTwoTone} from "@mui/icons-material";
import {NotificationsService} from "../machines/notificationsMachine";
import {AppAuthJs} from "../machines/AppAuth";
import {DCRClient} from "./DCR";
import {ProviderSelector} from "./Providers";
import {Services} from "../auth/OidcProvider";
import {DrActor} from "../machines/oidc-client/providers_machine";
import {useAppLogger} from "../logger/useApplicationLogger";
import {AnyInterpreter} from "xstate";
import {AuthorizationRequestJson} from "@openid/appauth/built/authorization_request";
 
const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: theme.spacing(1)
    },
    paperRow: {
        marginTop: theme.spacing(8),
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        margin: theme.spacing(1)
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
    },
    form: {
        width: "100%", // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(2, 0, 2),
    },
}));

export type CallbackProps = RouteComponentProps & {current: DrActor} & Services;
 

 const messageSelector = (state: any) => state.context.message;
const clientSelector = (state: any) => state.context?.client;
const issuerSelector = (state: any) => state.context?.issuer;
const configSelector = (state: any) => state.context?.config;
const errorSelector = (state: any) => state.context?.error;
const nameSelector = (state: any) => state.context?.name;

export default function Callback({current, notificationsService}: CallbackProps) {
    const classes = useStyles();
    useAppLogger(current as AnyInterpreter | undefined, notificationsService.send);

    const client = useSelector(current, clientSelector);
    const issuer = useSelector(current, issuerSelector);
    const config = useSelector(current, configSelector);
    const error = useSelector(current, errorSelector);

    const [codeRequest, setCodeRequest] = useState<AuthorizationRequestJson>({
        client_id: client?.client_id,
        scope: config?.scope || client?.scope,
        redirect_uri: config?.redirect_uri || client?.redirect_uris[0],
        response_type: 'code',
        state: 'dcr_web_client',
        extras: {'prompt': 'none', 'access_type': 'offline'}

    });



    useEffect(() => {
        if (client) {

            // @ts-ignore
            setCodeRequest({
                ...codeRequest,
                client_id: client?.client_id,
                scope: config?.scope || client?.scope,
                redirect_uri: config?.redirect_uri || client?.redirect_uris[0],


            });
        }
        return () => {
        };
    }, [client]);
    
    const [appAuth, setAppAuth] = useState<AppAuthJs>();
 
     const message = useSelector(current, messageSelector);
 
    const showMessage=(message: string) =>{
        // @ts-ignore
        notificationsService.send({type:'ADD', notification:{ group:"app-auth", title: message, payload:{}, icon:'login', severity:'info'}});
    }
    useEffect(() => {
        if (codeRequest) {

            // @ts-ignore
            setAppAuth(new AppAuthJs({
                ...codeRequest,
                client_id: client?.client_id,
                scope: config?.scope || client?.scope,
                redirect_uri: config?.redirect_uri || client?.redirect_uris[0],


            }));
        }
        return () => {
        };
    }, [codeRequest]);
      
       const  onClientChange= ({request, issuer, client}:DCRClient) => {
            if (client) {
    
                // @ts-ignore
                setAppAuth(new AppAuthJs( issuer, request, notificationsService, showMessage));
            }
            return () => {
            };
        }


  /* 
    };*/
    const handle_oidc_dr = () => {
        appAuth?.checkForAuthorizationResponse();
        appAuth?.makeTokenRequest();
    };
    return (
        <Container component="main" >
            <Container maxWidth="xs">

                <CssBaseline/>
              

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    onClick={handle_oidc_dr}
                >
                  
                    Get Token
                    <Avatar className={classes.avatar} >
                        <LockOutlinedIcon/>
                    </Avatar>
                </Button> 

                {message && <span><ErrorOutlined/> {message}</span>}
            </Container>

        </Container>
    );
}

