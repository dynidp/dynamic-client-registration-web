import React, {useEffect, useRef} from "react";
import {RouteComponentProps} from "@reach/router"

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import makeStyles from '@mui/styles/makeStyles';
import Container from "@mui/material/Container";
import {useForm} from "react-hook-form";
import {useSelector} from "@xstate/react";
import {AuthService} from "../machines/authMachine";
import {ErrorOutlined, AccountTreeOutlined} from "@mui/icons-material";
import {Google, WindowTwoTone} from "@mui/icons-material";

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
}

const messageSelector = (state: any) => state.context;
export default function Organization({authService}: SignInProps) {
    const classes = useStyles();
    const {message, container} = useSelector(authService, messageSelector);
    const containerRef = useRef<HTMLDivElement>(null);

    


    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline/>
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <AccountTreeOutlined/>
                </Avatar>
                <Button onClick={() => authService.send("ORGANIZATION.REGISTER")}> 
                    <Typography component="h1" variant="h5">
                        Register Organization
                    </Typography>
                </Button>


                <div id={container} ref={containerRef}/>

            </div>


            {message && <span><ErrorOutlined/> {message}</span>}

        </Container>
    );
}
