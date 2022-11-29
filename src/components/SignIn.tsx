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
import DCR from "./DCR";

const defaults = {
    authority: 'https://fidm.eu1.gigya.com/oidc/op/v1.0/4_IIUXxExoyzTQFvliBbnXsA',
    config: {
        client_name: "default-static-js-client-spa",
        redirect_uris: ['https://dina.fbi.com:5173/callback/gigya-login.html'],
        token_endpoint_auth_method: 'none',
        "grant_types": ["authorization_code"],
        "response_types": null,
        "scope": "gigya:web:jssdk",

    }
};
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

const contextSelector = (state: any) => state.context;
const loginServiceSelector = (state: any) => state.context.login_service;
const oidcClientSelector = (state: any) => state.context.oidc_client;
const messageSelector = (state: any) => state.context.message;
const clientSelector = (state: any) => state.context.client;
const issuerSelector = (state: any) => state.context.issuer;
const authoritySelector = (state: any) => state?.context?.authority;

export default function SignIn({authService, notificationsService}: SignInProps) {
    const classes = useStyles();
    const [appAuth, setAppAuth] = useState<AppAuthJs>();
    const drMachine = useInterpret(() => createDrMachine({...defaults, config: {...defaults.config}}));
    const client = useSelector(drMachine, clientSelector);
    const issuer = useSelector(drMachine, issuerSelector);
    // const {client, issuer} = useSelector(drMachine, contextSelector);


    const message = useSelector(authService, messageSelector);
    // const authority = useSelector(oidcClient, authoritySelector);
    // const client = useSelector(oidcClient, clientSelector);
    // const authority = useSelector(oidcClient, authoritySelector);
    // useAppLogger(loginService as AnyInterpreter | undefined, notificationsService.send);
    // useAppLogger(oidcClient as AnyInterpreter | undefined, notificationsService.send);
    useAppLogger(drMachine as AnyInterpreter | undefined, notificationsService.send);

    useEffect(() => {
        if (client) {

            // @ts-ignore
            setAppAuth(new AppAuthJs(document.querySelector('#snackbar'), issuer, client));
        }
        return () => {
        };
    }, [client]);

    const {register, handleSubmit, formState: {errors}} = useForm({
        defaultValues: {
            authority: client?.authority, ...client
        }
    });


    const handle_oidc_dr_register = (data: any) => {
        drMachine.send({
            type: 'REGISTER', ...data,
            authority: "https://fidm.eu1.gigya.com/oidc/op/v1.0/4_IIUXxExoyzTQFvliBbnXsA"
        });
    };
    const handle_oidc_dr = () => {
        authService.send({type: 'LOGIN'});
        drMachine.send({type: 'LOGIN'});
        appAuth?.makeAuthorizationRequest({
            ...client,
            redirect_uri: 'https://dina.fbi.com:5173/callback/gigya-login.html'
        });
    };
    return (
        <Container component="main" >

            <Container maxWidth="xs">

                <CssBaseline/>
                <Avatar className={classes.avatar}>
                    <LockOutlinedIcon/>
                </Avatar>
                <div className={classes.paper}>

                    <form
                        className={classes.form}
                        noValidate
                        onSubmit={handleSubmit(handle_oidc_dr_register)}
                    >
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="issuer"
                            label="Issuer"
                            autoComplete="issuer"
                            autoFocus
                            {...register("authority", {required: true})}
                        />
                        {errors && errors.authority && <span>Please enter a valid issuer</span>}

                        {/*
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="registrationEndpoint"
                            label="Registration Endpoint"
                            autoComplete="registrationEndpoint"
                            autoFocus
                            {...register("issuer", {required: true})}
                        />
                        {errors && errors.registrationEndpoint && <span>Please enter a valid registration endpoint</span>}
                        */}

                        <Button
                            type="submit"
                            fullWidth

                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >
                            Change Issuer
                        </Button>


                    </form>


                </div>

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

                <DCR drService={drMachine}/>

            </div>
        </Container>
    );
}

