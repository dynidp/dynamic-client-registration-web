import React, { useState } from "react";
import makeStyles from '@mui/styles/makeStyles';
import { useSelector} from "@xstate/react";
import {AnyState} from "xstate";
import JsonView from "./JsonTreeViewer";
import {Paper, Typography} from "@mui/material";
import {Services} from "../auth/OidcProvider";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
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

 


const jwtSelector=(state:AnyState)=>state?.context;
function SessionInfo({authService}: Pick<Services, "authService">) {
  const classes = useStyles();
  const {idToken, mfaToken} = useSelector(authService, jwtSelector) ||{};
  
   

  return (
      <Paper className={classes.paper} >
      <Paper className={classes.paper} >
        <Typography component="h2" variant="h6" color="primary" gutterBottom>
          MFA Token
        </Typography>
        {mfaToken &&  <JsonView data={mfaToken} />}  
      </Paper>
        
        <Paper className={classes.paper} >
        <Typography component="h2" variant="h6" color="primary" gutterBottom>
          Id Token
        </Typography>
        {idToken && idToken.details && <JsonView data={idToken.details} />}  
      </Paper>
      </Paper>
  );
}
function decodeJwt(token?:string) {

  return token && token.split && JSON.parse(atob(token.split('.')[1]));

}

export default SessionInfo;
