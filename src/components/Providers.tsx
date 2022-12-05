import React, {useEffect, useState} from 'react';
import {useMachine, useSelector} from '@xstate/react';
import {
    OP,
    ProviderService,
    providersMachine,
    providersMachineWithDefaults
} from '../machines/oidc-client/providers_machine';
import {
    alpha,
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    InputBase,
    Collapse,
    ListSubheader,
    ListItemButton,
    ListItemIcon,
    Icon,
    Button,
    Paper,
    Container
} from '@mui/material';
import {DCRProps, Provider} from "./DCR";
import {useAppLogger} from "../logger/useApplicationLogger";
import {AnyInterpreter, send} from 'xstate';
import {styled} from '@mui/styles';

import WebIcon from '@mui/icons-material/Web';
import {useForm} from 'react-hook-form';
import {AnyRecord} from "../models";
 import {OidcContext} from "../auth/OidcProvider";


const Search = styled('div')(({theme}) => ({
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

const IconWrapper = styled('div')(({theme}) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(TextField)(({theme}) => ({
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

const providerSelector = (state: any) => state.context.provider;
const currentSelector = (state: any) => state.context.current;
const providerNameSelector = (state: any) => state.context.provider?.name;
const providersSelector = (state: any) => state.context.providers;

export const ProviderSelector = (props: DCRProps) => {
    
    const {providers} = React.useContext(OidcContext);
    const service = providers;
     const provider = useSelector(service, providerSelector);
     const current = useSelector(service, currentSelector);
    const providerName = useSelector(service, providerNameSelector);
    const allProviders = useSelector(service, providersSelector);
    const {send, state} = service;
    useAppLogger(service as AnyInterpreter | undefined, props.notify);
     
    useEffect(() => {

    })
  
    return (
        <Container
            data-machine={service.machine.id}
            data-state={state?.toStrings().join(" ")}>

            <Selector service={service} />

            <Paper>
                <h1>{!provider && 'Please select a provider'}</h1>

                <AddProvider service={service}/>
                {current &&
                    <Provider {...props} drService={current} key={current.id}/>
                }

            </Paper>
        </Container>
    );
}


export const Selector = ({service}: { service: ProviderService }) => {

    const provider = useSelector(service, providerSelector);
     const allProviders = useSelector(service, providersSelector);


    const addIssuer = (data: AnyRecord) => {
        service.send({
            type: 'SELECT',
            ...data
        });
    }
 


    const onChange = (e: any) => {
        addIssuer({name:e.target.value});
        e.preventDefault();

    }
 
     
    
    return    <Box sx={{minWidth: 120}} >
         <InputLabel  id="demo-simple-select-label">Provider</InputLabel>

            <Select
                 fullWidth
                labelId="demo-simple-select-label"
                id="demo-simple-select" 
                 label="Provider"
                 onChange={onChange}
            >
                {Object.keys(allProviders).map((provider_key) => {
                    return <MenuItem key={provider_key} value={provider_key}>{provider_key}</MenuItem>;
                })}
            </Select>
     </Box>
}

const defaultsSelector = (state: any) => state.context.default_config;

const providerAuthoritySelector = (state: any) => state.context.provider?.authority;

export const AddProvider = ({service}: { service: ProviderService }) => {


    const provider = useSelector(service, providerSelector);
    const providerName = useSelector(service, providerNameSelector);
    const providerAuthority = useSelector(service, providerAuthoritySelector, );

    const [open, setOpen] = React.useState(false);
    const default_config = useSelector(service, defaultsSelector);

    const handleClick = () => {
        setOpen(!open);
    };

    const addIssuer = (data: AnyRecord) => {
        service.send({
            type: 'SELECT',
            ...data
        });
    }


    const {register, setValue, watch, handleSubmit, formState: {errors}} = useForm({
        defaultValues: {
            config: default_config,
            authority: providerAuthority as string | undefined,
            name: undefined as string | undefined,
            info: undefined as string | undefined,

        }
    });
    const watchAuthority = watch("authority"); // you can supply default value as second argument
    const watchName = watch("name"); // you can supply default value as second argument

    React.useEffect(() => {
        if (watchAuthority && isValidUrl(watchAuthority)) {
            setOpen(true)
            if (!watchName)
                setValue('name', new URL(watchAuthority).hostname, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true
                });

        }
    }, [watchAuthority]); 
    
    
    
    React.useEffect(() => {
        if (open && provider?.machine && watchName == providerName) {
            setOpen(false) 
        }
    }, [providerName, open]);

    return (
        <div>

            <form onSubmit={handleSubmit(addIssuer)}>
                <div className="navbar-brand">

                    <TextField
                        inputProps={{'aria-label': 'authority'}}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="authority"
                        label="Authority"
                        autoComplete="issuer"
                        autoFocus
                        placeholder="add issuer…"
                        helperText={"Insert a valid URL"}
                        {...register("authority", {required: true, validate: isValidUrl})}
                    />

                    {errors && errors.authority && <span> {errors.authority.message}</span>}

                    <Button type="submit">
                        <IconWrapper>
                            <Icon baseClassName="material-icons material-icons-outlined">add</Icon>
                        </IconWrapper>
                    </Button>
                    <ListItemButton component={ListItemButton} onClick={handleClick}>

                        <ListItemIcon>
                            <Icon
                                baseClassName="material-icons material-icons-outlined">{open ? 'expand_less' : 'expand_more'}</Icon>
                        </ListItemIcon>

                    </ListItemButton>


                </div>
                <Collapse in={open} timeout="auto" unmountOnExit>

                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Name"
                        autoComplete="provider_name"

                        placeholder="add name…"

                        {...register("name", {required: true})}
                    />
                    <TextField
                        inputProps={{'aria-label': 'info'}}
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        id="info"
                        label="Info"
                        autoComplete="info"

                        {...register("info", {required: false, value: "dcr provider"})}
                    />
                    <TextField
                        inputProps={{'aria-label': 'info'}}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="redirect_uris"
                        label="Redirect Uris"
                        autoComplete="redirect_uris"


                        {...register("config.redirect_uris", {required: true})}
                    />

                    <TextField
                        inputProps={{'aria-label': 'scope'}}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="scope"
                        label="scope"
                        autoComplete="scope"


                        {...register("config.scope", {required: true})}
                    />


                    {/* <Button
                    type="submit"
                    color="primary">
                    <ListSubheader>
                        <Icon baseClassName="material-icons material-icons-outlined">identity</Icon>


                        <ListItemIcon>Submit</ListItemIcon>
                    </ListSubheader>
                </Button>*/}
                </Collapse>

            </form>

            <Collapse in={open} timeout="auto" unmountOnExit>
                <form onSubmit={handleSubmit(addIssuer)}>

                </form>

            </Collapse>
        </div>
    )
}

const isValidUrl = (urlString: any) => {
    try {
        return urlString && new URL(urlString);
    } catch (e) {
        return false;
    }
    return true;
};
