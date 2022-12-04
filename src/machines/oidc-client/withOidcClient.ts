import {createDrMachine} from "./oidc_dr_machine";
import {AnyEventObject, AnyInterpreter, assign, interpret, PayloadSender, Receiver, Sender, spawn} from "xstate";
import {oidcMachine, OidcMachine} from "../oidcProviderMachine";
import {AppAuthCallback} from "../clientMachineAppAuth";
import {tokenMachine} from "../tokenMachine";
import { RedirectRequestHandler } from "@openid/appauth";


const defaults = {
    authority: 'https://fidm.eu1.gigya.com/oidc/op/v1.0/4_IIUXxExoyzTQFvliBbnXsA', config: {
        client_name: "default-static-js-client-spa",
        redirect_uris: ['https://web.gid.dynidp.com/callback/gigya-login.html'],
        token_endpoint_auth_method: 'none',
        "grant_types": ["authorization_code"],
        "response_types": null,
        "scope": "gigya_web",

    }
};

// @ts-ignore
export const withDynamicOidcClient = (authMachine: OidcMachine) => authMachine
  

    .withConfig({
        services: {
            oidc_client: (ctx, event) => ctx.oidc_client,
            login_service: (ctx, event) => ctx.login_service

        },

        actions: {

            assignOidcClient: assign({
                oidc_client: (context, event) => {
                    return spawn(createDrMachine({...defaults, config: {...defaults.config, ...context.config}}),{ sync: true })
                }

            }),
     
            assignLoginClient: assign({
                login_service: (context, event) =>spawn(tokenMachine)
                //     (send,receiver)=>{
                //         // const authorizationHandler = new RedirectRequestHandler();
                //         // authorizationHandler.performAuthorizationRequest({
                //         //     ...context.oidc_client.context.issuer.config
                //         // }, )
                //        new AppAuthCallback(context.oidc_client.state?.context?.client?.metadata, context.oidc_client.state?.context?.issuer?.metadata, send, receiver)
                // })

            })
        }
    });


export interface CallbackParamsType {
    access_token?: string;
    code?: string;
    error?: string;
    error_description?: string;
    error_uri?: string;
    expires_in?: string;
    id_token?: string;
    state?: string;
    token_type?: string;
    session_state?: string;
    response?: string;

    [key: string]: unknown;
}

export type CallbackInput = string;
