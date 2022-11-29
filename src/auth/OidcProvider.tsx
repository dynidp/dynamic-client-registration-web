import React, {useEffect, useState, createContext, useContext} from "react";
import {authMachine, AuthService, AuthMachineContext, AuthMachine} from "../machines/authMachine";
import {useInterpret} from "@xstate/react";
import {RouteComponentProps } from "@reach/router";
import { navigate } from "@reach/router"
import {withDynamicOidcClient} from "../machines/oidc-client/withOidcClient";
import {oidcMachine, OidcMachine, OidcService} from "../machines/oidcProviderMachine";

export const OidcContext = createContext<OidcService>({} as OidcService);
export type  OidcProviderProps = React.PropsWithChildren

export function OidcProvider({ children, ...props}:OidcProviderProps) {

    const getMachine=():OidcMachine =>  withDynamicOidcClient( oidcMachine.withContext({
        ...oidcMachine.context,
        ...props
    }));
    const authService= useInterpret(getMachine);
 
        return  <OidcContext.Provider value={authService}>
            {children}
        </OidcContext.Provider> 
}
