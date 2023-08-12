import React, {useEffect, useState, createContext, useContext} from "react";
import {DrActor, ProviderService, providersMachineWithDefaults} from "../machines/oidc-client/providers_machine";
import {hydrateMachine, useHydrate} from "../boot/hydrate";
import {useMachine, useSelector} from "@xstate/react";
import {snackbarMachine, SnackbarService} from "../machines/snackbarMachine";
import {notificationMachine, NotificationsService} from "../machines/notificationsMachine";
import {OidcService, createAuthMachine, AuthMachine, AuthMachineContext} from "../machines/oidcProviderMachine";
import {omit} from "lodash";
import {ActorRef, assign, Interpreter, StateFrom} from "xstate";
import {Client, createDrMachine, DrClient, DrConfig, DrContext, Issuer} from "../machines/oidc-client/oidc_dr_machine";
import {AppAuthJs} from "../machines/AppAuth";
import {DCRClient} from "../components/DCR";

export const OidcContext = createContext<Services>({} as Services);
export type  OidcProviderProps = React.PropsWithChildren
const loaderSelector = (state: any) => state.context.current;
const authProviderSelector = (state: any) => state.context.auth;
declare type AuthProvider=DrClient & { service: AppAuthJs } & AuthMachineContext;
function createAuthMachineFromDr(notificationsService: NotificationsService) {
    const showMessage = (message: string) => {
        // @ts-ignore
        notificationsService.send({
            type: 'ADD',
            notification: {
                group: "app-auth",
                title: message,
                payload: {},
                icon: 'login',
                severity: 'info',
                id: generateUniqueID()
            }
        });

        function generateUniqueID() {
            // Math.random should be unique because of its seeding algorithm.
            // Convert it to base 36 (numbers + letters), and grab the first 9 characters
            // after the decimal.
            return '_' + Math.random().toString(36).substr(2, 9);
        }

    }
    const authMachine = (drClient: DrClient) => {
        const client = drClient.client.metadata;
        const issuer = drClient.issuer.metadata;
        const ctx = {
            ...drClient, service: new AppAuthJs(issuer, {
                client_id: client.client_id,
                scope: drClient.config.scope || client.scope,
                redirect_uri: drClient?.config.redirect_uri || client.redirect_uris[0],
                response_type: 'code',
                state: 'dcr_web_client',
                extras: {'prompt': 'none', 'access_type': 'offline'}

            }, notificationsService, showMessage)
        };

        return createAuthMachine<AuthProvider>(ctx, client.client_id)
            .withConfig({
                services:
                    {
                        loader: (context, _: any) => {
                            return new Promise<AppAuthJs>((resolve, reject) => {
                                    resolve(context.service)
                                }
                            )
                        },
                        check: (context, event) => context.service.checkForAuthorizationResponse(),
                        login: (context, _: any) => {
                           return context.service.makeAuthorizationRequest();
                        },
                        token:context => context.service.makeTokenRequest()

                    }
            })
    }

    return authMachine;
}

export function OidcProvider({children, ...props}: OidcProviderProps) {

     const [, , snackbarService] = useMachine(snackbarMachine);
    const [, , notificationsService] = useMachine(notificationMachine);
    const [, , authService] = useMachine(() => createAuthMachine<any>({}));

    const {service} = useHydrate(providersMachineWithDefaults(createAuthMachineFromDr(notificationsService)), (state: any) => {
        return {
            ...state,

            context: {
                ...state.context,
                current: state.context.current && !state.context.current.send && hydrateMachine(createDrMachine(state.context.provider))
            }

        }
    });

    const current = useSelector(service, loaderSelector);
    const authProvider = useSelector(service, authProviderSelector);
 
    return <OidcContext.Provider
        value={{providers: service, snackbar: snackbarService, notificationsService, authService, current,authProvider }}>
        {children}
    </OidcContext.Provider>
}


export type Services =
    {
        notificationsService: NotificationsService,
        snackbar: SnackbarService,
        providers: ProviderService,
        authService: OidcService,
        authProvider?: ActorRef<AuthMachine<AuthProvider>>,
        current?: DrActor
    }