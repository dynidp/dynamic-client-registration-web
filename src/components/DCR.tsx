import * as React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import {useInterpret, useSelector} from "@xstate/react";
import {AnyInterpreter, AnyState} from "xstate";
import JsonView from "./JsonTreeViewer";
import {alpha, AppBar, Button, InputBase, Paper, TextField, Toolbar} from "@mui/material";
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import {Client, createDrMachine, DrService, Issuer} from '../machines/oidc-client/oidc_dr_machine';
import {AuthorizationRequest, AuthorizationRequestJson} from "@openid/appauth/built/authorization_request";
import {AnyRecord} from "../models";
import {SetStateAction, useEffect, useState} from 'react';
import {AppAuthJs} from "../machines/AppAuth";
import {useAppLogger} from "../logger/useApplicationLogger";
import {NotificationsEvents} from "../machines/notificationsMachine";
import {useForm} from 'react-hook-form';
import { styled } from '@mui/styles';
import SearchIcon from '@mui/icons-material/Search';

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

export type DCRClient = { request: AuthorizationRequestJson, issuer: Issuer, client: Client };

export interface DCRProps {
    onChange: ({request, issuer, client}: DCRClient) => void;
    notify: (notification: NotificationsEvents) => {}
}

const clientSelector = (state: any) => state.context.client;
const issuerSelector = (state: any) => state.context.issuer;


const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
            '&:focus': {
                width: '20ch',
            },
        },
    },
}));


export function DCR({onChange, notify}: DCRProps) {
    const classes = useStyles();
    const redirect_uri = `${window.location.origin}/callback/gigya-login.html`
    const scope = "openid gigya_web";
    const defaults = {
        authority: 'https://fidm.eu1.gigya.com/oidc/op/v1.0/4_IIUXxExoyzTQFvliBbnXsA',
        config: {
            client_name: "default-static-js-client-spa",
            redirect_uris: [redirect_uri],
            token_endpoint_auth_method: 'none',
            "grant_types": ["authorization_code"],
            "response_types": ["code token idToken"],
            "scope": scope,

        }
    };
    const drService = useInterpret(() => createDrMachine({...defaults, config: {...defaults.config}}));
    useAppLogger(drService as AnyInterpreter | undefined, notify);

    const client = useSelector(drService, clientSelector);
    const issuer = useSelector(drService, issuerSelector);

    const [authRequest, setAuthRequest] = useState<AuthorizationRequestJson>({
        client_id: client?.client_id,
        scope,
        redirect_uri,
        response_type: 'code',
        state: 'dcr_web_client',
        extras: {'prompt': 'none', 'access_type': 'offline'} 

    });

    const [value, setValue] = React.useState('1');

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    useEffect(() => {
        if (client) {

            // @ts-ignore
            setAuthRequest({ 
                ...authRequest,
                client_id: client?.client_id,

            });
        }
        return () => {
        };
    }, [client]);

    useEffect(() => {
        if (authRequest) {
            onChange({request: authRequest, issuer, client});
        }
        return () => {
        };
    }, [authRequest]);

    const handle_oidc_dr_register = (data: any) => {
        drService.send({
            type: 'REGISTER',
            authority: "https://fidm.eu1.gigya.com/oidc/op/v1.0/4_IIUXxExoyzTQFvliBbnXsA",
            ...data
        });
    }
    const {register, handleSubmit, formState: {errors}} = useForm({
        defaultValues: {
            authority: client?.authority, ...client
        }
    });

    return (
        <div>


            <TabContext value={value}>

                <Paper>

                        <TabList onChange={handleChange} aria-label="Dynamic Registration Details">

                        <Tab label="OP Details" value="1"/>
                        <Tab label="Registered Client" value="2"/>
                        <Tab label="Authorization Request" value="3"/>
                            <Search>
                                <SearchIconWrapper>
                                    <SearchIcon />
                                </SearchIconWrapper>
                                <StyledInputBase
                                    placeholder="Search…"
                                    inputProps={{ 'aria-label': 'search' }}
                                />
                            </Search>


                                <form
                            className={classes.form}
                            noValidate
                            onSubmit={handleSubmit(handle_oidc_dr_register)}
                        >
                            <div className="navbar-brand">

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
                                    OK
                                </Button>
                            </div>


                        </form>
                    </TabList>
                     
                </Paper>
                <TabPanel value="1">
                    {issuer && <JsonView data={issuer}/>}
                </TabPanel>
                <TabPanel value="2">
                    {client && <JsonView data={client}/>}
                </TabPanel>
                <TabPanel value="3">
                    {client && <JsonView data={authRequest}/>}</TabPanel>
            </TabContext>
            <div className={classes.paper}>


            </div>

        </div>
    );
}


function decodeJwt(token?: string) {

    return token && token.split && JSON.parse(atob(token.split('.')[1]));

}

export default DCR;


