import {User} from "../models";
import {actions, assign, InterpreterFrom, Machine} from "xstate";
import {Token} from "./authMachine";
// import {SocialEvent, Token} from "./authMachine";
const {log} = actions;

export interface LoginMachineSchema {
    states: {
        signup: {};
        password: {};
        social: {};
        // token: {};
        authorized: {};
        error: {};
    };
}

 
export interface LoginMachineContext {
    user?: User;
    message?: string;
    token?: Token;

}
 

export interface TokenMachineSchema {
    states: {
        not_authenticated: {};
        authenticated: {};
        getToken: {};
        enrichToken: {};
        revokeToken: {};
    };
}

export type TokenMachineEvents =
    | { type: "AUTHRESPONSE" }
    | { type: "REFRESH" }
    | { type: "REVOKE" };

export const tokenMachine= Machine<Token, TokenMachineSchema, TokenMachineEvents>({
    id: 'token',
    initial: "not_authenticated",
    states:{
        not_authenticated:{
            on:{
                "AUTHRESPONSE": '.enrichToken'
            }
        },

        authenticated:{
            on:{
                "AUTHRESPONSE": '.getToken'
            }
        },

        getToken:{
            invoke: {
                src: "getToken",
                onDone: [
                    { actions: "setToken"},
                    // {target: 'authorized', actions: "enrichToken", cond: context => context.token !== undefined}
                ],
                onError: {target: "error", actions: ["onError", "logEventData"]},
            },


        },
        enrichToken: {
            invoke: {
                src: "enrichToken",
                onDone: {target:'authenticated', actions: ["setToken", "sendTokenResponse"]},
                onError: {target: "error", actions: ["onError", "logEventData"]},
            }

        },
        revokeToken: {
            invoke: {
                src: "revokeToken",
                onDone: {target:'not_authenticated', actions: ["setToken", "sendTokenResponse"]},
                onError: {target: "error", actions: ["onError", "logEventData"]},
            }

        },


    }

})

// export type LoginMachine = typeof loginMachine;
// export type LoginService = InterpreterFrom<LoginMachine>;