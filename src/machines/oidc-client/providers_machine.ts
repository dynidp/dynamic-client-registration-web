import {ActorRefFrom, AnyStateMachine, assign, createMachine, interpret, InterpreterFrom, send, spawn} from "xstate";
import {Client, createDrMachine, DrClient, DrConfig, DrContext, Issuer} from "./oidc_dr_machine";
import {AnyRecord} from "../../models";
import {omit} from "lodash/fp";
import {appMachine} from "../appMachine";
import {hydrateMachine} from "../../boot/hydrate";
import {AuthMachine, AuthMachineContext} from "../oidcProviderMachine";
import {AppAuthJs} from "../AppAuth";

export type DrActor = ActorRefFrom<typeof createDrMachine> | InterpreterFrom<typeof createDrMachine>;

export type OP = { authority: string, name: string, info: string } & Partial<DrContext>;





export const providersMachine =<AuthProvider extends AuthMachine<any> = AuthMachine<DrContext & AuthMachineContext>>(createAuthMachine: (context: DrClient)=> AuthProvider)=>{

    type ProvidersMachineContext = {
        providers: { [key: string]: OP }
        provider?: OP,
        current?: DrActor,
        auth?: InterpreterFrom<AuthProvider>
    }
    
  return   createMachine<ProvidersMachineContext>({
            id: "provider",
            predictableActionArguments:true,
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
                    always:{
                        target:'current'
                    }

                },
                current:{
                    entry:['assignLoader'],
                    invoke:{
                        src:'loadProvider',
                        onDone:  {actions: ['assignAuthProvider']}}


                }
            },

            on: {
                SELECT: {
                    target: '.selected',
                    actions: assign((context: any, event: Partial<OP> & {name:string}) => {
                        // Use the existing subreddit actor if one already exists
                        let exists = context.providers[event.name] ||{};

                        const provider={
                            ...exists, ...event
                        }

                        return {
                            ...context,
                            providers: {
                                ...context.providers,
                                [event.name] : provider
                            },
                            provider
                        };
                    })
                }
            }
        },

        {
            services:{
                loadProvider:(ctx:any)=>ctx.current!,
            },
            actions:{
                assignAuthProvider: assign((ctx:any, event:any, {data}: {data:DrClient}) => {
                    const machine=  spawn(createAuthMachine(data), {sync: true, name:data.name})

                    return  {
                        ...ctx,
                        auth:machine
                    }
                }),
                assignLoader: assign((ctx:any, event:any) => {
                    let providerConfig= ctx.provider!;
                    const machine=  spawn(hydrateMachine(createDrMachine(providerConfig)), {sync: true});
                    return  {
                        ...ctx,
                        current: machine
                     }
                })
            }
        }
    );
} 


const redirect_uri = (provider:string)=>`${window.location.origin}/callback/${provider}`
const scope = "openid gigya_web";

const config =(provider:string, extra?: AnyRecord)=> {return {
    client_name: "default-static-js-client-spa",
    redirect_uris: [redirect_uri(provider)],
    token_endpoint_auth_method: 'none',
    "grant_types": ["authorization_code"],
    "response_types": ["code token idToken"],
    "scope": scope,
     ...(extra ||{})
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
        config: config('auth0', {
            "initiate_login_uri": "https://dev-mea4uj8q.us.auth0.com/u/login" 
        })
    }
};


 // interpret(wthDefaults)



export const providersMachineWithDefaults =<AuthProvider extends AuthMachine<any>>(createAuthMachine: (context: DrClient)=> AuthProvider)=> {
    const wthDefaults=(machine:  ReturnType<typeof providersMachine<AuthProvider>>) =>
        machine.withContext({
            providers: defaults
        });
    return  wthDefaults(providersMachine<AuthProvider>(createAuthMachine))

 
};
export type ProviderService = InterpreterFrom<typeof providersMachine>;

// wthDefaults .transition("idle", {
//     type:'SELECT',
//     ...defaults["gid.dynidp.com"]
//
// });
