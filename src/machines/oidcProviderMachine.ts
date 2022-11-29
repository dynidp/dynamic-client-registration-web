import {Machine, assign, InterpreterFrom, actions} from "xstate";
import {User, IdToken, AnyRecord} from "../models";

const {log} = actions;
export type AuthorizationRequest= AnyRecord;
export interface AuthMachineSchema {
    states: {
        // init:{};
        history: {};
        unauthorized: {};
        login: {};
        logout: {};
        refreshing: {};
        authorized: {}; 
        error: {};
        token: {};
        callback: {};
    };
}

export interface OAuthPayload {
    provider: string,

    [key: string]: any
}
export type OIDCPayload  = AuthorizationRequest
export type OIDC_RR_Payload  = {registration_endpoint:string}
export type OIDCEvent = OAuthPayload & { type: "OIDC" } & OIDCPayload ;
export type OIDC_DR_Event =  { type: "OIDC.DR" } & OIDC_RR_Payload;
export type AuthMachineEvents =
    | { type: "LOGIN" }
    | OIDC_DR_Event
    | OIDCEvent
    | { type: "LOGOUT" }
    | { type: "CALLBACK" }
    | { type: "REFRESH"  }
    | { type: "SIGNUP" }
    | { type: "TOKEN", token: Token };

export interface Token {
    access_token?: string;
    refresh_token?: string;
    id_token?: string;
}

export interface AuthMachineContext {
    user?: User;
    idToken?: IdToken;
    token?: Token;
    mfaToken?: any;
    message?: string;
    [key:string]:any;
}


export const oidcMachine = Machine<AuthMachineContext, AuthMachineSchema, AuthMachineEvents>(
    {
        id: 'auth',
        initial: "unauthorized",
        context: {
            user: undefined,
            idToken: undefined,
            token: undefined,
            message: undefined

        },
        
        


        states: {
            history: {
                type: 'history',
                history: 'shallow' // optional; default is 'shallow'
            },

        /*    init:{
                entry:['assignOidcClient', log('init')],
                
                invoke: {

                    src: 'login_service',
                    id: 'login_service',
                    data:{
                        authority:(ctx: { authority: any; }, event: { authority: any; })=> ctx.authority || event.authority
                    },

                    onDone: {target: "unauthorized", actions: "assignLoginClient"},
                    onError: {target: "unauthorized", actions: ["onError", "logEventData"]},

                },
            },*/
            unauthorized: {
                entry: ["resetUser", "onUnauthorizedEntry", log('unauthorized')],
                on: {
                    LOGIN: "login",
                    SIGNUP: "login"
                },
            }       ,
            login: {
                entry: ['onLoginEntry', 'assignOidcClient', log('login')],
                onDone: [{target: "token.exchange", actions: "setLoginResponse"}],
                on: {
                    CALLBACK: 'callback'
                },
                invoke: {
                    src: 'oidc_client',
                    id: 'oidc_client',

                    data: {
                        token: (context: AuthMachineContext, _event: any) => context.token
                    },
                    onDone: {target: "token", actions: "setLoginResponse"},
                    onError: {target: "unauthorized", actions: ["onError", "logEventData"]},

                },

            },
            callback:{
                
            },
            token: {

                onDone: {target: 'authorized'},

                states:{
                    exchange:{

                        invoke: {
                            src: "getToken",
                            onDone: [
                                { target: '#authorized', actions: "setToken"},
                                // {target: 'authorized', actions: "enrichToken", cond: context => context.token !== undefined}
                            ],
                            onError: {target: "error", actions: ["onError", "logEventData"]},
                        },


                    },
                    enrich: {
                        invoke: {
                            src: "enrichToken",
                            onDone: {target: '#authorized', actions: "setToken"},
                            onError: {target: "error", actions: ["onError", "logEventData"]},
                        }

                    },
                    error: {
                        entry: [log("authorized"), "onAuthorizedEntry"],
                        type: "final"

                    },
                    authorized: {
                        entry: [log("authorized"), "onAuthorizedEntry"],
                        type: "final"

                    }

                }
            },
 
            authorized: {
                id: "authorized",
                entry: [log("authorized"), "onAuthorizedEntry"],
                invoke: {
                    src: "getUserProfile",
                    onDone: {actions: "setUserProfile"},
                    onError: {actions: ["onError", "logEventData"]},
                },
                on: {
                    LOGOUT: "logout",
                    REFRESH: "refreshing"
                },


            },
            refreshing: {
                entry: log('refreshing'),

                invoke: [{
                    src: "getToken",
                    onDone: {target: "authorized", actions: "setToken"},
                    onError: {target: "unauthorized", actions: ["onError", "logEventData"]},
                }
                ]

            },
            logout: {
                entry: log('logout'),

                invoke: {
                    src: "performLogout",
                    onDone: {target: "unauthorized"},
                    onError: {target: "unauthorized", actions: "onError"},
                },
            },

            error: {
                entry: ["onError", "logEventData"],
            }

        },
    },
    {

        actions: {
            logEventData: {
                type: 'xstate.log',
                label: 'Finish label',
                expr: (context: any, event: any) => event.data
            },
            onAuthorizedEntry: async (ctx, event) => {


            },
            setToken: assign((ctx: any, event: any) => ({
                token: {
                    id_token: event.data.idToken,
                    access_token: event.data.access_token,
                    refresh_token: event.data.refresh_token,
                },
                idToken: event.data.idToken,
                mfaToken: event.data.mfaToken
            })),


            resetUser: assign((ctx: any, event: any) => ({
                user: undefined,
                idToken: undefined,
                token: undefined,
                mfaToken: undefined
            })),
            setLoginResponse: assign((ctx: any, event: any) => ({
                user: event.data?.user,
                token: event.data?.token,
            })),
            setUserProfile: assign((ctx: any, event: any) => ({
                user: event.data.user
            })),
            onSuccess: assign((ctx: any, event: any) => ({
                user: event.data.user,
                message: undefined,
            })),
            onError: assign((ctx: any, event: any) => ({
                message: event.data.message || event.data.toString(),
            })),
        },
    }
);

export type OidcMachine = typeof oidcMachine;

export type OidcService = InterpreterFrom<OidcMachine>;
