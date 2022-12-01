import {Machine, assign, interpret, send, Subscribable, Sender, InterpreterFrom} from "xstate";
import {AnyRecord} from "../../models";
import {oidc_discovery_service, oidc_dr_registration_service} from "./oidc_dr_service";

export interface Client extends Subscribable<{type:'CALLBACK'} | {type:'TOKEN'}| {type:'ERROR'}>{
    metadata: AnyRecord
}


export interface Issuer  {
    metadata?: AnyRecord

     
};
 

export type DrConfig = {
    redirect_uris?: string[],
    client_name: string
    
}& AnyRecord

const defaults= {
        client_name:"default-static-js-client-spa"

    };

export type DrContext = {name?: string;authority: string, client?: Client, issuer?: Issuer, error?: string, errorType?: string, config: DrConfig };
export const createDrMachine =({authority, config, name}:Pick<DrContext, "authority"> & {config?: DrConfig}& Pick<DrContext, "name">)=>{
    return Machine<DrContext>(
        {
            id: `${name || authority}`,
            initial: "discovering",
            context: {
                name: name,
                authority,
                issuer: undefined,
                client: undefined,
                error: undefined,
                errorType: undefined,
                config: {
                    ...defaults,
                    ...(config || {})
                }
            },

            on:{
                SET_CONFIG: {
                    actions: ["setConfig"],
                    target: "discovering"
                } ,
            },
            states: {
                init: {
                    on:{
                        '*':[
                            {
                                cond: (context, event) => typeof context.authority !== "undefined",

                                target:"discovering"
                            }
                        ]
                    }
                },
                discovering: {
                    invoke: {
                        src: 'oidc_discovery',
                        onDone: {actions: ["setIssuer"], target: "registering"},
                        onError: {target: "error"}
                    },
                    on: {
                        ERROR: "error",
                        ISSUER: {actions: ["setIssuer"], target: "issuer"}

                    },
                    entry: ["startDiscovering"],
                    exit: ["stopDiscovering"]
                },
                issuer: {
                    on: {
                        ERROR: "error",
                        REGISTER: "registering"
                    },
                    entry: ["startMetadata"],
                    exit: ["stopMetadata"]
                },
                registering: {
                    invoke: {
                        id: "dcr-service",
                        src: 'register',
                        data:{
                            registration_endpoint: (ctx:DrContext, event: {registration_endpoint?:string})=>event.registration_endpoint || ctx.issuer?.metadata?.registration_endpoint,
                            redirect_uris: (ctx:DrContext, event: {redirect_uris?:string[]})=>event.redirect_uris || ctx.config.redirect_uris,
                            client_name: (ctx:DrContext, event: {client_name?:string[]})=>event.client_name || ctx.config.client_name
                        },
                        onDone: {
                            target: "client",
                            actions:["setClient"]
                        },
                        onError: {
                            target: "error"
                        }
                    },
                    entry: ["startRegistering"],
                    exit: ["stopRegistering"]
                },
                client: {
                    entry: ["onClient", "saveToLocalStorage"],
                    on: {
                        "CLEAR":{
                            actions: ["clearClientFromContext", "clearLocalStorage"]
                        }
                    },
                    type:'final',
                    data:(ctx)=>{
                        client: ctx.client
                    }

                },
                error: {
                    entry: [
                        "saveErrorToContext",
                        "clearClientFromContext",
                        "clearLocalStorage"
                    ]
                }
            }
        },
        {
            services:{
                register: oidc_dr_registration_service,
                oidc_discovery: oidc_discovery_service
            },
            actions: {

                setIssuer: assign( {
                    issuer:(context, event) =>{
                        const {issuer} = event.data ? event.data : event;
                        return issuer;
                    }
                }),
                setClient: assign( {
                    client:(context, event) =>{
                        const {client} = event.data ? event.data : event;
                        return client;
                    }
                }),
                clearClientFromContext: assign(  {
                    client:(context, event) => undefined

                }),
                saveToLocalStorage: (context, event) => {
                    const {issuer, client} = context;

                    if (typeof localStorage !== "undefined") {
                        localStorage.setItem(
                            "useDr:issuer:metadata", JSON.stringify(issuer?.metadata || {})
                        );
                        localStorage.setItem(
                            "useDr:client:metadata", JSON.stringify(client?.metadata || {})
                        );
                    }
                },
                clearLocalStorage: () => {
                    if (typeof localStorage !== "undefined") {
                        localStorage.removeItem("useDr:issuer:metadata");
                        localStorage.removeItem("useDr:client:metadata");
                    }
                },
                saveErrorToContext: assign((context, event) => {
                    return {
                        errorType: event.data?.errorType || event.errorType,
                        error: event.data?.error || event.error || event
                    };
                }),
                setConfig:  assign( {
                    config:(context, event) =>{
                        return  {
                            ...context.config,
                            ...event
                        }
                    },
                }),
                setAuthority:  assign( {
                    authority: (context, event) =>{
                        return  event.authority ||context.authority
                    }
                }),


            }
        }
    );
}
export const drMachine =createDrMachine;
 // check localstorage and login as soon as this file loads
export function hydrateDrFromLocalStorage(send: any) {
    if (typeof localStorage !== "undefined") {
        const issMetadata= localStorage.getItem("dr:issuer:metadata");
        const issuer= issMetadata && JSON.parse(issMetadata);
        if(issuer){
            send("ISSUER", {issuer: issuer});
            const clientMetadata= localStorage.getItem("dr:client:metadata");
            if(clientMetadata){
                send("Client", {client: new issuer.Client(JSON.parse(clientMetadata))} )
            }

            }

    }
}

// export const drService = interpret(drMachine);
// drService.start();
//  hydrateDrFromLocalStorage(drService.send);
export type DrService= InterpreterFrom<typeof drMachine>