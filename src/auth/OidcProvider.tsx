import React, {useEffect, useState, createContext, useContext} from "react";
import {ProviderService, providersMachineWithDefaults} from "../machines/oidc-client/providers_machine";
import {hydrateMachine, useHydrate} from "../boot/hydrate";
import {useMachine} from "@xstate/react";
import {snackbarMachine, SnackbarService} from "../machines/snackbarMachine";
import {notificationMachine, NotificationsService} from "../machines/notificationsMachine";
import {OidcService, createAuthMachine} from "../machines/oidcProviderMachine";
import {omit} from "lodash";
import {StateFrom} from "xstate";
 import {createDrMachine} from "../machines/oidc-client/oidc_dr_machine";

export const OidcContext = createContext<Services>({} as Services);
export type  OidcProviderProps = React.PropsWithChildren

export function OidcProvider({children, ...props}: OidcProviderProps) {

    // const getMachine=():OidcMachine =>  withDynamicOidcClient( oidcMachine.withContext({
    //     ...oidcMachine.context,
    //     ...props
    // }));
    const [, , snackbarService] = useMachine(snackbarMachine);
    const [, , notificationsService] = useMachine(notificationMachine);
    const [, , authService] = useMachine(() => createAuthMachine<any>({}));

    const {service} = useHydrate(providersMachineWithDefaults, (state: any) => {
        return {
            ...state,
            
            context: {
                ...state.context,
                current: state.context.current && !state.context.current.send && hydrateMachine(createDrMachine(state.context.provider))
            }

        }
    });
    // const service = useInterpret();


    return <OidcContext.Provider
        value={{providers: service, snackbar: snackbarService, notificationsService, authService}}>
        {children}
    </OidcContext.Provider>
}


export type Services =
    {
        notificationsService: NotificationsService,
        snackbar: SnackbarService,
        providers: ProviderService,
        authService: OidcService
    }