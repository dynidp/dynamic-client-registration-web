import {
    InterpreterFrom,
    actions,
    ContextFrom,
    EventFrom,
    send,
    AnyActorRef,
    Machine,
    assign
} from "xstate";
import { choose } from "xstate/lib/actions";
import {User, IdToken} from "../models";
import {OidcService} from "./oidcProviderMachine";

const {log} = actions;


export interface Token {
    access_token?: string;
    refresh_token?: string;
    id_token?: string;
    expires_in: number
}

export interface AuthMachineContext {
    user?: User;
    idToken?: IdToken;
    token?: Token;
    mfaToken?: any;
    message?: string;
}


export type AuthState = {
    user?: User;
    authResult?: AuthResult;
    expiresAt?: Date | null;
    isAuthenticating: boolean;
    errorType?: string;
    error?: Error ;
    config: {
        navigate: Function;
        authProvider?: any ;
        callbackDomain?: string;
        [key:string]:any;
    };
};

export type AuthResult = ({ expiresIn: number } & Token) | null;


export const authMachine = Machine<AuthState>(
    {
        id: 'auth',
        initial: "unauthenticated",
        context: {
            user: undefined,
            expiresAt: null,
            authResult: null,
            isAuthenticating: false,
            error: undefined,
            errorType: undefined,
            config: {
                navigate: () =>
                    console.error(
                        "Please specify a navigation method that works with your router"
                    ),
                // TODO: detect default
                callbackDomain: "http://localhost:8000"
            }
        },
        states: {
            unauthenticated: {
                on: {
                    LOGIN: "authenticating",
                    CHECK_SESSION: "verifying",
                    SET_CONFIG: {
                        actions: ["setConfig"]
                    }
                }
            },
            authenticating: {
                on: {
                    ERROR: "error",
                    AUTHENTICATED: "authenticated",
                    SET_CONFIG: {
                        actions: ["setConfig"]
                    }
                },
                entry: ["startAuthenticating"],
                exit: ["stopAuthenticating"]
            },
            verifying: {
                invoke: {
                    id: "checkSession",
                    src: (context, event) =>
                        context.config.authProvider!.checkSession(),
                    onDone: {
                        target: "authenticated"
                    },
                    onError: {
                        target: "unauthenticated",
                        actions: ["clearUserFromContext", "clearLocalStorage"]
                    }
                },
                entry: ["startAuthenticating"],
                exit: ["stopAuthenticating"]
            },
            authenticated: {
                on: {
                    LOGOUT: "unauthenticated",
                    SET_CONFIG: {
                        actions: ["setConfig"]
                    },
                    CHECK_SESSION: "verifying"
                },
                entry: ["saveUserToContext", "saveToLocalStorage"],
                exit: choose([
                    {
                        cond: (context, event) =>
                            event.type !== "CHECK_SESSION",
                        actions: ["clearUserFromContext", "clearLocalStorage"]
                    }
                ])
            },
            error: {
                entry: [
                    "saveErrorToContext",
                    "clearUserFromContext",
                    "clearLocalStorage"
                ]
            }
        }
    },
    {
        actions: {
            startAuthenticating: assign(context => {
                return {
                    isAuthenticating: true
                };
            }),
            stopAuthenticating: assign(context => {
                return {
                    isAuthenticating: false
                };
            }),
            saveUserToContext: assign((context, event) => {
                const { authResult, user } = event.data ? event.data : event;
                const expiresAt = addSeconds(new Date(), authResult.expiresIn);

                return {
                    user,
                    authResult,
                    expiresAt
                };
            }),
            clearUserFromContext: assign(context => {
                return {
                    user: undefined,
                    expiresAt: undefined,
                    authResult: undefined
                };
            }),
            saveToLocalStorage: (context, event) => {
                const { expiresAt, user } = context;

                if (typeof localStorage !== "undefined") {
                    localStorage.setItem(
                        "useAuth:expires_at",
                        expiresAt ? expiresAt.toISOString() : "0"
                    );
                    localStorage.setItem("useAuth:user", JSON.stringify(user));
                }
            },
            clearLocalStorage: () => {
                if (typeof localStorage !== "undefined") {
                    localStorage.removeItem("useAuth:expires_at");
                    localStorage.removeItem("useAuth:user");
                }
            },
            saveErrorToContext: assign((context, event) => {
                return {
                    errorType: event.errorType,
                    error: event.error
                };
            }),
            setConfig: assign((context, event) => {
                return {
                    config: {
                        ...context.config,
                        ...event
                    }
                };
            })
        }
    }
);

export type AuthMachine = typeof authMachine;

// export type AuthService = InterpreterFrom<AuthMachine>;
export type AuthService = OidcService;
function addSeconds(date: Date, seconds: number):Date {
    return   addMilliseconds(date, seconds*1000);
}

const addMilliseconds = (date: Date, milliseconds: number) => {
    const result = new Date(date);
    result.setMilliseconds(result.getMilliseconds() + milliseconds);
    return result;
};

// export type AuthMachineContext =typeof authModel.initialContext;
export type AuthMachineEvents = EventFrom<AuthMachine>;

