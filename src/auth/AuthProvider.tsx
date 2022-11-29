import React, {useEffect, useState, createContext, useContext} from "react";
import {authMachine, AuthService, AuthMachineContext, AuthMachine} from "../machines/authMachine";
import {useInterpret} from "@xstate/react";
import {RouteComponentProps } from "@reach/router";
import { navigate } from "@reach/router"
import {OidcProvider} from "./OidcProvider";
import { InterpreterFrom } from "xstate";

export const AuthContext = createContext<InterpreterFrom<AuthMachine>>({} as InterpreterFrom<AuthMachine>);
export type AuthProviderProps = RouteComponentProps

 function OAuthProvider({ children}:React.PropsWithChildren) {

    const getMachine=():AuthMachine =>  authMachine.withContext({
        ...authMachine.context,
        config:{
            ...authMachine.config,
            navigate:navigate
        }
    });
    const authService= useInterpret(getMachine);
 
        return  <AuthContext.Provider value={authService}>
            {children}
        </AuthContext.Provider> 
}
export const AuthProvider =OAuthProvider;