// import logo from "./logo.svg";
import React, {useEffect, useContext} from "react";
import "../App.css";
import "../styles/globals.css";
import SignIn from "../components/SignIn";
import {Router} from "@reach/router";
import {useMachine} from "@xstate/react";
import {AnyState} from "xstate";
import {Box, Container, responsiveFontSizes, Stack} from "@mui/material";
import {SnackbarContext, snackbarMachine} from "../machines/snackbarMachine";
import AlertBar from "../components/AlertBar";
import {notificationMachine} from "../machines/notificationsMachine";
import NotificationsContainer from "../containers/NotificationsContainer";
import ProfileContainer from "../containers/ProfileContainer";
import {PrivateRoute} from "../routes";

import {ThemeProvider, Theme, StyledEngineProvider, createTheme} from '@mui/material/styles';

import {Auth, AuthContext, AuthProvider} from "../auth";
import { green, purple } from '@mui/material/colors';
import {ProviderSelector} from "../components/Providers";
import makeStyles from "@mui/styles/makeStyles";
import Callback from "../components/Callback";


declare module '@mui/styles/defaultTheme' {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DefaultTheme extends Theme {
    }
}


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
    }
}));
const theme = createTheme({
    palette: {
        // secondary: {
        //     main: '#999'
        // },
        primary: {
            main: '#7a7a7a'
        }

    },

    typography: {
        h5: {
            font: 'Questrial',
            fontStyle: 'lighter',
            fontWeight: 'lighter',
            fontSize: '14px',
            fontFamily: "'Questrial', sans-serif !important"
        },
        button:{
            font: 'Questrial',
            fontStyle: 'lighter',
            fontWeight: 'lighter',
            fontFamily: "'Questrial', sans-serif !important",
            fontSize: '14px',
            opacity: 0.8
        },
        fontFamily: [
            'Questrial',
            'sans-serif',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',

            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
    },
});


const App = () => {
    const responsiveTheme = responsiveFontSizes(theme);
 
    // @ts-ignore
    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={responsiveTheme}>
                <AuthProvider>
                        <AppWithService/>
                </AuthProvider>
            </ThemeProvider>
        </StyledEngineProvider>
    );
};
const AppWithService = () => {
    const services = useContext(AuthContext);
    const classes = useStyles();
    const {current, authProvider}= services;
    return (<div>

            <Box>
                <Stack
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="stretch"
                    spacing={0.5}
                >
                    <Container  >

                    <Router>
                       {/* <PrivateRoute default as={ProfileContainer} path={"/"}
                                      {...services}
                        />*/}
                        {current && <Callback path={"/callback"} current={current}  {...services} />}
                        {authProvider && <SignIn default path={"/signin"}  authProvider={authProvider} {...services} />}
                        <ProfileContainer path="/profile"  {...services}/>

                    </Router>

                        <div className={classes.paperRow}>
                      
                            <ProviderSelector  notify={services.notificationsService.send}   />
                      
                        </div>
                    </Container>

                    <Container  maxWidth="sm">
                        <NotificationsContainer  {...services}/>
                    </Container>
                </Stack>

            </Box>

            <AlertBar snackbarService={services.snackbar}/>

        </div>)
    } 


export default App;
