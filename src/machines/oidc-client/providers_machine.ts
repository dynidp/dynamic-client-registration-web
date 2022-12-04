import {ActorRefFrom, assign, createMachine, interpret, InterpreterFrom, send, spawn} from "xstate";
import {createDrMachine, DrConfig, DrContext} from "./oidc_dr_machine";
import {AnyRecord} from "../../models";
import {omit} from "lodash/fp";
import {appMachine} from "../appMachine";

export type DrActor = ActorRefFrom<typeof appMachine>;

export type OP = { authority: string, name: string, info: string, machine?: DrActor } & Partial<DrContext>;


declare type ProvidersMachineContext = {
    providers: { [key: string]: OP }
    provider?: OP
}


export const providersMachine =()=> createMachine<ProvidersMachineContext>({
    id: "provider",
  
    initial: "idle",

    states: {
        idle: {
            on: {
                always: [
                    {
                        cond: (ctx: ProvidersMachineContext, event) => (ctx.provider && true) || false,
                        target: 'selected'
                    },
                    {
                    cond: (ctx: ProvidersMachineContext, event) => (ctx.provider && true) || false,
                    actions: [send((ctx) => {
                        const provider = ctx.provider!;
                        return  { 
                            name: provider.name,
                            type: 'SELECT',
                        }
                    })]
                }]
            }
        },
      
        selected: {

            on: {
                always: [{
                    cond: (ctx: ProvidersMachineContext, event) => (!ctx.provider?.machine && true) || false,
                 
                    actions:['assignMachine']
                }]
            }
        },
        loaded: {}
    },

    on: {
        SELECT: {
            target: '.selected',
            actions: assign((context: any, event: Partial<OP> & {name:string}) => {
                // Use the existing subreddit actor if one already exists
                let provider = context.providers[event.name];
                
                if (provider?.machine) {
                    return {
                        ...context,
                        provider
                    };
                }
                const providerConfig={
                    ...provider, ...event 
                }

                provider = {
                    ...providerConfig,
                    machine: event.machine || spawn(createDrMachine(providerConfig),  {sync: true})
                }
                return {
                    providers: {
                        ...context.providers,
                        provider
                    },
                    provider
                };
            })
        }
    }
},

    {
        actions:{
            assignMachine: assign((ctx:any, event:any) => {
                let providerConfig= ctx.provider!;
                const machine= providerConfig.machine || spawn(createDrMachine(providerConfig), {sync: true});
                const provider = {
                    ...providerConfig,
                    machine: machine
                };
                return  {
                    ...ctx,
                    provider
                }
            })
        }
    }
    );


const redirect_uri = (provider:string)=>`${window.location.origin}/callback/${provider}`
const scope = "openid gigya_web";

const config =(provider:string)=> {return {
    client_name: "default-static-js-client-spa",
    redirect_uris: [redirect_uri(provider)],
    token_endpoint_auth_method: 'none',
    "grant_types": ["authorization_code"],
    "response_types": ["code token idToken"],
    "scope": scope,
    "initiate_login_uri": "https://dev-mea4uj8q.us.auth0.com/u/login"

}};

const defaults = {
    'gid.dynidp.com': {
        name: 'gid.dynidp.com',
        info: 'self-hosted',
        authority: 'https://fidm.eu1.gigya.com/oidc/op/v1.0/4_IIUXxExoyzTQFvliBbnXsA',
        config: config('gigya')
    },
    'login.dynidp.com': {
        name: 'login.dynidp.com',
        info: 'hosted',
        authority: 'https://gigya.login.dynidp.com/oidc/op/v1.0/4_DxFqHMTOAJNe9VmFvyO3Uw',
        config: config('gigya')

    } ,
    'auth0': {
        name: 'auth0',
        info: 'hosted',
        authority: 'https://dev-mea4uj8q.us.auth0.com/oidc',
        config: config('auth0')
    }
};
 const wthDefaults=providersMachine()
    .withContext({
        providers: defaults 
    });

 // interpret(wthDefaults)



export const providersMachineWithDefaults= wthDefaults;
export type ProviderService = InterpreterFrom<typeof providersMachine>;

// wthDefaults .transition("idle", {
//     type:'SELECT',
//     ...defaults["gid.dynidp.com"]
//
// });
