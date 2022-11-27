import {AnyRecord, PortalApplication, User} from "../models";
import {AppMachine, appModel, AppService, Assets} from "./appMachine";
import {GigyaSdk} from "../gigya/gigyaLoadMachine";
import {gigyaAppMachine} from "./gigyaAppMachine";
import { ActorRef, spawn } from "xstate";

export   type PortalApplicationRef = PortalApplication & {
    machine: AppService
}
// export   type PortalApplicationRef =   PortalApplication & ActorRef<AppMachine>;



function appWithRole(app: AppMachine) {
    return app.withConfig({
        actions: {
            // assignAssets: appModel.assign({
            //     assets: (_: any, ev: Assets) => toApps(ev.assets),
            // }),
            onAssets: appModel.assign({
                roles: (ctx: { assets: Assets, service: GigyaSdk }, ev: any) =>
                    toFn(ctx.assets)
                ,
            })
        }
    });
}

/*function getWithContext(app) {
    return appMachine.withContext(
        {
            ...appMachine.context,
            app: app,
            id: app.id
        }
    );
}*/

function enrichLocalSettings(service: GigyaSdk) {
    return (app:PortalApplication)=>{
        console.log(app.name.replaceAll( " ", "_"))
        console.log(app.name)

        return {
            ...app,
             ...(service.config[app.name] || service.config[app.name.replaceAll( " ", "_")])
        
    }}
    
}

export function portalApplicationMachine(app: AppMachine): AppMachine {
    return app.withConfig({
        actions: { 
            onAssets: appModel.assign({
                apps: (ctx: { assets: Assets, service: GigyaSdk , user:User}, ev: any) =>
                    toApps(ctx.assets)
                        .map(enrichLocalSettings(ctx.service))
                        .map(app => {
                            return { 
                                machine:spawn(appWithRole(gigyaAppMachine(app, ctx)), {sync: true, name:app.name}),
                                ...app
                            } ;
                            
                        })

                ,
            })
        }
    })

}

type ArrayOrValue<T> = T | Iterable<T>;

function toApps(assets: {
    type: string, path: string, attributes: {
        icon?: ArrayOrValue<string> | undefined,
        App: ArrayOrValue<string>,
        info?: ArrayOrValue<string> | undefined
    } & AnyRecord
}[]): PortalApplication[] {


    const portalApps= assets.filter(a => a.type === 'Portal Applications').map(e => {

        return {name: e.path, id: firstOrValue(e.attributes.App), icon: firstOrValue(e.attributes.icon)}

    });

    const delegated = assets
        .filter(e => e.attributes['Response Value'] && firstOrValue(e.attributes['Response Value'])  ==='delegated_admin')
        .map(e => {
            return {name: "Delegated Admin", id: "PBZHUUUXRMQMHMBK8AHX",  icon: firstOrValue(e.attributes.icon) || 'delegated.png'}}
        );

    return [...portalApps, ...delegated]
}

function toFn(assets: {
    type: string, path: string, attributes: AnyRecord
}[]): { type: string, role: string }[] {
    return assets.filter(a => a.type.endsWith('Role')).map(e => {
        return {role: e.path, type: e.type}

    })
}

function firstOrValue<T>(value: ArrayOrValue<T>): T {
    return value instanceof Array<T> ? value[0] : value;
}