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
import {ErrorOutlined} from "@mui/icons-material";
import {Services} from "../auth/OidcProvider";
import { useAppLogger} from "../logger/useApplicationLogger";
import {AnyInterpreter} from "xstate";

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



 const messageSelector = (state: any) => state.context.message;
const serviceSelector = (state: any) => state.context.service;
export type SignInProps = RouteComponentProps &  Services;

export default function SignIn({authProvider, authService, notificationsService}: SignInProps) {
    const classes = useStyles();
    useAppLogger(authProvider as AnyInterpreter, notificationsService.send);
 
    const message = useSelector(authService, messageSelector);
 
    const showMessage=(message: string) =>{
        // @ts-ignore
        notificationsService.send({type:'ADD', notification:{ group:"app-auth", title: message, payload:{}, icon:'login', severity:'info'}});
    } 
      
      


  /* 
    };*/
    const handle_oidc_dr = () => {
        // @ts-ignore
        authProvider &&  authProvider.send({type:"LOGIN"})
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
                  
                    Sign In OIDC Provider (dcr )
                    <Avatar className={classes.avatar} >
                        <LockOutlinedIcon/>
                    </Avatar>
                </Button> 

                {message && <span><ErrorOutlined/> {message}</span>}
            </Container>
 
        </Container>
    );
}

