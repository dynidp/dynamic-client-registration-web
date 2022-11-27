import { actions, ContextFrom, EventFrom, send, SpawnedActorRef, EmittedFrom, ActorRefFrom} from "xstate";
import {User, IdToken, PortalApplication} from "../models";

const {log} = actions;


import {createModel} from "xstate/lib/model"
import Apps from "../components/Apps";

declare type AnyRecord = {
    [key: string]: any
}
declare type Error = AnyRecord | any;
export declare type Assets = AnyRecord[] | any;

export const appModel = createModel(
    {
        id: undefined as string | undefined,
        assets: undefined as Assets | undefined,
        action: undefined as string | undefined,
        error: undefined as Error | undefined,
        service: undefined as any | undefined,
        ["index" as string]: undefined as any | undefined
    },
    {
        events: {
            'FETCH': () => ({}),
            'FOUND': (assets: AnyRecord[]) => ({assets}),
            'ERROR': (error: Error) => ({error}),
            'OPEN': (action:any) => ({action}),

        },
    }
)
export const appMachine = appModel.createMachine(
    {
        predictableActionArguments: true,
        context: appModel.initialContext,
        initial: "fetchAssets",

        on: {
            FETCH: {
                target: "fetchAssets",

            },
            OPEN: {
                target: 'opening'
            }
        },
        states:
            {
                fetchAssets: {
                    invoke: {
                        id: "app-fetchAssets",
                        src: "fetchAssets",
                        data: {
                            appId: (ctx: { id: string }) => ctx.id
                        }
                    },
                    on: {
                        "FOUND": {
                            target: "withAssets",
                            actions: ['assignAssets'],
                        },
                        "ERROR": {
                            target: "noAssets",
                            actions: [
                                appModel.assign({
                                    error: (_: any, ev: { error: Error }) => ev.error,
                                }),
                            ],
                        },

                    },
                },

                withAssets: {
                    on: {
                        OPEN: {
                            target: 'opening'
                        }
                    },
                    entry: ['onAssets']
                },
                noAssets: {
                    entry: ['onNoAssets']
                },
                opening: {
                    entry: ['openEntry'],
                    invoke: {
                        src: "open",
                        data: {
                            action: (ctx: { action: string }, ev:{action:any}) => ev.action || ctx.action,
                            assets: (ctx: { assets: Assets }) => ctx.assets
                        },
                        onDone: 'opened',
                        onError: {target: 'error', actions: ['assignError']},
                    }
                },
                opened: {},
                error: {}
            }

    }, {
        actions: {
            assignAssets:
                appModel.assign({
                    assets: (_: any, ev: Assets) => ev.assets,
                })
        }
    }
)


export type AppMachine = typeof appMachine;
export type AppMachineContext = ContextFrom<AppMachine>;
// export type AuthMachineContext =typeof appModel.initialContext;
export type AppMachineEvents = EventFrom<AppMachine>;

export type AppService =  ActorRefFrom< typeof appMachine>;
