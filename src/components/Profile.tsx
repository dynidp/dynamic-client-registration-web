import React, { useState } from "react";
import Avatar from "@mui/material/Avatar";
import makeStyles from '@mui/styles/makeStyles';
import { AuthService } from "../machines/authMachine";
import { useActor, useSelector } from "@xstate/react";
import { AnyState } from "xstate";
import { Box, Paper, Typography } from "@mui/material";
import {Services} from "../auth/OidcProvider";

const useStyles = makeStyles((theme) => ({
    paper: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
        width: theme.spacing(12),
        height: theme.spacing(12),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    form: {
        // width: "100%", // Fix IE 11 issue.
        marginTop: theme.spacing(1),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
}));


 
const profileSelector = (state: AnyState) => state?.context?.user;

function Profile({ authService }: Pick<Services, "authService">) {
    const classNamees = useStyles();
    const { email, loginProvider, nickname, photo, organization } = useSelector(authService, profileSelector) || {};


    return (
        <Paper className={classNamees.paper} >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Profile Details
            </Typography>
            <Avatar src={photo} className={classNamees.avatar}></Avatar>
            <div
                className={classNamees.form}


            >
                <p>
                    Welcome back, <span style={{ fontWeight: "bold" }}> {nickname}</span>.
                </p>
                <p>
                    You logged in using the email address:
                    <span style={{ fontWeight: "bold" }}> {email}</span>.
                </p>
                {/* Switch statement here based on loginProvider */}
                {organization && <p>
                    to Organiztion
                    <span style={{ fontWeight: "bold" }}> {organization?.orgName}</span>.
                </p>}

            </div>


        </Paper>
    );
}

export default Profile;
