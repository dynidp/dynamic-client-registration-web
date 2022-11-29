import * as React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import {useSelector} from "@xstate/react";
import {AnyState} from "xstate";
import JsonView from "./JsonTreeViewer";
import {Paper, Typography} from "@mui/material";
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { DrService } from '../machines/oidc-client/oidc_dr_machine';

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


export interface SessionProps {
    drService: DrService;

}

const clientSelector = (state: any) => state.context.client;
const issuerSelector = (state: any) => state.context.issuer;


const jwtSelector = (state: AnyState) => state?.context;


export function DCR({drService}: SessionProps) {
    const classes = useStyles();
    const client = useSelector(drService, clientSelector);
    const issuer = useSelector(drService, issuerSelector);
    const [value, setValue] = React.useState('1');

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    return (
        <Paper >
            <TabContext value={value}>
                <Paper >
                    <TabList onChange={handleChange} aria-label="Dynamic Registration Details">

                        <Tab label="OP Details" value="1"/>
                        <Tab label="Registered Client" value="2"/>
                        <Tab label="Authorization Request" value="3"/>
                    </TabList>
                </Paper>
                <TabPanel value="1">                {issuer && <JsonView data={issuer}/>}
                </TabPanel>
                <TabPanel value="2">                {client && <JsonView data={client}/>}
                </TabPanel>
                <TabPanel value="3">                {client && <JsonView data={{
                    client_id: client.client_id,
                    redirect_uri: client.redirect_uri,
                    scope: client.scope,
                    response_type: client.response_type,
                    state: 'web dcr client',
                    extras: {'prompt': 'none', 'access_type': 'offline'}
                }}/>}</TabPanel>
            </TabContext>
        </Paper>
    );
}


function decodeJwt(token?: string) {

    return token && token.split && JSON.parse(atob(token.split('.')[1]));

}

export default DCR;