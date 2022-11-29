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
import {useForm} from "react-hook-form";
import {useInterpret, useSelector} from "@xstate/react";
import {AuthService} from "../machines/authMachine";
import {ErrorOutlined} from "@mui/icons-material";
import {Google, WindowTwoTone} from "@mui/icons-material";
import {NotificationsService} from "../machines/notificationsMachine";
import {useAppLogger} from "../logger/useApplicationLogger";
import {AnyInterpreter} from "xstate";
import {createDrMachine} from "../machines/oidc-client/oidc_dr_machine";
import {useInterpretWithLocalStorage} from "../machines/withLocalStorage";
import {AppAuthCallback} from "../machines/clientMachineAppAuth";
import JsonView from "./JsonTreeViewer";
import {AuthorizationRequest} from "@openid/appauth/built/authorization_request";
import {RedirectRequestHandler} from "@openid/appauth/built/redirect_based_handler";
import {AppAuthJs} from "../machines/AppAuth";
import DCR, {DCRClient} from "./DCR";
 
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
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: "100%", // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(2, 0, 2),
    },
}));

export interface SignInProps extends RouteComponentProps {
    authService: AuthService;
    notificationsService: NotificationsService
}

 const messageSelector = (state: any) => state.context.message;
 
export default function SignIn({authService, notificationsService}: SignInProps) {
    const classes = useStyles();
    const [appAuth, setAppAuth] = useState<AppAuthJs>();
 
     const message = useSelector(authService, messageSelector);
 
    const showMessage=(message: string) =>{
        // @ts-ignore
        notificationsService.send({type:'ADD', notification:{ group:"app-auth", title: message, payload:{}, icon:'login', severity:'info'}});
    } 
      
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
        appAuth?.makeAuthorizationRequest();
    };
    return (
        <Container component="main" >

            <Container maxWidth="xs">

                <CssBaseline/>
                <Avatar className={classes.avatar}>
                    <LockOutlinedIcon/>
                </Avatar>

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    onClick={handle_oidc_dr}
                >
                    Sign In OIDC Provider (dcr )
                </Button> 

                {message && <span><ErrorOutlined/> {message}</span>}
            </Container>

            <div className={classes.paperRow}>

                <DCR  notify={notificationsService.send}  onChange={onClientChange} />

            </div>
        </Container>
    );
}

