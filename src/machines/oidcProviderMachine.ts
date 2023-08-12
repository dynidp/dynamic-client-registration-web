import {Machine, assign, InterpreterFrom, actions} from "xstate";
import {User, IdToken} from "../models";

const {log} = actions;

export interface AuthMachineSchema {
    states: {
        loading: {};
        verifying: {};
        unauthorized: {};
        reauth: {};
        login: {};
        signup: {};
        logout: {};
        refreshing: {};
        authorized: {};
        error: {};
        token: {};
        history: {};

    };
}

export interface SocialPayload {
    provider: string,

    [key: string]: any
}

export type SocialEvent = SocialPayload & { type: "SOCIAL" };
export type AuthMachineEvents =
    | { type: "LOGIN" }
    | { type: "LOADED", [key: string]: any }
    | SocialEvent
    | { type: "LOGOUT" }
    | { type: "UPDATE" }
    | { type: "REFRESH" }
    | { type: "SIGNUP" }
    | { type: "REAUTH" }
    | { type: "SUBMIT", email: string, password: string }
    | { type: "TOKEN", token: Token };

export interface Token {
    access_token?: string;
    refresh_token?: string;
    id_token?: string;
}

export interface AuthMachineContext {
    service: any,
    user?: User;
    idToken?: IdToken;
    token?: Token;
    mfaToken?: any;
    message?: string;

    [key: string]: any;
}


export const createAuthMachine = <T extends AuthMachineContext = AuthMachineContext>(context: T, id:string= 'auth') => {
    const authMachine = Machine<AuthMachineContext & T, AuthMachineSchema, AuthMachineEvents>(
        {
            id: id,
            initial: "loading",
            context: {...context},
            states: {
                history: {
                    type: 'history',
                    history: 'deep' // optional; default is 'shallow'
                },
                loading: {
                    invoke: {
                        id: "loader",
                        src: 'loader',
                        onDone: [{
                            target: "verifying",
                            actions: ['onLoaded', 'setService'],
                        }]
                    },
                    on: {
                        LOADED: {
                            target: "verifying", actions: ['onLoaded', 'setService'],
                        }
                    }
                },
                verifying: {
                    invoke: {
                        id: "check-session",
                        src: "check",
                        onDone: {actions: ["setToken"]},
                        onError: {target: "unauthorized", actions: ["logEventData", "clearUserFromContext"]},

                    },
                    entry: ["startVerifying"],
                    exit: ["stopVerifying"]
                },


                unauthorized: {
                    entry: ["resetUser", "onUnauthorizedEntry", log('unauthorized')],
                    on: {
                        LOGIN: "login",
                        SIGNUP: "signup"
                    },
                    after: {
                        // after 1 second, transition to yellow
                        1000: {target: 'refreshing'}
                    }

                },
                reauth: {
                    entry: ['onLoginEntry', 'assignLoginService', log('login')],
                    onDone: [{target: "token.exchange", actions: "setLoginResponse"}],

                    invoke: {
                        src: 'login',
                        id: 'login',

                        data: {
                            token: (context: AuthMachineContext, _event: any) => context.token
                        },
                        onDone: {target: "token", actions: "setLoginResponse"},
                        onError: {target: "unauthorized", actions: ["onError", "logEventData"]},

                    }

                },
                login: {
                    entry: ['onLoginEntry', 'assignLoginService', log('login')],
                    onDone: [{target: "token.exchange", actions: "setLoginResponse"}],

                    invoke: {
                        src: 'login',
                        id: 'login',

                        data: {
                            token: (context: AuthMachineContext, _event: any) => context.token
                        },
                        onDone: {target: "token", actions: "setLoginResponse"},
                        onError: {target: "unauthorized", actions: ["onError", "logEventData"]},

                    },

                },
                signup: {
                    entry: ['onSignupEntry', 'assignSignupService', log('signup')],
                    onDone: [{target: "token.exchange", actions: "setLoginResponse"}],

                    invoke: {
                        src: 'signup',
                        id: 'signup',

                        data: {
                            token: (context: AuthMachineContext, _event: any) => context.token
                        },
                        onDone: {target: "token", actions: "setLoginResponse"},
                        onError: {target: "unauthorized", actions: ["onError", "logEventData"]},

                    }

                },
                token: {

                    onDone: {target: 'authorized'},

                    states: {
                        exchange: {

                            invoke: {
                                src: "getToken",
                                onDone: [
                                    {target: '#authorized', actions: "setToken"},
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
                            entry: [log("authorized"), "onError"],
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
                        REAUTH: "reauth",
                        REFRESH: "refreshing"
                    },


                },
                refreshing: {
                    entry: log('refreshing'),
                    // onDone: [{target: "authorized", actions: "setLoginResponse"}],

                    invoke: [{
                        id: 'token-service',
                        src: "getToken",
                        onDone: {actions: ["setToken"]},
                        onError: {target: "unauthorized", actions: ["logEventData"]},
                    }, {
                        id: 'profile-service',
                        src: "getUserProfile",
                        onDone: {target: "authorized", actions: "setUserProfile"},
                        onError: {actions: ["onError", "logEventData"]},
                    }]

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
                setService: assign((ctx: any, event: any) => ({
                    service: (ctx: any, event: any) => event.data || event
                })),
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

    return authMachine;
}


export type AuthMachine<T extends AuthMachineContext = AuthMachineContext> = ReturnType<typeof createAuthMachine<T>>;
export type OidcMachine = typeof createAuthMachine<any>;

export type OidcService = InterpreterFrom<OidcMachine>;
